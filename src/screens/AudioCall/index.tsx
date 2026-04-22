import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  Layout,
} from 'agora-rn-uikit';
import {PropsProvider} from 'agora-rn-uikit/src/Contexts/PropsContext';
import RtcConfigure from 'agora-rn-uikit/src/RtcConfigure';
import {MaxUidConsumer} from 'agora-rn-uikit/src/Contexts/MaxUidContext';
import EndCall from 'agora-rn-uikit/src/Controls/Local/EndCall';
import RtcContext from 'agora-rn-uikit/src/Contexts/RtcContext';
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

const VideoDisabler: React.FC<{children: React.ReactNode}> = ({children}) => {
  const rtcContext = useContext(RtcContext);
  const hasDisabledRef = useRef(false);

  useEffect(() => {
    const disableVideo = async () => {
      if (rtcContext?.RtcEngine && !hasDisabledRef.current) {
        try {
          await rtcContext.RtcEngine.enableLocalVideo(false);
          rtcContext.RtcEngine.muteLocalVideoStream(true);
          hasDisabledRef.current = true;
          return true;
        } catch {
          return false;
        }
      }
      return false;
    };
    disableVideo().then(ok => {
      if (!ok) {
        const t = setTimeout(() => disableVideo(), 100);
        const iv = setInterval(() => {
          disableVideo().then(success => {
            if (success) {
              clearInterval(iv);
            }
          });
        }, 200);
        return () => {
          clearTimeout(t);
          clearInterval(iv);
        };
      }
    });
  }, [rtcContext?.RtcEngine]);

  return <>{children}</>;
};

const RemoteUserDetector: React.FC<{
  onRemoteUserJoined: () => void;
  onRemoteUserLeft: () => void;
}> = ({onRemoteUserJoined, onRemoteUserLeft}) => {
  const hasNotifiedJoinRef = useRef(false);
  return (
    <MaxUidConsumer>
      {maxUsers => {
        const remoteUsers = maxUsers.filter(u => u.uid !== 'local');
        const hasRemote = remoteUsers.length > 0;
        if (hasRemote && !hasNotifiedJoinRef.current) {
          hasNotifiedJoinRef.current = true;
          setTimeout(() => onRemoteUserJoined(), 0);
        }
        if (!hasRemote && hasNotifiedJoinRef.current) {
          hasNotifiedJoinRef.current = false;
          setTimeout(() => onRemoteUserLeft(), 0);
        }
        return null;
      }}
    </MaxUidConsumer>
  );
};

const AudioMuteButton: React.FC = () => {
  const rtcContext = useContext(RtcContext);
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = useCallback(async () => {
    if (!rtcContext?.RtcEngine) {
      return;
    }
    try {
      const next = !isMuted;
      await rtcContext.RtcEngine.muteLocalAudioStream(next);
      setIsMuted(next);
    } catch (e) {
      console.warn(e);
    }
  }, [rtcContext?.RtcEngine, isMuted]);

  return (
    <View style={localStyles.controlBtnWrap}>
      <TouchableOpacity
        style={[localStyles.controlBtn, isMuted && localStyles.controlBtnMuted]}
        onPress={toggleMute}>
        <Text style={localStyles.controlBtnText}>{isMuted ? '🔇' : '🎤'}</Text>
      </TouchableOpacity>
      <Text style={localStyles.controlLbl}>{isMuted ? 'Unmute' : 'Mute'}</Text>
    </View>
  );
};

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
          callType: 'audio',
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

  const handleRemoteUserDetected = useCallback(() => {
    remoteUserJoinedRef.current = true;
    hasRemoteEverJoinedThisCallRef.current = true;
    rtmInvitationAcceptedRef.current = true;
    setCallAccepted(true);
    setRemoteUserJoined(true);
    setIsConnecting(false);
    if (noAnswerTimeoutRef.current) {
      clearTimeout(noAnswerTimeoutRef.current);
      noAnswerTimeoutRef.current = null;
    }
  }, []);

  const handleRemoteUserLeft = useCallback(() => {
    setRemoteUserJoined(false);
    if (hasRemoteEverJoinedThisCallRef.current) {
      setCallActive(false);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [navigation]);

  const channelName = chatId ? `chat_${chatId}` : AGORA_TOKEN_CHANNEL;

  const rtcProps = useMemo(
    () => ({
      appId: AGORA_APP_ID,
      channel: channelName,
      token: AGORA_TEMP_TOKEN || undefined,
      uid: 0,
      layout: Layout.Pin,
      mode: ChannelProfileType.ChannelProfileCommunication,
      role: ClientRoleType.ClientRoleBroadcaster,
      activeSpeaker: true,
      disableRtm: true,
    }),
    [channelName],
  );

  useEffect(() => {
    const req = async () => {
      if (Platform.OS !== 'android') {
        setHasPermission(true);
        return;
      }
      try {
        const g = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        setHasPermission(g === PermissionsAndroid.RESULTS.GRANTED);
      } catch (e) {
        console.warn(e);
        setHasPermission(false);
      }
    };
    req();
  }, []);

  const handleEndCall = useCallback(() => {
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
        callType: 'audio',
      });
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation, callId, otherUserId, currentUserId, chatId, isReceiver]);

  const callbacks = useMemo(
    () => ({
      EndCall: handleEndCall,
      JoinChannelSuccess: () => {
        channelJoinedRef.current = true;
        setTimeout(() => setIsConnecting(false), 0);
      },
      RemoteUserJoined: handleRemoteUserDetected,
      UserOffline: () => {
        setRemoteUserJoined(false);
      },
    }),
    [handleEndCall, handleRemoteUserDetected],
  );

  const agoraProps = useMemo(
    () => ({rtcProps, callbacks}),
    [rtcProps, callbacks],
  );

  useEffect(() => {
    if (!chatId || !callActive) {
      return;
    }
    connectSocket();
    const t0 = Date.now();
    const cleanupFn = chatSocket.onCallEndedByChat(String(chatId), (data: any) => {
      if (Date.now() - t0 < 2000) {
        return;
      }
      const isOther =
        data?.userId && String(data.userId) !== String(currentUserId);
      const dId = data?.callId || '';
      const ours = callId || '';
      const same = !ours || !dId || dId === ours;
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
          Microphone permission is required.
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
      <PropsProvider value={agoraProps}>
        <RtcConfigure>
          <RemoteUserDetector
            onRemoteUserJoined={handleRemoteUserDetected}
            onRemoteUserLeft={handleRemoteUserLeft}
          />
          <VideoDisabler>
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
                  {isConnecting ? 'Connecting...' : 'Voice call'}
                </Text>
              </View>
              <MaxUidConsumer>
                {maxUsers => {
                  const rem = maxUsers.filter(u => u.uid !== 'local');
                  if (rem.length > 0) {
                    return (
                      <Text style={styles.partTxt}>
                        {rem.length} on call
                      </Text>
                    );
                  }
                  return null;
                }}
              </MaxUidConsumer>
            </View>
            <View style={styles.controls}>
              <AudioMuteButton />
              <EndCall />
            </View>
          </VideoDisabler>
        </RtcConfigure>
      </PropsProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  permissionText: {flex: 1, color: '#fff', textAlign: 'center', padding: 16},
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
  partTxt: {color: '#888', marginTop: 12},
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
});

const localStyles = StyleSheet.create({
  controlBtnWrap: {alignItems: 'center'},
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnMuted: {backgroundColor: '#622'},
  controlBtnText: {fontSize: 22},
  controlLbl: {color: '#fff', marginTop: 6, fontSize: 12},
});

export default AudioCall;
