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
  ActivityIndicator,
  AppState,
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
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { selectUserProfile } from '../../store/slices/authSlice';
import { useSelector } from 'react-redux';
import ViewerCounter from '../../components/ViewerCounter';
import firestore from '@react-native-firebase/firestore';
import ChatComponent from '../../components/LiveStreamChat';
import { archiveChatMessages } from '../../services/chatService';
import { initializeViewerTracking, archiveStreamStats, updateViewerActivity } from '../../services/viewerService';

const appId = 'a0c7366a22ac46b791c69f685591207c';

const LiveStreamScreen = () => {
  const [joined, setJoined] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isAppActive, setIsAppActive] = useState(true);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [joinRetries, setJoinRetries] = useState(0); // Add retry counter for join attempts

  const route = useRoute();
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  const user = useSelector(selectUserProfile);

  let viewerTrackingCleanup: any = null;

  const { isHost: isHostFromParams, channel, streamerName = user.full_name, streamerAvatar = user.profile_picture_url } = route.params as { isHost: boolean, channel: string, streamerName: string, streamerAvatar: string };

  const [isLoading, setIsLoading] = useState(false);
  const [channelName, setChannelName] = useState(hri.random());
  const [token, setToken] = useState('');
  const [liveStarted, setLiveStarted] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const engine = useRef(null);
  const isInitialized = useRef(false);
  const [isHost, setIsHost] = useState(isHostFromParams);

  useEffect(() => {
    if (route.params?.isHost) {
      setIsHost(route.params.isHost);
    }

    if (route.params?.channel) {
      setChannelName(route.params.channel);
    }
  }, [route.params]);
  

  useEffect(() => {
    if (!liveStarted || isHost || !channelName) return;
    
    // For audience members only: periodically update activity
    const activityInterval = setInterval(() => {
      if (channelName) {
        updateViewerActivity(channelName, user.id)
          .catch(err => console.error('Error updating viewer activity:', err));
      }
    }, 5 * 1000); // Update every 5 seconds
    
    return () => {
      clearInterval(activityInterval);
    };
  }, [liveStarted, isHost, channelName, user.id]);
  
  // Track app state (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const isActive = nextAppState === 'active';
      const wasActive = appState.current === 'active';
      appState.current = nextAppState;
      setIsAppActive(isActive);
      
      // Handle app going to background
      if (wasActive && !isActive) {
        handleAppBackground();
      }
      
      // Handle app coming back to foreground
      if (!wasActive && isActive) {
        handleAppForeground();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  
  // Track screen focus
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      
      // Handle screen coming into focus - restart camera if needed
      if (isHost && isInitialized.current && isAppActive) {
        handleScreenFocus();
      }
      
      return () => {
        setIsScreenFocused(false);
        // Handle screen losing focus - pause camera
        if (isHost && isInitialized.current) {
          handleScreenBlur();
        }
      };
    }, [isHost, isAppActive])
  );
  
  // Handle app going to background
  const handleAppBackground = () => {
    if (isHost && isInitialized.current && engine.current) {
      // Disable camera when app goes to background
      console.log('App going to background, disabling camera...');
      engine.current.enableLocalVideo(false);
      engine.current.muteLocalAudioStream(true);
    }
  };
  
  // Handle app coming back to foreground
  const handleAppForeground = () => {
    if (isHost && isInitialized.current && engine.current && isScreenFocused) {
      // Re-enable camera when app comes to foreground
      console.log('App coming to foreground, enabling camera...');
      engine.current.enableLocalVideo(true);
      engine.current.muteLocalAudioStream(false);
    }
  };
  
  // Handle screen focus
  const handleScreenFocus = () => {
    if (isHost && isInitialized.current && engine.current) {
      console.log('Screen focused, enabling camera...');
      engine.current.enableLocalVideo(true);
      engine.current.muteLocalAudioStream(false);
    }
  };
  
  // Handle screen blur
  const handleScreenBlur = () => {
    if (isHost && isInitialized.current && engine.current) {
      console.log('Screen blurred, disabling camera...');
      engine.current.enableLocalVideo(false);
      engine.current.muteLocalAudioStream(true);
    }
  };

  // Request permissions first, then initialize Agora
  useEffect(() => {
    const requestPermissions = async () => {
      if (!isHost) {
        setPermissionsGranted(true);
        return;
      }

      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);

          if (
            granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
            PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('All permissions granted');
            setPermissionsGranted(true);
          } else {
            console.warn('Camera or Microphone permission denied');
            setPermissionsGranted(false);
            setInitializing(false);
          }
        } catch (err) {
          console.warn(err);
          setPermissionsGranted(false);
          setInitializing(false);
        }
      } else {
        // iOS permissions handled by the Agora SDK
        setPermissionsGranted(true);
      }
    };

    requestPermissions();
  }, [isHost]);

  // Initialize Agora after permissions are granted
  useEffect(() => {
    if (!permissionsGranted) return;
    
    setIsLoading(true);

    const eventHandler = {
      onJoinChannelSuccess: (connection, uid) => {
        console.log('Joined Channel Successfully', connection.channelId, uid);
        setJoined(true);
        setInitializing(false);
        
        // If this is an audience member joining a live channel, mark live as started
        if (!isHost && connection.channelId === channel) {
          setLiveStarted(true);
        }
      },
      onLeaveChannel: () => {
        console.log('Left Channel');
        setJoined(false);
        if (!isHost) {
          // Reset live status when audience leaves channel
          setLiveStarted(false);
        }
      },
      onUserJoined: (_connection, uid) => {
        console.log('Remote user ' + uid + ' joined');
        setRemoteUid(uid);
        
        // If we're audience and we see the host join, that means the stream is live
        if (!isHost) {
          setLiveStarted(true);
        }
      },
      onUserOffline: (_connection, uid) => {
        console.log('Remote user ' + uid + ' left the channel');
        setRemoteUid(0);
        
        // If we're audience and we were watching a host who left
        if (!isHost && uid === remoteUid) {
          // Consider trying to rejoin or handling end of stream
          console.log("Host has left the stream");
        }
      },
      onConnectionStateChanged(connection, state, reason) {
        if (state === 5) { // Failed
          // Try to reconnect if this is a viewer
          if (!isHost && joinRetries < 3) {
            console.log("Attempting to reconnect to stream...");
            setJoinRetries(prev => prev + 1);
            setTimeout(() => {
              setupRemoteChannel();
            }, 2000);
          } else if (!isHost) {
            setInitializing(false);
            console.log("Failed to connect after multiple attempts");
          }
        }
      },
      onError: (err) => {
        console.log("Agora error:", err);
        setTimeout(() => {
          setInitializing(false);
        }, 5000);
      },
    };

    const initializeAgora = async () => {
      if (isInitialized.current) return;

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
        isInitialized.current = true;
        
        // Only join channel after initialization is complete
        if (!isHost) {
          console.log("Audience setup - joining channel:", channel);
          await setupRemoteChannel();
        } else {
          console.log("Host setup - joining preview channel");
          await joinChannel();
        }
        
        setIsLoading(false);
      } catch (e) {
        console.log('Error initializing Agora:', e);
        setInitializing(false);
        setIsLoading(false);
      }
    };

    initializeAgora();

    // Fallback to ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      if (initializing) {
        console.log("Initialization timed out, forcing UI to render");
        setInitializing(false);
      }
    }, 90 * 1000);

    return () => {
      console.log('Releasing Agora Engine');
      clearTimeout(timeoutId);
      if (engine.current) {
        // Clean up resources completely when component unmounts
        cleanupResources();
      }

      if (viewerTrackingCleanup) {
        viewerTrackingCleanup();
      }
    };
  }, [permissionsGranted, isHost]);
  
  // Complete cleanup of resources
  const cleanupResources = async () => {
    try {
      console.log('Cleaning up all Agora resources...');
      if (liveStarted && isHost) {
        // End any active live stream first
        await EndLiveStream().catch(err => console.error("Error ending live stream:", err));
      }
      
      // Destroy preview and leave any channel
      if (isHost && engine.current) {
        engine.current.stopPreview();
      }
      
      await leaveChannel();
      
      // Unregister event handler and release engine
      if (isInitialized.current && engine.current) {
        engine.current.release();
        isInitialized.current = false;
      }
    } catch (err) {
      console.error("Error during cleanup:", err);
    }
  };

  const setupRemoteChannel = async () => {
    try {
      const {data} = await GetLiveStreamToken(channel);

      // Directly add them to live
      setChannelName(channel);
      setToken(data.agora_token);
      console.log("Setting up remote channel:", channel);

      // Join the channel as audience
      await joinChannel({ 
        channel: channel,
        token: data.agora_token,
        uid: data.uid
      });
    } catch (err) {
      console.error("Error setting up remote channel:", err);
      setInitializing(false);
    }
  };

  const joinChannel = async (audienceData) => {
    try {
      console.log('Joining Channel...', audienceData);

      if (!isInitialized.current || !engine.current) {
        console.log('Engine not initialized yet');
        return;
      }

      // Host joining preview channel
      if (isHost && !liveStarted) {
        console.log('Host joining preview channel:', channelName);
        engine.current.joinChannel('', channelName, 0, {
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishMicrophoneTrack: true,
          publishCameraTrack: true,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });
      }

      // Audience joining live channel
      if (!isHost && audienceData) {
        console.log('Audience joining channel:', audienceData.channel);
        
        // Make sure we're not in any channel first
        if (joined) {
          console.log("Leaving current channel before joining new one");
          await engine.current.leaveChannel();
        }
        console.log("Channel name:", audienceData.channel);
        
        // Join the channel with clear options
        const result = engine.current.joinChannel(
          audienceData.token, // Use empty string if token not provided
          audienceData.channel,
          audienceData.uid,
          {
            channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
            clientRoleType: ClientRoleType.ClientRoleAudience,
            publishMicrophoneTrack: false,
            publishCameraTrack: false,
            autoSubscribeAudio: true,
            autoSubscribeVideo: true,
            audienceLatencyLevel: AudienceLatencyLevelType.AudienceLatencyLevelUltraLowLatency,
          }
        );
        
        console.log("Join channel result:", result);
      }
    } catch (e) {
      console.log('Error joining channel:', e);
      setInitializing(false);
    }
  };

  const joinChannelAsHost = async (token: string, channelName: string) => {
    console.log('Starting video preview as host...');
  
    if (!isInitialized.current || !engine.current) {
      console.log('Engine not initialized yet');
      return;
    }
  
    try {
      // Leave current channel
      await leaveChannel();

      console.log("Host joining live channel:", channelName);
      const result = await engine.current.joinChannel(token, channelName, 0, {
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
      
      console.log("Join live channel result:", result);
    } catch (err) {
      console.error('Error joining as host:', err);
    }
  };

  const leaveChannel = async () => {
    try {
      console.log('Leaving Channel...');
      if (!isInitialized.current || !engine.current) return;
      
      const result = await engine.current.leaveChannel();
      console.log("Leave channel result:", result);
      setRemoteUid(0);
    } catch (e) {
      console.log('Error leaving channel:', e);
    }
  };

  const startLive = async () => {
    try {
      setIsLoading(true);
      const { data } = await StartLiveStream();
      console.log("Start live stream response:", data);
  
      // Set state first
      setChannelName(data.channel_name);
      setToken(data.agora_token);

      // Set live started after successful channel leave
      setLiveStarted(true);

      // Initialize Firestore chat document for this channel
      try {
        await firestore()
          .collection('liveStreamChats')
          .doc(data.channel_name)
          .set({
            channelId: data.channel_name,
            hostId: user.id,
            hostName: user.full_name,
            startedAt: firestore.FieldValue.serverTimestamp(),
            active: true
          });
      } catch (err) {
        console.error("ERROR setting up chat document:", err);
      }

      if (isHost) {
        viewerTrackingCleanup = initializeViewerTracking(data.channel_name);
      }

      // Join new channel as host
      await joinChannelAsHost(data.agora_token, data.channel_name);
    } catch (err) {
      console.error("ERROR starting live:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const endLive = async () => {
    try {
      setIsLoading(true);
      
      // First set states to ensure UI updates properly
      setLiveStarted(false);
      
      // Leave the live channel
      await leaveChannel();
      
      // Call the API to end the live stream
      const result = await EndLiveStream();
      console.log("End live stream result:", result);

      // Generate a new channel name for the dummy channel
      const newChannelName = hri.random();
      setChannelName(newChannelName);
      setToken('');
      
      // Slight delay to ensure channel left properly
      setTimeout(async () => {
        // Rejoin a dummy channel to show camera preview
        await joinChannel();
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error("ERROR ending live:", err);
      setIsLoading(false);
    }
  };
  
  const handleEndLiveAndGoBack = async () => {
    if (liveStarted && isHost) {
      await endLive();
    }
    navigation.goBack();
  };

  const handleSwitchCamera = () => {
    if (isInitialized.current && engine.current) {
      engine.current.switchCamera();
    }
  };

  const renderStreamControl = () => {
    if (!isHost) return null;
    if (liveStarted) return null; // Don't show button when live is active

    return (
      <View style={styles.controls}>
        <CustomButton
          style={styles.controls}
          onPress={isLoading ? null : startLive}
          txtstyle={styles.controlText}
          loading={isLoading}>
          Start Stream
        </CustomButton>
      </View>
    );
  };

  const renderLiveHeader = () => {
    return (
      <View style={styles.liveHeaderContainer}>
        <View style={styles.liveUserInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: streamerAvatar || `https://randomuser.me/api/portraits/men/${user.id}.jpg` }}
              style={styles.avatarImage}
            />
            <Image
              source={require('../../assets/Icons/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.username}>{streamerName}</Text>
            {liveStarted && <View style={styles.liveIndicatorContainer}>
              <Text style={styles.liveText}>Live</Text>
            </View>}
          </View>
        </View>
        
        <View style={styles.headerRightContainer}>
          { liveStarted && (
            <ViewerCounter
              isLive={liveStarted}
              channelId={channelName} // Use channelName instead of channel
              style={styles.viewerCounterMargin}
            />
          ) }
          
          {/* X button for ending live stream - only show when live and for host */}
          {isHost && liveStarted && (
            <TouchableOpacity
              style={styles.endLiveButton}
              onPress={handleEndLiveAndGoBack}
            >
              <FontAwesome6 name="xmark" size={18} color="#fff" iconStyle='solid' />
            </TouchableOpacity>
          )}
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
  
  // Render no stream available message
  const renderNoStream = () => {
    if (!isHost && !remoteUid && !initializing) {
      return (
        <View style={styles.noStreamContainer}>
          <Text style={styles.noStreamText}>This stream is not available right now</Text>
          <TouchableOpacity 
            style={styles.backButtonLarge}
            onPress={async () => {
              await cleanupResources();
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
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

        {renderNoStream()}
        {renderLiveHeader()}

        {isHost ? <TouchableOpacity
          style={styles.reverseCameraButton}
          onPress={handleSwitchCamera}
        >
          <FontAwesome6 name="camera-rotate" size={24} color="#fff" iconStyle='solid' />
        </TouchableOpacity> : null}

        {/* Chat Component */}
        <ChatComponent 
          channelId={channelName} 
          isLive={liveStarted || (!isHost && remoteUid !== 0)}
        />
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
  avatarContainer: {
    position: 'relative',
    width: 36,
    height: 36,
    marginRight: 8,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logoImage: {
    position: 'absolute',
    width: 48,
    height: 48,
    top: 55,
    left: -7
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
  noStreamContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 5,
  },
  noStreamText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonLarge: {
    backgroundColor: '#38b6ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  viewerCounterMargin: {
    marginRight: 10,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
    paddingRight: 12,
  },
  userTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: 36,
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
    marginRight: 10,
  },
  viewersCount: {
    color: '#fff',
    fontSize: 12,
  },
  endLiveButton: {
    backgroundColor: 'rgba(255,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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