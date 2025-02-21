import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  RtcSurfaceView,
} from 'react-native-agora';
import {colors} from '../../utils/theme';

const appId = '26fd612e45fb4446b31b70dc15736026'; // Replace with your Agora App ID
const channelName = 'testChannel';
const token = ''; // Replace with a valid token if needed

const LiveStreamScreen = () => {
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [remoteUid, setRemoteUid] = useState<number>(0);
  const engine = useRef<IRtcEngine | null>(null);

  useEffect(() => {
    const requestCameraAndAudioPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);

          if (
            granted[PermissionsAndroid.PERMISSIONS.CAMERA] !==
              PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !==
              PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.warn('Camera or Microphone permission denied');
            return;
          }

          console.log('Permissions granted');
        } catch (err) {
          console.warn(err);
        }
      }
    };

    const initializeAgora = async () => {
      try {
        console.log('Initializing Agora...');
        const agoraEngine = createAgoraRtcEngine();
        agoraEngine.initialize({appId});

        agoraEngine.registerEventHandler({
          onJoinChannelSuccess: () => {
            console.log('Joined Channel Successfully');
            setJoined(true);
          },
          onLeaveChannel: () => {
            console.log('Left Channel');
            setJoined(false);
          },
          onUserJoined: uid => {
            console.log('User joined:', uid);
            setRemoteUid(uid);
          },
          onUserOffline: uid => {
            console.log('User went offline:', uid);
            setRemoteUid(0);
          },
        });

        agoraEngine.enableVideo();
        agoraEngine.enableLocalVideo(true); // ✅ Ensures local video is enabled
        agoraEngine.setChannelProfile(
          ChannelProfileType.ChannelProfileLiveBroadcasting,
        );

        agoraEngine.setClientRole(
          isHost
            ? ClientRoleType.ClientRoleBroadcaster
            : ClientRoleType.ClientRoleAudience,
        );

        agoraEngine.setDefaultAudioRouteToSpeakerphone(true); // ✅ Ensure audio output is set correctly

        engine.current = agoraEngine;
      } catch (e) {
        console.log('Error initializing Agora:', e);
      }
    };

    requestCameraAndAudioPermission();
    initializeAgora();

    return () => {
      console.log('Releasing Agora Engine');
      engine.current?.leaveChannel();
      engine.current?.release();
    };
  }, [isHost]);

  const joinChannel = async () => {
    try {
      console.log('Joining Channel...');

      if (isHost) {
        console.log('Starting video preview...');
        await engine.current?.startPreview(); // ✅ Ensure the preview starts before joining
      }

      engine.current?.joinChannel(token, channelName, null, 0); // Pass 0 to let Agora assign UID
    } catch (e) {
      console.log('Error joining channel:', e);
    }
  };

  const leaveChannel = async () => {
    try {
      console.log('Leaving Channel...');
      engine.current?.leaveChannel();
      setRemoteUid(0);
    } catch (e) {
      console.log('Error leaving channel:', e);
    }
  };

  const toggleRole = async () => {
    const newIsHost = !isHost;
    setIsHost(newIsHost);
    engine.current?.setClientRole(
      newIsHost
        ? ClientRoleType.ClientRoleBroadcaster
        : ClientRoleType.ClientRoleAudience,
    );
  };

  return (
    <View style={styles.container}>
      {joined && isHost && (
        <RtcSurfaceView canvas={{uid: 0}} style={styles.videoFill} />
      )}

      {remoteUid !== 0 && (
        <RtcSurfaceView canvas={{uid: remoteUid}} style={styles.videoFill} />
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.control}
          onPress={joined ? leaveChannel : joinChannel}>
          <Text style={styles.controlText}>
            {joined ? 'Leave Channel' : 'Join Channel'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.control}
          onPress={toggleRole}
          disabled={joined}>
          <Text style={styles.controlText}>{`Switch to ${
            isHost ? 'Audience' : 'Host'
          }`}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoFill: {
    flex: 1,
    width: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: '100%',
    padding: 10,
    rowGap: 12,
    paddingHorizontal: 40,
  },
  control: {
    backgroundColor: colors.themeColor,
    height: 44,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {},
});

export default LiveStreamScreen;
