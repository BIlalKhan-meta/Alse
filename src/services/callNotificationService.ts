import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';

const CALL_CHANNELS = [
  {
    channelId: 'calls',
    channelName: 'Incoming Calls',
    channelDescription: 'Incoming voice and video call alerts',
    importance: 4, // IMPORTANCE_HIGH
    vibrate: true,
    playSound: true,
  },
  {
    channelId: 'missed_calls',
    channelName: 'Missed Calls',
    channelDescription: 'Missed call notifications',
    importance: 3, // IMPORTANCE_DEFAULT
    vibrate: false,
    playSound: false,
  },
  {
    channelId: 'call_status',
    channelName: 'Call Status',
    channelDescription: 'Call ended and status updates',
    importance: 3,
    vibrate: false,
    playSound: false,
  },
] as const;

/**
 * Service for handling call notifications
 */
class CallNotificationService {
  private isInitialized = false;

  /**
   * Initialize the notification service and Android channels.
   * Channels must exist before posting on Android 8+.
   */
  initialize() {
    if (this.isInitialized) return;

    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      requestPermissions: Platform.OS === 'ios',
    });

    if (Platform.OS === 'android') {
      CALL_CHANNELS.forEach(channel => {
        PushNotification.createChannel(
          {
            channelId: channel.channelId,
            channelName: channel.channelName,
            channelDescription: channel.channelDescription,
            importance: channel.importance,
            vibrate: channel.vibrate,
            playSound: channel.playSound,
          },
          created => {
            console.log(
              `[CallNotification] channel ${channel.channelId} created=${created}`,
            );
          },
        );
      });
    }

    this.isInitialized = true;
  }

  /**
   * Show incoming call notification
   */
  showIncomingCallNotification(
    callerName: string,
    callType: 'video' | 'audio',
    channel: string,
    uid: number,
  ) {
    this.initialize();
    PushNotification.localNotification({
      title: `Incoming ${callType === 'video' ? 'Video' : 'Voice'} Call`,
      message: `${callerName} is calling you`,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      channelId: 'calls',
      actions: ['Answer', 'Decline'],
      userInfo: {
        type: 'incoming_call',
        callerName,
        callType,
        channel,
        uid,
      },
    });
  }

  /**
   * Cancel incoming call notification
   */
  cancelIncomingCallNotification() {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Show missed call notification
   */
  showMissedCallNotification(callerName: string) {
    this.initialize();
    PushNotification.localNotification({
      title: 'Missed Call',
      message: `You missed a call from ${callerName}`,
      playSound: false,
      vibrate: false,
      priority: 'normal',
      importance: 'normal',
      channelId: 'missed_calls',
    });
  }

  /**
   * Show call ended notification
   */
  showCallEndedNotification(duration: string) {
    this.initialize();
    PushNotification.localNotification({
      title: 'Call Ended',
      message: `Call duration: ${duration}`,
      playSound: false,
      vibrate: false,
      priority: 'normal',
      importance: 'normal',
      channelId: 'call_status',
    });
  }
}

// Export singleton instance
export const callNotificationService = new CallNotificationService();
export default callNotificationService;
