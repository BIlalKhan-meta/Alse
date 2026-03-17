import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
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
import AgoraUIKit, {
  ChannelProfileType,
  ClientRoleType,
  Layout,
} from 'agora-rn-uikit';
import {AGORA_APP_ID} from '../../config/agora';
import callManagerService from '../../services/callManagerService';
import agoraRtmService from '../../services/agoraRtmService';

interface AudioCallRouteParams {
  channel: string;
  uid: number;
  rtcUid?: number;
  receiverName?: string;
  receiverAvatar?: string;
  isIncoming?: boolean;
  agoraToken?: string;
  sessionId?: string;
}

const AudioCall: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = (route.params || {}) as AudioCallRouteParams;

  const [hasPermission, setHasPermission] = useState(Platform.OS !== 'android');
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [showNoAnswerModal, setShowNoAnswerModal] = useState(false);
  const [isInvitationAccepted, setIsInvitationAccepted] = useState(false);
  const [showDeclinedModal, setShowDeclinedModal] = useState(false);
  const callDurationRef = useRef(0);
  const endedByRemoteRef = useRef(false);
  const remoteEverJoinedRef = useRef(false);

  const channel = params.channel;
  const token = params.agoraToken || undefined;

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
      .then(
        granted =>
          granted === PermissionsAndroid.RESULTS.GRANTED &&
          setHasPermission(true),
      )
      .catch(() => setHasPermission(false));
  }, []);

  const handleEndCall = useCallback(async () => {
    const result = await callManagerService.endCall();
    if (result.success && callDurationRef.current > 0) {
      const mins = Math.floor(callDurationRef.current / 60);
      const secs = callDurationRef.current % 60;
      const duration = `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
      callManagerService.handleCallEnded(duration);
    }
    navigation.goBack();
  }, [navigation]);

  const connectionData = useMemo(
    () => ({
      appId: AGORA_APP_ID,
      channel,
      rtcToken: token,
      rtcUid: 0,
    }),
    [channel, token],
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

  const rtcCallbacks = useMemo(
    () => ({
      EndCall: handleEndCall,
      JoinChannelSuccess: (_connection: any, _elapsed: number) => {
        console.log('[AudioCall] Joined channel:', channel);
      },
      UserJoined: (_connection: any, remoteUid: number) => {
        console.log('[AudioCall] Remote user joined:', remoteUid);
        remoteEverJoinedRef.current = true;
        setRemoteUserJoined(true);
      },
      UserOffline: (_connection: any, remoteUid: number) => {
        console.log('[AudioCall] Remote user offline:', remoteUid);
        if (!remoteEverJoinedRef.current || endedByRemoteRef.current) {
          return;
        }
        endedByRemoteRef.current = true;
        setRemoteUserJoined(false);
        callManagerService.endCall().finally(() => {
          navigation.goBack();
        });
      },
    }),
    [handleEndCall, navigation, channel],
  );

  useEffect(() => {
    if (params.isIncoming) {
      return;
    }

    agoraRtmService.setLocalInvitationAcceptedCallback(() => {
      setIsInvitationAccepted(true);
    });

    agoraRtmService.setLocalInvitationRefusedCallback(async () => {
      await callManagerService.endCall();
      setShowDeclinedModal(true);
    });

    return () => {
      agoraRtmService.setLocalInvitationAcceptedCallback(null);
      agoraRtmService.setLocalInvitationRefusedCallback(null);
    };
  }, [params.isIncoming]);

  useEffect(() => {
    if (params.isIncoming || remoteUserJoined || !channel || isInvitationAccepted)
      return;
    const timer = setTimeout(async () => {
      await callManagerService.endCall();
      setShowNoAnswerModal(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [params.isIncoming, remoteUserJoined, channel, isInvitationAccepted]);

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

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const dismissNoAnswerModal = useCallback(() => {
    setShowNoAnswerModal(false);
    setShowDeclinedModal(false);
    navigation.goBack();
  }, [navigation]);

  if (!hasPermission && Platform.OS === 'android') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.permissionText}>
          Microphone permission is required to start the audio call.
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Modal visible={showNoAnswerModal} transparent animationType="fade">
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
      <Modal visible={showDeclinedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Call Declined</Text>
            <Text style={styles.modalMessage}>
              The other user declined your call.
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
          <Text style={styles.timestampText}>
            {formatDuration(callDuration)}
          </Text>
        </View>
      )}
      <AgoraUIKit
        connectionData={connectionData}
        settings={settings}
        rtcCallbacks={rtcCallbacks}
      />
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

export default AudioCall;
