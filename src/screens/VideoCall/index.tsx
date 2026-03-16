import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
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
  const [isConnecting, setIsConnecting] = useState(true);
  const [rtcToken, setRtcToken] = useState<string | undefined>(undefined);
  const [tokenReady, setTokenReady] = useState(false);
  const callDurationRef = React.useRef(0);

  const channel = params.channel;
  const uid = params.uid ?? 0;

  // Fetch RTC token (or use params.agoraToken). On API failure, try without token (works for unsecured Agora projects).
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
          setRtcToken(fd?.data?.signature ?? fd?.data?.agora_token ?? fd?.agora_token);
        }
        setTokenReady(true);
      } catch (e) {
        console.warn('[VideoCall] Token fetch failed (500 or network) - trying without token (unsecured project):', e);
        setRtcToken(undefined);
        setTokenReady(true);
      }
    };
    if (channel) fetchToken();
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

  const connectionData = useMemo(
    () => ({
      appId: AGORA_APP_ID,
      channel,
      rtcToken: rtcToken ?? params.agoraToken ?? undefined,
      rtcUid: uid || 0,
    }),
    [channel, rtcToken, params.agoraToken, uid],
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
      JoinChannelSuccess: () => {
        setIsConnecting(false);
      },
      UserJoined: () => {},
      UserOffline: (_: any, __: number, reason: number) => {
        if (reason === 0) navigation.goBack();
      },
    }),
    [handleEndCall, navigation],
  );

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
      {isConnecting && (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.connectingText}>Connecting...</Text>
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
});

export default VideoCall;
