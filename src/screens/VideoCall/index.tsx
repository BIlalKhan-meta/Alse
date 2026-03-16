import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ChannelProfileType,
  ClientRoleType,
  Layout,
} from 'agora-rn-uikit';
import {PropsProvider} from 'agora-rn-uikit/src/Contexts/PropsContext';
import RtcConfigure from 'agora-rn-uikit/src/RtcConfigure';
import LocalUserContext from 'agora-rn-uikit/src/Contexts/LocalUserContext';
import PinnedVideo from 'agora-rn-uikit/src/Views/PinnedVideo';
import LocalControls from 'agora-rn-uikit/src/Controls/LocalControls';
import {AGORA_APP_ID} from '../../config/agora';
import {getAgoraToken, getAgoraTokenForAudience} from '../../api/calling';
import callManagerService from '../../services/callManagerService';

interface VideoCallRouteParams {
  channel: string;
  uid: number;
  receiverName?: string;
  receiverAvatar?: string;
  isIncoming?: boolean;
  callType?: 'video' | 'audio';
  agoraToken?: string;
  sessionId?: string;
}

const VideoCall: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = (route.params || {}) as VideoCallRouteParams;

  const [hasPermission, setHasPermission] = useState(Platform.OS !== 'android');
  const [rtcToken, setRtcToken] = useState<string | undefined>(params.agoraToken);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [showNoAnswerModal, setShowNoAnswerModal] = useState(false);
  const callDurationRef = React.useRef(0);

  const channel = params.channel;
  const uid = params.uid ?? 0;

  // Fetch RTC token in background. Use params.agoraToken if present. On API failure, join without token (unsecured projects).
  useEffect(() => {
    if (params.agoraToken || !channel) return;
    const fetchToken = async () => {
      try {
        const res = await getAgoraTokenForAudience(channel);
        const data = (res as any)?.data;
        const token =
          data?.data?.agora_token ?? data?.agora_token ?? data?.data?.signature;
        if (token) {
          setRtcToken(token);
        } else {
          const fallback = await getAgoraToken(channel, uid);
          const fd = (fallback as any)?.data;
          setRtcToken(fd?.data?.signature ?? fd?.data?.agora_token ?? fd?.agora_token);
        }
      } catch (e) {
        // 500 or network error - join without token (works for unsecured Agora projects)
        setRtcToken(undefined);
      }
    };
    fetchToken();
  }, [channel, uid, params.agoraToken]);

  // Android permissions
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]).then(granted => {
      const ok =
        granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;
      setHasPermission(ok);
    }).catch(() => setHasPermission(false));
  }, []);

  const handleEndCall = useCallback(async () => {
    const result = await callManagerService.endCall();
    if (result.success && callDurationRef.current > 0) {
      const mins = Math.floor(callDurationRef.current / 60);
      const secs = callDurationRef.current % 60;
      const duration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      callManagerService.handleCallEnded(duration);
    }
    navigation.goBack();
  }, [navigation]);

  const rtcProps = useMemo(
    () => ({
      appId: AGORA_APP_ID,
      channel,
      token: rtcToken ?? params.agoraToken ?? undefined,
      uid: uid || 0,
      layout: Layout.Pin,
      mode: ChannelProfileType.ChannelProfileCommunication,
      role: ClientRoleType.ClientRoleBroadcaster,
      activeSpeaker: true,
      disableRtm: true,
      callActive: true,
    }),
    [channel, rtcToken, params.agoraToken, uid],
  );

  const callbacks = useMemo(
    () => ({
      EndCall: handleEndCall,
      UserJoined: () => {
        setRemoteUserJoined(true);
      },
      UserOffline: (_: any, __: number, reason: number) => {
        setRemoteUserJoined(false);
        if (reason === 0) navigation.goBack();
      },
    }),
    [handleEndCall, navigation],
  );

  const agoraProps = useMemo(
    () => ({rtcProps, callbacks}),
    [rtcProps, callbacks],
  );

  // Auto-end call if other user doesn't pick up within 10 seconds (outgoing calls only)
  useEffect(() => {
    if (params.isIncoming || remoteUserJoined || !channel) return;
    const timer = setTimeout(async () => {
      await callManagerService.endCall();
      setShowNoAnswerModal(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [params.isIncoming, remoteUserJoined, channel]);

  // Call duration timer (starts only when remote user joins)
  useEffect(() => {
    if (!remoteUserJoined) return;
    const interval = setInterval(() => {
      setCallDuration(prev => {
        const next = prev + 1;
        callDurationRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remoteUserJoined]);

  const dismissNoAnswerModal = useCallback(() => {
    setShowNoAnswerModal(false);
    navigation.goBack();
  }, [navigation]);

  if (!hasPermission && Platform.OS === 'android') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.permissionText}>
          Camera & microphone permissions are required to start the call.
        </Text>
      </SafeAreaView>
    );
  }

  if (!channel) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.center}>
          <Text style={styles.connectingText}>No channel</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Modal
        visible={showNoAnswerModal}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Call Ended</Text>
            <Text style={styles.modalMessage}>
              The other user is busy or didn't pick up the call.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={dismissNoAnswerModal}
              activeOpacity={0.8}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {remoteUserJoined && (
        <View style={styles.timestampOverlay}>
          <Text style={styles.timestampText}>{formatDuration(callDuration)}</Text>
        </View>
      )}
      <PropsProvider value={agoraProps}>
        <RtcConfigure key={channel}>
          <LocalUserContext>
            <PinnedVideo />
            <LocalControls />
          </LocalUserContext>
        </RtcConfigure>
      </PropsProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  connectingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 18,
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  timestampOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  timestampText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalMessage: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoCall;
