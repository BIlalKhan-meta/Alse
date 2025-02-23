import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  RtcSurfaceView,
  AudienceLatencyLevelType,
  RtcConnection,
  IRtcEngineEventHandler,
} from 'react-native-agora';
import { colors } from '../../utils/theme';
import { hri } from 'human-readable-ids';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { EndLiveStream, GetLiveStreamToken, StartLiveStream } from '../../api/liveStream';
import Loader from '../../components/Loader';
import { useRoute } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';

const appId = '26fd612e45fb4446b31b70dc15736026';

const LiveStreamScreen = () => {
  const [joined, setJoined] = useState(false);

  const route = useRoute();

  const { isHost, channel } = route.params;

  const TEMP_TOKEN = '007eJxTYJAp3cUbVzR5p+jpc9EHD975l+gUyrbS8qGJ5qx26Ve2t5oVGIzM0lLMDI1STUzTkkxMTMySjA2TzA1Skg1NzY3NDIzMCpx2pzcEMjI8t+5hYIRCEJ+fwSezLNU5IzEvLzUnJLW4hIEBAK6GI0E=';
  const TEMP_CHANNEL = 'LiveChannelTest'

  const [isLoading, setIsLoading] = useState(false);
  const [channelName, setChannelName] = useState(hri.random());
  const [token, setToken] = useState('');
  const [liveStarted, setLiveStarted] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number>(0);
  const engine = useRef<IRtcEngine | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const requestCameraAndAudioPermission = async () => {
      if (!isHost) {
        return;
      }

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

    const eventHandler: IRtcEngineEventHandler = {
      onJoinChannelSuccess: () => {
        console.log('Joined Channel Successfully');
        setJoined(true);
      },
      onLeaveChannel: () => {
        console.log('Left Channel');
        setJoined(false);
      },
      onUserJoined: (_connection: RtcConnection, uid: number) => {
        console.log('Remote user ' + uid + ' joined');
        setRemoteUid(uid);
      },
      onUserOffline: (_connection: RtcConnection, uid: number) => {
        console.log('Remote user ' + uid + ' left the channel');
        setRemoteUid(uid);
      },
      onConnectionStateChanged(connection, state, reason) {
        console.log("CONNECTION", connection, state, reason);
      },
    }

    const initializeAgora = async () => {
      try {
        console.log('Initializing Agora...');
        const agoraEngine = createAgoraRtcEngine();
        agoraEngine.initialize({ appId });

        agoraEngine.registerEventHandler(eventHandler);

        agoraEngine.enableVideo();

        if (isHost) {
          agoraEngine.startPreview();
        }

        agoraEngine.setChannelProfile(
          ChannelProfileType.ChannelProfileLiveBroadcasting,
        );

        agoraEngine.setClientRole(
          isHost
            ? ClientRoleType.ClientRoleBroadcaster
            : ClientRoleType.ClientRoleAudience,
        );

        agoraEngine.setDefaultAudioRouteToSpeakerphone(true);

        engine.current = agoraEngine;
      } catch (e) {
        console.log('Error initializing Agora:', e);
      }
    };

    requestCameraAndAudioPermission();
    initializeAgora();

    if (!isHost) {
      setupRemoteChannel()
        .then(() => {
          setIsLoading(false);
        })
    }
    else {
      joinChannel();
      setIsLoading(false);
    }

    return () => {
      console.log('Releasing Agora Engine');
      endLive();
      engine.current?.unregisterEventHandler(eventHandler);
    };
  }, [isHost]);

  const setupRemoteChannel = async () => {
    // Directly add them to live
    setChannelName(channel);

    console.log("CHANNEL", channel);

    const { data } = await GetLiveStreamToken(`${channel}`);

    setToken(data.agora_token);

    console.log("TOKEN CALL::", data);

    joinChannel({ token: data.agora_token, channel });
  }

  const joinChannel = async (audienceData?: any) => {
    try {
      console.log('Joining Channel...');

      if (!liveStarted && isHost) {
        engine.current?.joinChannel(token, channelName, 0, {
          // Set channel profile to live broadcast
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
          // Set user role to broadcaster
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          // Publish audio collected by the microphone
          publishMicrophoneTrack: false,
          // Publish video collected by the camera
          publishCameraTrack: false,
          // Automatically subscribe to all audio streams
          autoSubscribeAudio: false,
          // Automatically subscribe to all video streams
          autoSubscribeVideo: false,
        });
      }

      if (!isHost) {
        console.log("Is AUDIENCE!!!", audienceData, audienceData.token, audienceData.channel);

        await engine.current?.leaveChannel();

        console.log("JOIN CHANNEL RESPONSE::: ",engine.current?.joinChannel('', audienceData.channel, 0, {
          // Set channel profile to live broadcast
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
          // Set user role to audience
          clientRoleType: ClientRoleType.ClientRoleAudience,
          // Do not publish audio collected by the microphone
          publishMicrophoneTrack: false,
          // Do not publish video collected by the camera
          publishCameraTrack: false,
          // Automatically subscribe to all audio streams
          autoSubscribeAudio: true,
          // Automatically subscribe to all video streams
          autoSubscribeVideo: true,
          // Change the delay level of the audience to achieve ultra-fast live broadcast
          audienceLatencyLevel: AudienceLatencyLevelType.AudienceLatencyLevelUltraLowLatency,
        }), audienceData.channel);
      }
    } catch (e) {
      console.log('Error joining channel:', e);
    }
  };

  const joinChannelAsHost = (token: string, channelName: string) => {
    console.log('Starting video preview...');

    engine.current?.joinChannel('', channelName, 0, {
      // Set channel profile to live broadcast
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      // Set user role to broadcaster
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      // Publish audio collected by the microphone
      publishMicrophoneTrack: true,
      // Publish video collected by the camera
      publishCameraTrack: true,
      // Automatically subscribe to all audio streams
      autoSubscribeAudio: true,
      // Automatically subscribe to all video streams
      autoSubscribeVideo: true,
    });
  }

  const leaveChannel = async () => {
    try {
      console.log('Leaving Channel...');
      engine.current?.leaveChannel();
      setRemoteUid(0);
    } catch (e) {
      console.log('Error leaving channel:', e);
    }
  };

  const startLive = async () => {
    try {
      setIsLoading(true);
      const { data } = await StartLiveStream();

      // Set state first
      setChannelName(data.channel_name);
      setToken(data.agora_token);
      setLiveStarted(true);

      leaveChannel(); // Prepare to join new channel

      joinChannelAsHost(data.agora_token, data.channel_name);
    } catch (err) {
      console.error("ERROR", err);
    } finally {
      setIsLoading(false);
    }
  };

  const endLive = async () => {
    try {
      setIsLoading(true);
      await EndLiveStream();

      setChannelName(hri.random());
      setToken('');

      setLiveStarted(false);
      leaveChannel();
      joinChannel();
    } catch (err) {
      console.error("ERROR", err);
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleSwitchCamera = () => {
    engine.current?.switchCamera();
  }

  const renderStreamControl = () => {
    if (!isHost) return null;

    // Determine the onPress action and label text based on loading and stream status.
    const onPressAction = isLoading ? null : liveStarted ? endLive : startLive;
    const label = liveStarted ? 'End Stream' : 'Start Stream';

    return (
      <View style={ styles.controls }>
        <CustomButton
          style={ styles.controls }
          onPress={ onPressAction }
          txtstyle={ styles.controlText }
          loading={ isLoading }>
          { label }
        </CustomButton>
      </View>
    );
  };


  return (
    <SafeAreaView style={ styles.container }>
      <TouchableOpacity
        style={ styles.reverseCameraButton }
        onPress={ handleSwitchCamera }
      >
        <FontAwesome6 name="camera-rotate" size={ 24 } color="#fff" iconStyle='solid' />
      </TouchableOpacity>
      { joined && isHost && (
        <RtcSurfaceView canvas={ { uid: 0 } } style={ styles.videoFill } />
      ) }

      { remoteUid !== 0 && (
        <RtcSurfaceView canvas={ { uid: remoteUid } } style={ styles.videoFill } />
      ) }

      { renderStreamControl() }
    </SafeAreaView>
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
  reverseCameraButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 25,
    zIndex: 10,
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
