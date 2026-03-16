import React, {
  useCallback,
  useContext,
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
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ChannelProfileType,
  ClientRoleType,
  Layout,
} from 'agora-rn-uikit';
import {PropsProvider} from 'agora-rn-uikit/src/Contexts/PropsContext';
import RtcConfigure from 'agora-rn-uikit/src/RtcConfigure';
import RtcContext from 'agora-rn-uikit/src/Contexts/RtcContext';
import LocalUserContext from 'agora-rn-uikit/src/Contexts/LocalUserContext';
import EndCall from 'agora-rn-uikit/src/Controls/Local/EndCall';
import LocalAudioMute from 'agora-rn-uikit/src/Controls/Local/LocalAudioMute';
import {AGORA_APP_ID} from '../../config/agora';
import {getAgoraToken, getAgoraTokenForAudience} from '../../api/calling';
import callManagerService from '../../services/callManagerService';
import {Volume2, VolumeX} from 'lucide-react-native';

interface AudioCallRouteParams {
  channel: string;
  uid: number;
  receiverName?: string;
  receiverAvatar?: string;
  isIncoming?: boolean;
  agoraToken?: string;
  sessionId?: string;
}

// Disables camera for audio-only calls
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
    disableVideo().then(success => {
      if (!success) {
        const id = setInterval(() => {
          disableVideo().then(s => s && clearInterval(id));
        }, 200);
        return () => clearInterval(id);
      }
    });
  }, [rtcContext?.RtcEngine]);

  return <>{children}</>;
};

// Speaker toggle: loud speaker vs ear speaker
const SpeakerToggle: React.FC = () => {
  const {RtcEngine} = useContext(RtcContext);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const toggle = useCallback(async () => {
    if (!RtcEngine) return;
    try {
      const next = !isSpeaker;
      RtcEngine.setEnableSpeakerphone(next);
      setIsSpeaker(next);
    } catch (e) {
      console.warn('[AudioCall] Speaker toggle failed:', e);
    }
  }, [RtcEngine, isSpeaker]);

  return (
    <View style={styles.controlButtonContainer}>
      <TouchableOpacity
        style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
        onPress={toggle}
        activeOpacity={0.7}>
        {isSpeaker ? (
          <Volume2 size={24} color="#fff" />
        ) : (
          <VolumeX size={24} color="#fff" />
        )}
      </TouchableOpacity>
      <Text style={styles.controlButtonLabel}>
        {isSpeaker ? 'Speaker' : 'Earpiece'}
      </Text>
    </View>
  );
};

const AudioCall: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = (route.params || {}) as AudioCallRouteParams;

  const [hasPermission, setHasPermission] = useState(Platform.OS !== 'android');
  const [isConnecting, setIsConnecting] = useState(true);
  const [rtcToken, setRtcToken] = useState<string | undefined>(undefined);
  const [tokenReady, setTokenReady] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const callDurationRef = useRef(0);

  const channel = params.channel;
  const uid = params.uid ?? 0;
  const displayName = params.receiverName || 'Calling...';
  const avatar = params.receiverAvatar;

  useEffect(() => {
    const fetchToken = async () => {
      if (params.agoraToken) {
        setRtcToken(params.agoraToken);
        setTokenReady(true);
        return;
      }
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
          setRtcToken(
            fd?.data?.signature ?? fd?.data?.agora_token ?? fd?.agora_token,
          );
        }
        setTokenReady(true);
      } catch (e) {
        console.warn('[AudioCall] Token fetch failed - trying without token:', e);
        setRtcToken(undefined);
        setTokenReady(true);
      }
    };
    if (channel) fetchToken();
  }, [channel, uid, params.agoraToken]);

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
    }),
    [channel, rtcToken, params.agoraToken, uid],
  );

  const callbacks = useMemo(
    () => ({
      EndCall: handleEndCall,
      JoinChannelSuccess: () => setIsConnecting(false),
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

  // Fallback: hide connecting overlay after 3s if JoinChannelSuccess never fires (e.g. SDK quirk)
  useEffect(() => {
    if (!channel || !tokenReady) return;
    const t = setTimeout(() => setIsConnecting(false), 3000);
    return () => clearTimeout(t);
  }, [channel, tokenReady]);

  const agoraProps = useMemo(
    () => ({rtcProps, callbacks}),
    [rtcProps, callbacks],
  );

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

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  if (!channel || !tokenReady) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {!isConnecting && remoteUserJoined && (
        <View style={styles.timestampOverlay}>
          <Text style={styles.timestampText}>{formatDuration(callDuration)}</Text>
        </View>
      )}
      {isConnecting && (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      )}
      <PropsProvider value={agoraProps}>
        <RtcConfigure key={channel}>
          <LocalUserContext>
            <VideoDisabler>
              <View style={styles.contentContainer}>
                <View style={styles.avatarContainer}>
                  {avatar ? (
                    <Image source={{uri: avatar}} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                        {displayName.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.nameText}>{displayName}</Text>
                  <Text style={styles.statusText}>
                    {isConnecting ? 'Connecting...' : 'Voice Call'}
                  </Text>
                </View>
              </View>
              <View style={styles.controls}>
                <LocalAudioMute />
                <SpeakerToggle />
                <EndCall />
              </View>
            </VideoDisabler>
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#999',
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
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  controlButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#66BB6A',
  },
  controlButtonLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AudioCall;
