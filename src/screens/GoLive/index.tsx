import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  AudienceLatencyLevelType,
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
  const [initializing, setInitializing] = useState(true);

  const route = useRoute();

  const { isHost, channel, streamerName = 'Jemma Ray', streamerAvatar } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [channelName, setChannelName] = useState(hri.random());
  const [token, setToken] = useState('');
  const [liveStarted, setLiveStarted] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [viewers, setViewers] = useState(40); // Example viewer count
  const engine = useRef(null);

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

    const eventHandler = {
      onJoinChannelSuccess: () => {
        console.log('Joined Channel Successfully');
        setJoined(true);
        setInitializing(false); // Mark initialization as complete when successfully joined
      },
      onLeaveChannel: () => {
        console.log('Left Channel');
        setJoined(false);
      },
      onUserJoined: (_connection, uid) => {
        console.log('Remote user ' + uid + ' joined');
        setRemoteUid(uid);
      },
      onUserOffline: (_connection, uid) => {
        console.log('Remote user ' + uid + ' left the channel');
        setRemoteUid(uid);
      },
      onConnectionStateChanged(connection, state, reason) {
        console.log("CONNECTION", connection, state, reason);
      },
      onError: (err) => {
        console.log("Agora error:", err);
        // If there's an error joining, we should still stop showing the loading indicator
        // after a reasonable timeout
        setTimeout(() => {
          setInitializing(false);
        }, 5000);
      }
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
        setInitializing(false); // Stop showing loading if initialization fails
      }
    };

    requestCameraAndAudioPermission();
    initializeAgora();

    if (!isHost) {
      setupRemoteChannel()
        .then(() => {
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error setting up remote channel:", err);
          setIsLoading(false);
          setInitializing(false);
        });
    }
    else {
      joinChannel();
      setIsLoading(false);
    }

    // Fallback to ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      setInitializing(false);
    }, 10000);

    return () => {
      console.log('Releasing Agora Engine');
      clearTimeout(timeoutId);
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

  const joinChannel = async (audienceData) => {
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
        await engine.current?.leaveChannel();

        console.log("JOIN CHANNEL RESPONSE::: ", engine.current?.joinChannel('', audienceData.channel, 0, {
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
      setInitializing(false); // Ensure loading stops if there's an error
    }
  };

  const joinChannelAsHost = (token, channelName) => {
    console.log('Starting video preview...');

    engine.current?.joinChannel(token, channelName, 0, {
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
      <View style={styles.controls}>
        <CustomButton
          style={styles.controls}
          onPress={onPressAction}
          txtstyle={styles.controlText}
          loading={isLoading}>
          {label}
        </CustomButton>
      </View>
    );
  };

  // Render the live user header
  const renderLiveHeader = () => {
    return (
      <View style={styles.liveHeaderContainer}>
        <View style={styles.liveUserInfo}>
          <Image
            source={streamerAvatar || { uri: `https://randomuser.me/api/portraits/men/1.jpg` }}
            style={styles.avatarImage}
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.username}>{streamerName}</Text>
            <View style={styles.liveIndicatorContainer}>
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
        </View>
        <View style={styles.viewersContainer}>
          <Text style={styles.viewersCount}>{viewers}</Text>
        </View>
      </View>
    );
  };

  // Chat message bubbles
  const renderChatMessages = () => {
    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatMessage}>
          <Image
            source={{ uri: `https://randomuser.me/api/portraits/men/1.jpg` }}
            style={styles.chatAvatar}
          />
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>haha, looks very fun 😊</Text>
          </View>
        </View>

        <View style={styles.chatMessage}>
          <Image
            source={{ uri: `https://randomuser.me/api/portraits/men/2.jpg` }}
            style={styles.chatAvatar}
          />
          <View style={[styles.messageContent, styles.secondMessage]}>
            <Text style={styles.messageText}>I love this</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputPlaceholder}>Type Your Message</Text>
          <View style={styles.inputIcons}>
            <TouchableOpacity>
              <FontAwesome6 name="gift" size={20} color="#0099ff" iconStyle='solid' />
            </TouchableOpacity>
            <TouchableOpacity>
              <FontAwesome6 name="heart" size={20} color="#ff5c5c" iconStyle='solid' />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render loading screen
  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38b6ff" />
        <Text style={styles.loadingText}>Preparing livestream...</Text>
      </View>
    );
  };

  // Only render the main content when initializing is complete
  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoading()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Video stream */}
      <View style={styles.videoContainer}>
        {joined && isHost && (
          <RtcSurfaceView canvas={{ uid: 0 }} style={styles.videoFill} />
        )}

        {remoteUid !== 0 && (
          <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.videoFill} />
        )}

        {/* Live header overlay */}
        {renderLiveHeader()}

        {/* Camera switch button */}
        <TouchableOpacity
          style={styles.reverseCameraButton}
          onPress={handleSwitchCamera}
        >
          <FontAwesome6 name="camera-rotate" size={24} color="#fff" iconStyle='solid' />
        </TouchableOpacity>

        {renderChatMessages()}
      </View>

      {renderStreamControl()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoFill: {
    flex: 1,
    width: '100%',
  },
  liveHeaderContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  liveUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
    paddingRight: 12,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  userTextContainer: {
    flexDirection: 'column',
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  liveIndicatorContainer: {
    backgroundColor: '#38b6ff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewersContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  viewersCount: {
    color: '#fff',
    fontSize: 12,
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
  chatContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    padding: 10,
  },
  chatMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageContent: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '70%',
  },
  secondMessage: {
    backgroundColor: 'rgba(255,94,153,0.85)',
  },
  messageText: {
    color: '#000',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    marginTop: 10,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  inputPlaceholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  inputIcons: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
});

export default LiveStreamScreen;