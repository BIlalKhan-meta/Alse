import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Mic, MicOff, PhoneOff, Volume2, VolumeX} from 'lucide-react-native';
import {selectUserProfile} from '../../store/slices/authSlice';
import chatSocket from '../../services/chatSocket';
import {connectSocket} from '../../utils/socket';
import agoraRtmCallService from '../../services/agoraRtmCallService';
import ringbackService from '../../services/ringbackService';
import type {AgoraCallRouteParams} from '../../types/agoraCall';
import {GetCallRtcToken} from '../../api/liveStream';
import {ensureMicrophonePermission} from '../../utils/helpers';
import useAgoraCallSession from '../../hooks/useAgoraCallSession';

const AudioCall = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const params = (route.params || {}) as AgoraCallRouteParams & {
    name?: string;
    image?: string;
  };

  const {
    chatId,
    callId,
    userName,
    otherUserId,
    isReceiver = false,
    name,
    image,
  } = params;

  const displayName = name || userName || 'Call';
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

  const handleEndCall = useCallback(() => {
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
        callType: 'audio' as const,
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
    isVideo: false,
    enabled: hasPermission && tokenReady && callActive,
    onRemoteJoined,
    onRemoteLeft,
    fetchToken: fetchRtcToken,
  });

  const {
    joined,
    primaryRemoteUid,
    micMuted,
    speakerOn,
    error: sessionError,
    toggleMic,
    toggleSpeaker,
  } = session;

  const remoteUserJoined = primaryRemoteUid !== null;

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
          callType: 'audio' as const,
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
        console.warn('[AudioCall] token fetch failed', err);
        if (!cancelled) {
          setTokenError('Could not get call token');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [chatId, fallbackUid]);

  useEffect(() => {
    const req = async () => {
      try {
        const granted = await ensureMicrophonePermission();
        setHasPermission(granted);
      } catch (e) {
        console.warn(e);
        setHasPermission(false);
      }
    };
    req();
  }, []);

  useEffect(() => {
    if (!chatId || !callActive) {
      return;
    }
    connectSocket();
    const t0 = Date.now();
    const endPeerCall = () => {
      setCallActive(false);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    };
    const cleanupEnded = chatSocket.onCallEndedByChat(
      String(chatId),
      (data: any) => {
        if (Date.now() - t0 < 2000) {
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
        if (Date.now() - t0 < 2000) {
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
        if (Date.now() - t0 < 2000) {
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.permissionText}>
          Microphone permission is required.
        </Text>
      </SafeAreaView>
    );
  }

  if (!callActive) {
    return null;
  }

  const blockingError = tokenError || sessionError;
  if (blockingError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorWrap}>
          <Text style={styles.permissionText}>{blockingError}</Text>
          <TouchableOpacity
            style={[styles.ctrlBtn, styles.endBtn]}
            onPress={handleEndCall}>
            <PhoneOff size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!tokenReady || !rtcToken) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.content}>
        <View style={styles.avatarBlock}>
          {image ? (
            <Image source={{uri: image}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]}>
              <Text style={styles.avatarTxt}>
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <Text style={styles.nameTxt}>{displayName}</Text>
          <Text style={styles.statusTxt}>
            {!joined
              ? 'Connecting...'
              : remoteUserJoined
                ? 'Voice call'
                : isReceiver
                  ? 'Voice call'
                  : 'Calling...'}
          </Text>
        </View>
      </View>
      <View style={styles.controls}>
        <View style={styles.ctrlWrap}>
          <TouchableOpacity
            style={[styles.ctrlBtn, micMuted && styles.ctrlBtnActive]}
            onPress={toggleMic}>
            {micMuted ? (
              <MicOff size={24} color="#fff" />
            ) : (
              <Mic size={24} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.ctrlLbl}>{micMuted ? 'Unmute' : 'Mute'}</Text>
        </View>
        <View style={styles.ctrlWrap}>
          <TouchableOpacity
            style={[styles.ctrlBtn, speakerOn && styles.ctrlBtnActive]}
            onPress={toggleSpeaker}>
            {speakerOn ? (
              <Volume2 size={24} color="#fff" />
            ) : (
              <VolumeX size={24} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.ctrlLbl}>Speaker</Text>
        </View>
        <View style={styles.ctrlWrap}>
          <TouchableOpacity
            style={[styles.ctrlBtn, styles.endBtn]}
            onPress={handleEndCall}>
            <PhoneOff size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.ctrlLbl}>End</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  permissionText: {color: '#fff', textAlign: 'center', padding: 16},
  errorWrap: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  connectingText: {color: '#fff', marginTop: 16, fontSize: 18},
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarBlock: {alignItems: 'center', marginBottom: 40},
  avatar: {width: 120, height: 120, borderRadius: 60, marginBottom: 20},
  avatarPh: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: {fontSize: 48, color: '#fff', fontWeight: '700'},
  nameTxt: {fontSize: 24, color: '#fff', fontWeight: '700', marginBottom: 8},
  statusTxt: {fontSize: 16, color: '#aaa'},
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  ctrlWrap: {alignItems: 'center'},
  ctrlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlBtnActive: {backgroundColor: 'rgba(255,255,255,0.4)'},
  ctrlLbl: {color: '#fff', marginTop: 6, fontSize: 12},
  endBtn: {backgroundColor: '#e5342b'},
});

export default AudioCall;
