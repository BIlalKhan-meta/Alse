import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AgoraUIKit, {
  ChannelProfileType,
  ClientRoleType,
  Layout,
} from 'agora-rn-uikit';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  AGORA_APP_ID,
  AGORA_TEMP_TOKEN,
  AGORA_TOKEN_CHANNEL,
} from '../../config/agora';
import {selectUserProfile} from '../../store/slices/authSlice';
import chatSocket from '../../services/chatSocket';
import {connectSocket} from '../../utils/socket';
import agoraRtmCallService from '../../services/agoraRtmCallService';
import ringbackService from '../../services/ringbackService';
import type {AgoraCallRouteParams} from '../../types/agoraCall';
import {GetCallRtcToken} from '../../api/liveStream';
import {ensureCameraPermission} from '../../utils/helpers';

const VideoCall = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const params = (route.params || {}) as AgoraCallRouteParams;

  const {
    chatId,
    callId,
    otherUserId,
    isReceiver = false,
  } = params;

  const currentUserId = user?.id != null ? String(user.id) : '';
  const fallbackUid =
    typeof user?.id === 'number' ? user.id : Number(user?.id) || 0;

  const [hasPermission, setHasPermission] = useState(false);
  const [callActive, setCallActive] = useState(true);
  const [rtcToken, setRtcToken] = useState<string | undefined>(
    AGORA_TEMP_TOKEN || undefined,
  );
  const [rtcUid, setRtcUid] = useState<number>(fallbackUid);
  const [tokenReady, setTokenReady] = useState(Boolean(AGORA_TEMP_TOKEN));
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(!isReceiver);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);

  const remoteUserJoinedRef = useRef(false);
  const channelJoinedRef = useRef(false);
  const hasRemoteEverJoinedThisCallRef = useRef(false);
  const rtmInvitationAcceptedRef = useRef(false);
  const noAnswerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;

  const [callAccepted, setCallAccepted] = useState(
    () => !isReceiver && agoraRtmCallService.isLocalInvitationAccepted(),
  );

  useEffect(() => {
    if (isReceiver) {
      return;
    }
    if (
      agoraRtmCallService.isLocalInvitationAccepted() &&
      !callAccepted
    ) {
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
        remoteUserJoinedRef.current ||
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
    if (remoteUserJoined) {
      remoteUserJoinedRef.current = true;
      hasRemoteEverJoinedThisCallRef.current = true;
    }
  }, [remoteUserJoined]);

  const channelName = AGORA_TEMP_TOKEN
    ? AGORA_TOKEN_CHANNEL
    : `chat_${chatId}`;

  useEffect(() => {
    let cancelled = false;
    if (AGORA_TEMP_TOKEN || !chatId) {
      setTokenReady(Boolean(AGORA_TEMP_TOKEN) || !chatId);
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
          typeof uidRaw === 'number'
            ? uidRaw
            : Number(uidRaw) || fallbackUid;
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

  const connectionData = useMemo(
    () => ({
      appId: AGORA_APP_ID,
      channel: channelName,
      rtcToken: rtcToken,
      rtcUid: rtcUid > 0 ? rtcUid : undefined,
    }),
    [channelName, rtcToken, rtcUid],
  );

  const settings = useMemo(
    () => ({
      layout: Layout.Pin,
      mode: ChannelProfileType.ChannelProfileCommunication,
      role: ClientRoleType.ClientRoleBroadcaster,
      activeSpeaker: true,
      disableRtm: true,
    }),
    [],
  );

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
    const cleanupFn = chatSocket.onMessageReceived(String(chatId), (data: any) => {
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
    });
    return () => cleanupFn?.();
  }, [chatId, callActive, isReceiver, currentUserId]);

  const rtcCallbacks = useMemo(
    () => ({
      EndCall: handleEndCall,
      JoinChannelSuccess: () => {
        channelJoinedRef.current = true;
        setTimeout(() => setIsConnecting(false), 0);
      },
      UserJoined: () => {
        remoteUserJoinedRef.current = true;
        hasRemoteEverJoinedThisCallRef.current = true;
        rtmInvitationAcceptedRef.current = true;
        if (noAnswerTimeoutRef.current) {
          clearTimeout(noAnswerTimeoutRef.current);
          noAnswerTimeoutRef.current = null;
        }
        setRemoteUserJoined(true);
        setIsConnecting(false);
      },
      UserOffline: () => {
        remoteUserJoinedRef.current = false;
        setRemoteUserJoined(false);
        if (hasRemoteEverJoinedThisCallRef.current) {
          setCallActive(false);
          if (navigationRef.current?.canGoBack()) {
            navigationRef.current.goBack();
          }
        }
      },
    }),
    [handleEndCall],
  );

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

  if (tokenError) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.permissionText}>{tokenError}</Text>
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.agoraWrap}>
        <AgoraUIKit
          connectionData={connectionData}
          settings={settings}
          rtcCallbacks={rtcCallbacks}
        />
      </View>
      {(isConnecting || !remoteUserJoined) && !isReceiver ? (
        <View style={styles.connectingOverlay} pointerEvents="box-none">
          <Text style={styles.callingTitle}>Calling</Text>
          <Text style={styles.callingName}>{peerLabel}</Text>
          <ActivityIndicator
            size="large"
            color="#fff"
            style={styles.callingSpinner}
          />
          <Text style={styles.connectingText}>
            Waiting for {peerLabel} to answer…
          </Text>
        </View>
      ) : null}
      {isConnecting && isReceiver ? (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  agoraWrap: {flex: 1, backgroundColor: '#000'},
  permissionText: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
  },
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    zIndex: 10,
    paddingHorizontal: 24,
  },
  callingTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    marginBottom: 8,
  },
  callingName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  callingSpinner: {marginBottom: 16},
  connectingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VideoCall;
