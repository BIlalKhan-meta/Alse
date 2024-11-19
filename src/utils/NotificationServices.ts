import PushNotificationIOS from '@react-native-community/push-notification-ios';
// notificationService.js
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return getFcmToken();
  }
};

export const getFcmToken = async () => {
  const token = await messaging().getToken();
  console.log(token, 'fcm token');
  if (token) {
    return token;
  }
};

class NotificationListener {
  constructor() {
    this.hasBeenCalled = false;
  }

  
  init(handleNotification) {
    console.log("CHECKKKKKKKK");
    if (this.hasBeenCalled) {
      console.log("NotificationListener can only be called once.");
      return;
    }
    this.hasBeenCalled = true;

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('BACKKKKKKKKK CALEDLDDDDDDDDDDDD, REMOTEEEEEE ',remoteMessage);
      
      createNotificationChannel();
      if (handleNotification) {
        handleNotification(remoteMessage);
      }
      const notificationData = {
        channelId: 'channel-id2',
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
      };
      PushNotification.localNotification(notificationData);
    });

    messaging().onMessage(async remoteMessage => {
      console.log('on message what happened:', remoteMessage);
      createNotificationChannel();
      
      if (handleNotification) {
        handleNotification(remoteMessage);
      }
      const notificationData = {
        channelId: 'channel-id2',
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
      };
      PushNotification.localNotification(notificationData);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage,
        );
      });
  }
}

const createNotificationChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'channel-id2',
      channelName: 'My channel',
    },
    created => console.log(`createChannel returned '${created}'`)
  );
};

// Export the NotificationListener instance
export const notificationListenerInstance = new NotificationListener();