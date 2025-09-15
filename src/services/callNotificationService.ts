import {Platform, Alert} from 'react-native';
import PushNotification from 'react-native-push-notification';

/**
 * Service for handling call notifications
 */
class CallNotificationService {
  private isInitialized = false;

  /**
   * Initialize the notification service
   */
  initialize() {
    if (this.isInitialized) return;

    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      requestPermissions: Platform.OS === 'ios',
    });

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
