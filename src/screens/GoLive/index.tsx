import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, PermissionsAndroid, Platform } from 'react-native';
import { createAgoraRtcEngine, ChannelProfileType, ClientRoleType, IRtcEngine, RtcSurfaceView } from 'react-native-agora';

const appId = '26fd612e45fb4446b31b70dc15736026'; // Replace with your Agora App ID
const channelName = 'testChannel';
const token = ''; // Use null for testing, replace with token for production

const LiveStreamScreen = () => {
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [remoteUid, setRemoteUid] = useState<number>(0);
  const engine = useRef<IRtcEngine | null>(null);

  useEffect(() => {
    const requestCameraAndAudioPermission = async () => {
      try {
        if (Platform.OS !== 'android') {
            return;
        }

        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        if (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    const initializeAgora = async () => {
      try {
        const agoraEngine = createAgoraRtcEngine();
        agoraEngine.initialize({ appId });
        
        agoraEngine.registerEventHandler({
          onJoinChannelSuccess: () => setJoined(true),
          onLeaveChannel: () => setJoined(false),
          onUserJoined: (uid: number) => setRemoteUid(uid),
          onUserOffline: (uid: number) => setRemoteUid(uid),
        });

        agoraEngine.enableVideo();
        agoraEngine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
        agoraEngine.setClientRole(
          isHost ? ClientRoleType.ClientRoleBroadcaster : ClientRoleType.ClientRoleAudience
        );

        engine.current = agoraEngine;
      } catch (e) {
        console.log('Error initializing Agora:', e);
      }
    };

    requestCameraAndAudioPermission();
    initializeAgora();

    return () => {
      engine.current?.leaveChannel();
      engine.current?.release();
    };
  }, []);

  const joinChannel = async () => {
    try {
      engine.current?.joinChannel(token, channelName, null, 0);
      if (isHost) {
        engine.current?.startPreview();
      }
    } catch (e) {
      console.log('Error joining channel:', e);
    }
  };

  const leaveChannel = async () => {
    try {
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
      newIsHost ? ClientRoleType.ClientRoleBroadcaster : ClientRoleType.ClientRoleAudience
    );
  };

    return (
        <View style={ styles.container }>
            { joined && isHost && (
                <View style={ styles.localVideo }>
                    <RtcSurfaceView canvas={ { uid: 0 } } style={ { width: '90%', height: 200 } } />
                </View>
            ) }

            <RtcSurfaceView
                canvas={ { uid: remoteUid } }
                style={ { width: '90%', height: 200 } }
            />

      <View style={styles.controls}>
        <Button
          title={joined ? 'Leave Channel' : 'Join Channel'}
          onPress={joined ? leaveChannel : joinChannel}
        />
        <Button
          title={`Switch to ${isHost ? 'Audience' : 'Host'}`}
          onPress={toggleRole}
          disabled={joined}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  localVideo: {
    width: 100,
    height: 150,
    position: 'absolute',
    top: 50,
    right: 10,
  },
  remoteVideo: {
    flex: 1,
  },
  videoView: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});

export default LiveStreamScreen;