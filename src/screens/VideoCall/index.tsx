import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {RtcSurfaceView} from 'react-native-agora';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';
import {fontSizes, vh, vw} from '../../constant';
import agoraCallService from '../../services/agoraCallService';
import {getAgoraToken, endCallSession} from '../../api/calling';
import callManagerService from '../../services/callManagerService';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  RotateCcw,
} from 'lucide-react-native';

interface VideoCallProps {
  route: {
    params: {
      channel: string;
      uid: number;
      receiverName: string;
      receiverAvatar?: string;
      isIncoming?: boolean;
      callType?: 'video' | 'audio';
      agoraToken?: string;
      sessionId?: string;
    };
  };
}

const VideoCall: React.FC<VideoCallProps> = ({route}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const {params} = route;

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(
    params.callType !== 'audio',
  );
  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Start call duration timer
  const startCallTimer = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setCallDuration(duration);
    }, 1000);
  };

  // Stop call duration timer
  const stopCallTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request permissions
        const hasPermissions = await agoraCallService.requestPermissions();
        if (!hasPermissions) {
          setError(
            'Camera and microphone permissions are required for calling',
          );
          setIsLoading(false);
          return;
        }

        // Use provided Agora token or get a new one
        let token = params.agoraToken;
        if (!token) {
          const tokenResponse = await getAgoraToken(params.channel, params.uid);
          token = tokenResponse?.data?.data?.signature;
        }

        // Join channel
        const success = await agoraCallService.joinChannel(
          params.channel,
          params.uid,
          token,
          uid => {
            console.log('Remote user joined:', uid);
            setRemoteUsers(prev => [...prev, uid]);
          },
          uid => {
            console.log('Remote user left:', uid);
            setRemoteUsers(prev => prev.filter(id => id !== uid));
          },
          error => {
            console.error('Agora error:', error);
            setError('Call connection failed. Please try again.');
          },
        );

        if (success) {
          setIsConnected(true);
          setIsLoading(false);
          startCallTimer();
        } else {
          setError('Failed to join call. Please try again.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Call initialization error:', err);
        setError('Failed to start call. Please try again.');
        setIsLoading(false);
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      stopCallTimer();
      agoraCallService.leaveChannel();
    };
  }, [params.channel, params.uid]);

  // Handle call end
  const handleEndCall = async () => {
    try {
      stopCallTimer();

      // Use call manager service to end call
      const result = await callManagerService.endCall();

      if (result.success) {
        console.log('Call ended successfully');
        // Show call duration if call was active
        if (callDuration > 0) {
          const duration = formatDuration(callDuration);
          callManagerService.handleCallEnded(duration);
        }
      } else {
        console.error('Error ending call:', result.error);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error ending call:', error);
      navigation.goBack();
    }
  };

  // Toggle audio mute
  const handleToggleMute = async () => {
    try {
      const newMuteState = await agoraCallService.toggleAudioMute();
      setIsMuted(newMuteState);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  // Toggle video
  const handleToggleVideo = async () => {
    try {
      const newVideoState = await agoraCallService.toggleVideoEnabled();
      setIsVideoEnabled(!newVideoState);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // Switch camera
  const handleSwitchCamera = async () => {
    try {
      await agoraCallService.switchCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={colors.black} barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={colors.black} barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.black} barStyle="light-content" />

      {/* Remote video view */}
      <View style={styles.remoteVideoContainer}>
        {remoteUsers.length > 0 ? (
          remoteUsers.map(uid => (
            <RtcSurfaceView
              key={uid}
              style={styles.remoteVideo}
              canvas={{uid}}
            />
          ))
        ) : (
          <View style={styles.noVideoContainer}>
            <Image
              source={
                params.receiverAvatar
                  ? {uri: params.receiverAvatar}
                  : images.profile
              }
              style={styles.avatarImage}
            />
            <Text style={styles.userName}>{params.receiverName}</Text>
            <Text style={styles.callStatus}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Text>
          </View>
        )}
      </View>

      {/* Local video view */}
      {isVideoEnabled && (
        <View style={styles.localVideoContainer}>
          <RtcSurfaceView style={styles.localVideo} canvas={{uid: 0}} />
        </View>
      )}

      {/* Call duration */}
      {isConnected && callDuration > 0 && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            {formatDuration(callDuration)}
          </Text>
        </View>
      )}

      {/* Call controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          {/* Mute button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive,
            ]}
            onPress={handleToggleMute}>
            {isMuted ? (
              <MicOff size={24} color={colors.white} />
            ) : (
              <Mic size={24} color={colors.white} />
            )}
          </TouchableOpacity>

          {/* Video toggle button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isVideoEnabled && styles.controlButtonActive,
            ]}
            onPress={handleToggleVideo}>
            {isVideoEnabled ? (
              <Video size={24} color={colors.white} />
            ) : (
              <VideoOff size={24} color={colors.white} />
            )}
          </TouchableOpacity>

          {/* Switch camera button */}
          {isVideoEnabled && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSwitchCamera}>
              <RotateCcw size={24} color={colors.white} />
            </TouchableOpacity>
          )}

          {/* End call button */}
          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}>
            <Phone size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    marginTop: vh * 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vw * 8,
  },
  errorText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    textAlign: 'center',
    marginBottom: vh * 4,
  },
  retryButton: {
    backgroundColor: colors.themeColor,
    paddingHorizontal: vw * 8,
    paddingVertical: vh * 2,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  remoteVideo: {
    flex: 1,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: vh * 2,
  },
  userName: {
    color: colors.white,
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    marginBottom: vh * 1,
  },
  callStatus: {
    color: colors.white,
    fontSize: fontSizes.medium,
    opacity: 0.8,
  },
  localVideoContainer: {
    position: 'absolute',
    top: vh * 4,
    right: vw * 4,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.white,
  },
  localVideo: {
    flex: 1,
  },
  durationContainer: {
    position: 'absolute',
    top: vh * 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  durationText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1,
    borderRadius: 20,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: vh * 6,
    left: 0,
    right: 0,
    paddingHorizontal: vw * 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: vw * 2,
  },
  controlButtonActive: {
    backgroundColor: colors.themeColor,
  },
  endCallButton: {
    backgroundColor: '#FF4444',
  },
});

export default VideoCall;
