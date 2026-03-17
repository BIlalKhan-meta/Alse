/**
 * @deprecated Incoming calls now use ZEGOCLOUD's ZegoCallInvitationDialog.
 * This screen is kept for backwards compatibility but is no longer used in the main flow.
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Vibration,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';
import {fontSizes, vh, vw} from '../../constant';
import {Phone, Video, PhoneOff} from 'lucide-react-native';
import agoraRtmService from '../../services/agoraRtmService';

interface IncomingVideoCallProps {
  route: {
    params: {
      callerName: string;
      callerAvatar?: string;
      chatId: string;
      channel: string;
      uid: number;
      callType?: 'video' | 'audio';
    };
  };
}

const IncomingVideoCall: React.FC<IncomingVideoCallProps> = ({route}) => {
  const navigation = useNavigation();
  const {params} = route;
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    if (!agoraRtmService.hasPendingInvitation()) {
      navigation.goBack();
    }
  }, [navigation]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isRinging) handleDeclineCall();
    }, 30000);
    return () => clearTimeout(timeout);
  }, [isRinging]);

  useEffect(() => {
    if (!isRinging) {
      Vibration.cancel();
      return;
    }
    Vibration.vibrate([0, 700, 500], true);
    return () => Vibration.cancel();
  }, [isRinging]);

  useEffect(() => {
    agoraRtmService.setIncomingInvitationEndedCallback(() => {
      setIsRinging(false);
      navigation.goBack();
    });
    return () => agoraRtmService.setIncomingInvitationEndedCallback(null);
  }, [navigation]);

  const handleAcceptCall = async () => {
    setIsRinging(false);
    Vibration.cancel();
    agoraRtmService.setIncomingInvitationEndedCallback(null);
    await agoraRtmService.acceptPendingInvitation();

    const screen =
      params.callType === 'audio' ? 'AudioCall' : 'VideoCall';
    (navigation as any).replace(screen as never, {
      chatId: params.chatId,
      receiverName: params.callerName,
      receiverAvatar: params.callerAvatar,
      isIncoming: true,
    } as never);
  };

  const handleDeclineCall = async () => {
    setIsRinging(false);
    Vibration.cancel();
    agoraRtmService.setIncomingInvitationEndedCallback(null);
    await agoraRtmService.refusePendingInvitation();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.black} barStyle="light-content" />
      <View style={styles.backgroundGradient} />

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

      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.declineButton]}
            onPress={handleDeclineCall}>
            <PhoneOff size={28} color={colors.white} />
          </TouchableOpacity>
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
      </View>
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
});

export default IncomingVideoCall;
