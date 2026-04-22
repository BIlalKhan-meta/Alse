import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
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
import type {AgoraCallRouteParams} from '../../types/agoraCall';

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

  const [hasPermission, setHasPermission] = useState(Platform.OS !== 'android');
  const [callActive, setCallActive] = useState(true);
  const [isConnecting, setIsConnecting] = useState(
    !isReceiver && Platform.OS !== 'ios',
  );
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
      if (chatId && otherUserId && chatSocket.isSocketConnected()) {
        chatSocket.sendCallEndedToChat({
          chat_id: chatId,
          callId: callId ?? '',
          userId: currentUserId,
          callType: 'video',
        });
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

  const connectionData = useMemo(
    () => ({
      appId: AGORA_APP_ID,
      channel: channelName,
      rtcToken: AGORA_TEMP_TOKEN ? AGORA_TEMP_TOKEN : undefined,
    }),
    [channelName],
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
      if (Platform.OS !== 'android') {
        setHasPermission(true);
        return;
      }
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        const cam =
          granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const mic =
          granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(cam && mic);
      } catch (e) {
        console.warn(e);
        setHasPermission(false);
      }
    };
    requestPermissions();
  }, []);

  const handleEndCall = useCallback(async () => {
    setCallActive(false);
    if (
      !isReceiver &&
      !hasRemoteEverJoinedThisCallRef.current &&
      !rtmInvitationAcceptedRef.current
    ) {
      agoraRtmCallService.cancelLocalInvitation().catch(() => {});
    }
    connectSocket();
    if (callId && otherUserId && chatSocket.isSocketConnected()) {
      chatSocket.sendCallEndedToChat({
        chat_id: chatId,
        callId,
        userId: currentUserId,
        callType: 'video',
      });
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
    const cleanupFn = chatSocket.onCallEndedByChat(String(chatId), (data: any) => {
      if (Date.now() - listenerReadyAt < GRACE_MS) {
        return;
      }
      const isOther =
        data?.userId && String(data.userId) !== String(currentUserId);
      const dataCallId = data?.callId || '';
      const ourCallId = callId || '';
      const same = !ourCallId || !dataCallId || dataCallId === ourCallId;
      if (isOther && same) {
        setCallActive(false);
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }
    });
    return () => cleanupFn?.();
  }, [chatId, callId, callActive, currentUserId, navigation]);

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

  if (!hasPermission && Platform.OS === 'android') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.permissionText}>
          Camera and microphone permission are required.
        </Text>
      </SafeAreaView>
    );
  }

  if (!callActive) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {isConnecting ? (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      ) : null}
      <AgoraUIKit
        connectionData={connectionData}
        settings={settings}
        rtcCallbacks={rtcCallbacks}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  connectingText: {color: '#fff', marginTop: 16, fontSize: 18},
});

export default VideoCall;
