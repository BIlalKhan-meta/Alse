// notificationService.js
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import navigationRef from '../../App';

export const requestUserPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // console.log('Authorization status:', authStatus);
      return getFcmToken();
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const getFcmToken = async () => {
  const token = await messaging().getToken();
  // console.log(token, 'fcm token');
  if (token) {
    return token;
  }
};

class NotificationListener {
  constructor() {
    this.hasBeenCalled = false;
  }

  init(handleNotification) {
    if (this.hasBeenCalled) {
      // console.log('NotificationListener can only be initialized once.');
      return;
    }
    this.hasBeenCalled = true;

    messaging().onNotificationOpenedApp(remoteMessage => {
      // console.log('Notification tapped (background state):', remoteMessage);
      this.handleNavigation(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // console.log('Notification tapped (quit state):', remoteMessage);
          this.handleNavigation(remoteMessage);
        }
      });

    messaging().onMessage(async remoteMessage => {
      // console.log('Foreground message received:', remoteMessage);

      createNotificationChannel();
      if (handleNotification) {
        handleNotification(remoteMessage);
      }

      // PushNotification.configure({
      //   onAction: action => {
      //     console.log(
      //       'AACTIONNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN',
      //       action,
      //     );
      //   },
      // });

      // Alert.alert('Incoming Call', 'Join Session', [
      //   {
      //     text: 'Accept',
      //     onPress: () => {
      //       navigationRef?.navigate('IncomingCall', {
      //         chat_id: remoteMessage?.data?.chat_id,
      //         role: '0',
      //       });
      //     },
      //   },
      //   {
      //     text: 'Reject',
      //     style: 'cancel',
      //   },
      // ]);
      navigationRef?.navigate('AcknowledgeCall', {
        chat_id: remoteMessage?.data?.chat_id,
        role: '0',
        name: remoteMessage?.data?.name,
        image: remoteMessage?.data?.avatar,
      });

      // PushNotification.localNotification({
      //   channelId: 'channel-id2',
      //   message: remoteMessage.notification.body,
      //   title: remoteMessage.notification.title,
      // });
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      // console.log('Background message received:', remoteMessage);

      createNotificationChannel();
      if (handleNotification) {
        handleNotification(remoteMessage);
      }

      PushNotification.localNotification({
        channelId: 'channel-id2',
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
      });
    });
  }

  handleNavigation(remoteMessage) {
    if (remoteMessage?.data?.chat_id) {
      navigationRef?.navigate('AcknowledgeCall', {
        chat_id: remoteMessage?.data?.chat_id,
        role: '0',
        name: remoteMessage?.data?.name,
        image: remoteMessage?.data?.avatar,
      });
    }
  }
}

const createNotificationChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'channel-id2',
      channelName: 'My Channel',
    },
    created => console.log(`createChannelxxx returned '${created}'`),
  );
};

// Export the NotificationListener instance
export const notificationListenerInstance = new NotificationListener();
