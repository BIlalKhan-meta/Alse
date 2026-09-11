import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  Mic,
  MicOff,
  PhoneOff,
  SwitchCamera,
  Video as VideoIcon,
  VideoOff,
} from 'lucide-react-native';
import {selectUserProfile} from '../../store/slices/authSlice';
import chatSocket from '../../services/chatSocket';
import {connectSocket} from '../../utils/socket';
import agoraRtmCallService from '../../services/agoraRtmCallService';
import ringbackService from '../../services/ringbackService';
import type {AgoraCallRouteParams} from '../../types/agoraCall';
import {GetCallRtcToken} from '../../api/liveStream';
import {ensureCameraPermission} from '../../utils/helpers';
import useAgoraCallSession from '../../hooks/useAgoraCallSession';
import AgoraVideoView from '../../components/AgoraVideoView';

const VideoCall = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const params = (route.params || {}) as AgoraCallRouteParams & {
    name?: string;
  };

  const {chatId, callId, otherUserId, isReceiver = false} = params;

  const currentUserId = user?.id != null ? String(user.id) : '';
  const fallbackUid =
    typeof user?.id === 'number' ? user.id : Number(user?.id) || 0;

  const [hasPermission, setHasPermission] = useState(false);
  const [callActive, setCallActive] = useState(true);
  const [rtcToken, setRtcToken] = useState<string | null>(null);
  const [rtcUid, setRtcUid] = useState<number>(fallbackUid);
  const [tokenReady, setTokenReady] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const hasRemoteEverJoinedThisCallRef = useRef(false);
  const rtmInvitationAcceptedRef = useRef(false);
  const noAnswerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;

  const channelName = chatId ? `chat_${chatId}` : null;

  const [callAccepted, setCallAccepted] = useState(
    () => !isReceiver && agoraRtmCallService.isLocalInvitationAccepted(),
  );

  const handleEndCall = useCallback(async () => {
    setCallActive(false);
    const unansweredCancel =
      !isReceiver &&
      !hasRemoteEverJoinedThisCallRef.current &&
      !rtmInvitationAcceptedRef.current;

    if (unansweredCancel) {
      agoraRtmCallService.cancelLocalInvitation().catch(() => {});
    }
    connectSocket();
    if (chatId && chatSocket.isSocketConnected()) {
      const payload = {
        chat_id: chatId,
        callId: callId || `ended_${Date.now()}`,
        userId: currentUserId,
        callType: 'video' as const,
      };
      if (unansweredCancel) {
        chatSocket.sendCallCancelToChat(payload);
      }
      chatSocket.sendCallEndedToChat(payload);
      if (otherUserId) {
        chatSocket.sendCallEnded({
          callId: payload.callId,
          userId: currentUserId,
          otherUserId: String(otherUserId),
        });
      }
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation, callId, otherUserId, currentUserId, chatId, isReceiver]);

  const fetchRtcToken = useCallback(async (): Promise<string | null> => {
    if (!chatId) {
      return null;
    }
    const res: any = await GetCallRtcToken(`chat_${chatId}`);
    const data = res?.data?.data ?? res?.data ?? {};
    const token =
      data?.agora_token ||
      data?.token ||
      data?.rtcToken ||
      (typeof data === 'string' ? data : null);
    return typeof token === 'string' && token.length > 0 ? token : null;
  }, [chatId]);

  const onRemoteJoined = useCallback(() => {
    hasRemoteEverJoinedThisCallRef.current = true;
    rtmInvitationAcceptedRef.current = true;
    setCallAccepted(true);
    if (noAnswerTimeoutRef.current) {
      clearTimeout(noAnswerTimeoutRef.current);
      noAnswerTimeoutRef.current = null;
    }
  }, []);

  const onRemoteLeft = useCallback(() => {
    if (hasRemoteEverJoinedThisCallRef.current) {
      setCallActive(false);
      if (navigationRef.current?.canGoBack()) {
        navigationRef.current.goBack();
      }
    }
  }, []);

  const session = useAgoraCallSession({
    channel: channelName,
    token: rtcToken,
    uid: rtcUid,
    isVideo: true,
    enabled: hasPermission && tokenReady && callActive,
    onRemoteJoined,
    onRemoteLeft,
    fetchToken: fetchRtcToken,
  });

  const {
    joined,
    primaryRemoteUid,
    remoteVideoOff,
    micMuted,
    cameraOff,
    error: sessionError,
    toggleMic,
    toggleCamera,
    switchCamera,
    onLocalViewLayout,
  } = session;

  const remoteUserJoined = primaryRemoteUid !== null;
  const hintedRemoteUid = Number(otherUserId);
  // RTC uid is the authenticated user id. Once the native connection is
  // confirmed, this route param is a safe rendering fallback for Android
  // devices that carry media but drop onUserJoined/video-state callbacks.
  const renderRemoteUid =
    primaryRemoteUid ??
    (joined &&
    Number.isSafeInteger(hintedRemoteUid) &&
    hintedRemoteUid > 0 &&
    hintedRemoteUid !== rtcUid
      ? hintedRemoteUid
      : null);

  useEffect(() => {
    if (isReceiver) {
      return;
    }
    if (agoraRtmCallService.isLocalInvitationAccepted() && !callAccepted) {
      rtmInvitationAcceptedRef.current = true;
      setCallAccepted(true);
    }
    const onAccepted = () => {
      rtmInvitationAcceptedRef.current = true;
      setCallAccepted(true);
      if (noAnswerTimeoutRef.current) {
        clearTimeout(noAnswerTimeoutRef.current);
        noAnswerTimeoutRef.current = null;
      }
    };
    const onRefused = () => {
      setCallActive(false);
      if (navigationRef.current?.canGoBack()) {
        navigationRef.current.goBack();
      }
    };
    agoraRtmCallService.setOnLocalInvitationAccepted(onAccepted);
    agoraRtmCallService.setOnLocalInvitationRefused(onRefused);
    return () => {
      agoraRtmCallService.setOnLocalInvitationAccepted(null);
      agoraRtmCallService.setOnLocalInvitationRefused(null);
    };
  }, [isReceiver, callAccepted]);

  // Ringback tone while the caller waits for answer
  useEffect(() => {
    if (isReceiver) {
      return;
    }
    const waiting = callActive && !callAccepted && !remoteUserJoined;
    if (waiting) {
      ringbackService.start();
    } else {
      ringbackService.stop();
    }
    return () => {
      ringbackService.stop();
    };
  }, [isReceiver, callActive, callAccepted, remoteUserJoined]);

  useEffect(() => {
    if (isReceiver) {
      return;
    }
    if (
      callAccepted ||
      agoraRtmCallService.isLocalInvitationAccepted() ||
      remoteUserJoined ||
      hasRemoteEverJoinedThisCallRef.current ||
      rtmInvitationAcceptedRef.current
    ) {
      if (noAnswerTimeoutRef.current) {
        clearTimeout(noAnswerTimeoutRef.current);
        noAnswerTimeoutRef.current = null;
      }
      return;
    }
    noAnswerTimeoutRef.current = setTimeout(() => {
      noAnswerTimeoutRef.current = null;
      if (
        hasRemoteEverJoinedThisCallRef.current ||
        rtmInvitationAcceptedRef.current ||
        agoraRtmCallService.isLocalInvitationAccepted()
      ) {
        return;
      }
      agoraRtmCallService.cancelLocalInvitation().catch(() => {});
      setCallActive(false);
      if (chatId && chatSocket.isSocketConnected()) {
        const payload = {
          chat_id: chatId,
          callId: callId || `timeout_${Date.now()}`,
          userId: currentUserId,
          callType: 'video' as const,
        };
        chatSocket.sendCallCancelToChat(payload);
        chatSocket.sendCallEndedToChat(payload);
        if (otherUserId) {
          chatSocket.sendCallEnded({
            callId: payload.callId,
            userId: currentUserId,
            otherUserId: String(otherUserId),
          });
        }
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }, 30000);
    return () => {
      if (noAnswerTimeoutRef.current) {
        clearTimeout(noAnswerTimeoutRef.current);
        noAnswerTimeoutRef.current = null;
      }
    };
  }, [
    isReceiver,
    callAccepted,
    remoteUserJoined,
    chatId,
    otherUserId,
    callId,
    currentUserId,
    navigation,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (!chatId) {
      return;
    }
    setTokenReady(false);
    setTokenError(null);
    GetCallRtcToken(`chat_${chatId}`)
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data ?? {};
        const token =
          data?.agora_token ||
          data?.token ||
          data?.rtcToken ||
          (typeof data === 'string' ? data : null);
        const uidRaw = data?.uid;
        const uid =
          typeof uidRaw === 'number' ? uidRaw : Number(uidRaw) || fallbackUid;
        if (cancelled) {
          return;
        }
        if (typeof token === 'string' && token.length > 0) {
          setRtcToken(token);
          if (uid > 0) {
            setRtcUid(uid);
          }
          setTokenReady(true);
        } else {
          setTokenError('Could not get call token');
        }
      })
      .catch(err => {
        console.warn('[VideoCall] token fetch failed', err);
        if (!cancelled) {
          setTokenError('Could not get call token');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [chatId, fallbackUid]);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const granted = await ensureCameraPermission({forVideo: true});
        setHasPermission(granted);
      } catch (e) {
        console.warn(e);
        setHasPermission(false);
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!chatId || !callActive) {
      return;
    }
    connectSocket();
    const listenerReadyAt = Date.now();
    const GRACE_MS = 2000;
    const endPeerCall = () => {
      setCallActive(false);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    };
    const cleanupEnded = chatSocket.onCallEndedByChat(
      String(chatId),
      (data: any) => {
        if (Date.now() - listenerReadyAt < GRACE_MS) {
          return;
        }
        const isOther =
          data?.userId && String(data.userId) !== String(currentUserId);
        if (isOther) {
          endPeerCall();
        }
      },
    );
    const cleanupDecline = chatSocket.onCallDeclineByChat(
      String(chatId),
      (data: any) => {
        if (Date.now() - listenerReadyAt < GRACE_MS) {
          return;
        }
        const isOther =
          data?.userId && String(data.userId) !== String(currentUserId);
        if (isOther) {
          endPeerCall();
        }
      },
    );
    const cleanupCancel = chatSocket.onCallCancelByChat(
      String(chatId),
      (data: any) => {
        if (Date.now() - listenerReadyAt < GRACE_MS) {
          return;
        }
        const isOther =
          data?.userId && String(data.userId) !== String(currentUserId);
        if (isOther) {
          endPeerCall();
        }
      },
    );
    return () => {
      cleanupEnded?.();
      cleanupDecline?.();
      cleanupCancel?.();
    };
  }, [chatId, callActive, currentUserId, navigation, isReceiver]);

  useEffect(() => {
    if (!chatId || !callActive || isReceiver) {
      return;
    }
    connectSocket();
    const cleanupFn = chatSocket.onMessageReceived(
      String(chatId),
      (data: any) => {
        try {
          const messageText = data?.message || data?.text || '';
          const parsed = JSON.parse(messageText);
          if (parsed?.type === 'call_declined') {
            const declinedBy = parsed?.declinedBy || '';
            if (declinedBy && String(declinedBy) !== String(currentUserId)) {
              setCallActive(false);
              if (navigationRef.current?.canGoBack()) {
                navigationRef.current.goBack();
              }
            }
          }
        } catch {
          /* ignore */
        }
      },
    );
    return () => cleanupFn?.();
  }, [chatId, callActive, isReceiver, currentUserId]);

  if (!chatId) {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
    return null;
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.permissionText}>
          Camera and microphone permission are required.
        </Text>
      </View>
    );
  }

  if (!callActive) {
    return null;
  }

  const blockingError = tokenError || sessionError;
  if (blockingError) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorWrap}>
          <Text style={styles.permissionText}>{blockingError}</Text>
          <TouchableOpacity
            style={[styles.ctrlBtn, styles.endBtn]}
            onPress={handleEndCall}>
            <PhoneOff size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!tokenReady || !rtcToken) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      </View>
    );
  }

  const peerLabel = String(params.userName || params.name || 'User');
  const waitingForAnswer = !isReceiver && !callAccepted && !remoteUserJoined;
  const showBlockingOverlay = !joined;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Remote (full screen). Mounted as soon as the peer is in the channel. */}
      {renderRemoteUid !== null && !remoteVideoOff ? (
        <AgoraVideoView
          key={`remote_${renderRemoteUid}`}
          uid={renderRemoteUid}
          style={styles.remoteVideo}
        />
      ) : (
        <View style={[styles.remoteVideo, styles.remotePlaceholder]}>
          {renderRemoteUid !== null ? (
            <>
              <VideoOff size={44} color="rgba(255,255,255,0.5)" />
              <Text style={styles.placeholderText}>
                {peerLabel} turned off their camera
              </Text>
            </>
          ) : null}
        </View>
      )}

      {/* Local preview stays mounted for the whole call: onLayout must fire
          before startPreview (the camera HAL needs an attached native view on
          MediaTek/TECNO), and unmounting it on a camera toggle would tear down
          Agora's canvas. Camera-off just covers it. */}
      <View style={styles.localWrap} pointerEvents="none">
        <AgoraVideoView
          uid={0}
          style={styles.localVideo}
          mirror
          overlay
          onLayout={onLocalViewLayout}
        />
        {cameraOff ? (
          <View style={[StyleSheet.absoluteFillObject, styles.localOff]}>
            <VideoOff size={20} color="rgba(255,255,255,0.6)" />
          </View>
        ) : null}
      </View>

      {showBlockingOverlay ? (
        <View style={styles.connectingOverlay} pointerEvents="box-none">
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      ) : null}

      {waitingForAnswer && joined ? (
        <View style={styles.callingBanner} pointerEvents="box-none">
          <Text style={styles.callingBannerText}>Calling {peerLabel}</Text>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      ) : null}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.ctrlBtn, micMuted && styles.ctrlBtnActive]}
          onPress={toggleMic}>
          {micMuted ? (
            <MicOff size={24} color="#fff" />
          ) : (
            <Mic size={24} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctrlBtn, cameraOff && styles.ctrlBtnActive]}
          onPress={toggleCamera}>
          {cameraOff ? (
            <VideoOff size={24} color="#fff" />
          ) : (
            <VideoIcon size={24} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={switchCamera}>
          <SwitchCamera size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctrlBtn, styles.endBtn]}
          onPress={handleEndCall}>
          <PhoneOff size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  remoteVideo: {...StyleSheet.absoluteFillObject, backgroundColor: '#000'},
  remotePlaceholder: {justifyContent: 'center', alignItems: 'center'},
  placeholderText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  localWrap: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 110,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111',
    zIndex: 5,
  },
  localVideo: {width: '100%', height: '100%'},
  localOff: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  permissionText: {
    color: '#fff',
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
  },
  errorWrap: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    zIndex: 10,
    paddingHorizontal: 24,
  },
  callingBanner: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 142,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 10,
  },
  callingBannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  connectingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  ctrlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlBtnActive: {backgroundColor: 'rgba(255,255,255,0.4)'},
  endBtn: {backgroundColor: '#e5342b'},
});

export default VideoCall;
