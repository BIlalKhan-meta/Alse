import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  Vibration,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';
import {fontSizes, vh, vw} from '../../constant';
import {Phone, Video, PhoneOff} from 'lucide-react-native';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import callManagerService from '../../services/callManagerService';
import agoraRtmService from '../../services/agoraRtmService';

interface IncomingVideoCallProps {
  route: {
    params: {
      callerName: string;
      callerAvatar?: string;
      channel: string;
      uid: number;
      callType?: 'video' | 'audio';
      agoraToken?: string;
      sessionId?: string;
    };
  };
}

const IncomingVideoCall: React.FC<IncomingVideoCallProps> = ({route}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const {params} = route;

  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    if (!agoraRtmService.hasPendingInvitation()) {
      navigation.goBack();
    }
  }, [navigation]);

  // Simulate incoming call ring
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRinging) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    // Auto decline after 30 seconds
    const timeout = setTimeout(() => {
      if (isRinging) {
        handleDeclineCall();
      }
    }, 30000);

    return () => {
      if (interval) clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRinging]);

  useEffect(() => {
    if (!isRinging) {
      Vibration.cancel();
      return;
    }
    Vibration.vibrate([0, 700, 500], true);
    return () => {
      Vibration.cancel();
    };
  }, [isRinging]);

  useEffect(() => {
    agoraRtmService.setIncomingInvitationEndedCallback(() => {
      setIsRinging(false);
      navigation.goBack();
    });

    return () => {
      agoraRtmService.setIncomingInvitationEndedCallback(null);
    };
  }, [navigation]);

  // Handle accept call
  const handleAcceptCall = async () => {
    try {
      setIsRinging(false);
      Vibration.cancel();
      agoraRtmService.setIncomingInvitationEndedCallback(null);

      // Accept RTM invitation to complete signaling
      await agoraRtmService.acceptPendingInvitation();

      // Use call manager service to join call
      const result = await callManagerService.joinCall(
        params.channel,
        params.callerName,
        params.callType || 'video',
        params.callerAvatar,
        params.sessionId,
        user?.id,
      );

      if (result.success && result.data) {
        const screen = result.data.callType === 'audio' ? 'AudioCall' : 'VideoCall';
        (navigation as any).replace(
          screen as never,
          {
            channel: result.data.channel,
            uid: result.data.rtcUid || Number(user?.id || params.uid || 0),
            receiverName: result.data.callerName,
            receiverAvatar: result.data.callerAvatar,
            isIncoming: true,
            callType: result.data.callType,
            agoraToken: result.data.agoraToken,
            sessionId: result.data.sessionId,
          } as never,
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'Failed to join call. Please try again.',
        );
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      Alert.alert('Error', 'Failed to join call. Please try again.');
    }
  };

  // Handle decline call
  const handleDeclineCall = async () => {
    setIsRinging(false);
    Vibration.cancel();
    agoraRtmService.setIncomingInvitationEndedCallback(null);
    await agoraRtmService.refusePendingInvitation();
    // Handle missed call
    callManagerService.handleMissedCall(params.callerName);
    // Cancel any incoming call notifications
    callManagerService.cancelIncomingCallNotification();
    navigation.goBack();
  };

  // Handle decline with message
  const handleDeclineWithMessage = () => {
    Alert.alert('Decline Call', 'Send a quick message?', [
      {text: 'Just Decline', onPress: handleDeclineCall},
      {
        text: 'Send Message',
        onPress: () => {
          // Navigate to chat with pre-filled message
          navigation.navigate(
            'ChatOngoing' as never,
            {
              id: params.uid,
              name: params.callerName,
              preMessage: "Sorry, I can't take the call right now.",
            } as never,
          );
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.black} barStyle="light-content" />

      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />

      {/* Caller info */}
      <View style={styles.callerInfoContainer}>
        <Image
          source={
            params.callerAvatar ? {uri: params.callerAvatar} : images.profile
          }
          style={styles.callerAvatar}
        />
        <Text style={styles.callerName}>{params.callerName}</Text>
        <Text style={styles.callType}>
          {params.callType === 'audio' ? 'Voice Call' : 'Video Call'}
        </Text>
        <Text style={styles.callStatus}>
          {isRinging ? 'Incoming call...' : 'Connecting...'}
        </Text>
      </View>

      {/* Call controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          {/* Decline button */}
          <TouchableOpacity
            style={[styles.controlButton, styles.declineButton]}
            onPress={handleDeclineCall}>
            <PhoneOff size={28} color={colors.white} />
          </TouchableOpacity>

          {/* Accept button */}
          <TouchableOpacity
            style={[styles.controlButton, styles.acceptButton]}
            onPress={handleAcceptCall}>
            {params.callType === 'audio' ? (
              <Phone size={28} color={colors.white} />
            ) : (
              <Video size={28} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Additional options */}
        <View style={styles.additionalOptions}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleDeclineWithMessage}>
            <Text style={styles.optionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Call duration (if answered) */}
      {!isRinging && callDuration > 0 && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            {Math.floor(callDuration / 60)}:
            {(callDuration % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  callerInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vw * 8,
  },
  callerAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: vh * 3,
    borderWidth: 4,
    borderColor: colors.white,
  },
  callerName: {
    color: colors.white,
    fontSize: fontSizes.xlarge,
    fontWeight: 'bold',
    marginBottom: vh * 1,
    textAlign: 'center',
  },
  callType: {
    color: colors.white,
    fontSize: fontSizes.medium,
    opacity: 0.8,
    marginBottom: vh * 2,
  },
  callStatus: {
    color: colors.white,
    fontSize: fontSizes.medium,
    opacity: 0.9,
  },
  controlsContainer: {
    paddingBottom: vh * 8,
    paddingHorizontal: vw * 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: vh * 4,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: vw * 4,
  },
  declineButton: {
    backgroundColor: '#FF4444',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  additionalOptions: {
    alignItems: 'center',
  },
  optionButton: {
    paddingVertical: vh * 1.5,
    paddingHorizontal: vw * 6,
  },
  optionButtonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    opacity: 0.8,
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
    fontSize: fontSizes.large,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1,
    borderRadius: 20,
  },
});

export default IncomingVideoCall;
