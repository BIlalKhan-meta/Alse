import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';

/**
 * Service for handling call notifications
 */
class CallNotificationService {
  private notificationId = 'incoming_call';

  /**
   * Initialize push notifications
   */
  initialize() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'calls',
          channelName: 'Call Notifications',
          channelDescription: 'Notifications for incoming calls',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        created => console.log(`createChannel returned '${created}'`),
      );
    }
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
      channelId: 'calls',
      id: this.notificationId,
      title: `Incoming ${callType === 'video' ? 'Video' : 'Voice'} Call`,
      message: `${callerName} is calling you`,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
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
    PushNotification.cancelLocalNotifications({id: this.notificationId});
  }

  /**
   * Show call ended notification
   */
  showCallEndedNotification(callerName: string, duration: number) {
    const durationText = this.formatDuration(duration);
    PushNotification.localNotification({
      channelId: 'calls',
      title: 'Call Ended',
      message: `Call with ${callerName} ended (${durationText})`,
      playSound: false,
      importance: 'low',
      priority: 'low',
    });
  }

  /**
   * Show missed call notification
   */
  showMissedCallNotification(callerName: string) {
    PushNotification.localNotification({
      channelId: 'calls',
      title: 'Missed Call',
      message: `You missed a call from ${callerName}`,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
    });
  }

  /**
   * Format call duration
   */
  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}

// Export singleton instance
export const callNotificationService = new CallNotificationService();
export default callNotificationService;
