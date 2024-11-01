import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import PushNotification from 'react-native-push-notification';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  // await messaging().registerDeviceForRemoteMessages(); // IMPORTANT!

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return getFcmToken();
  }
}

const getFcmToken = async () => {
  const token = await messaging().getToken();

  console.log(token, 'fcm token');
  if (token) {
    return token;
  }
};

export const NotificationListener = ({handleNotification}: any) => {
  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      PushNotification.createChannel(
        {
          channelId: 'channel-id2', // (required)
          channelName: 'My channel', // (required)
        },
        created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
      );

      // if (handleNotification) {
      //   handleNotification(remoteMessage);
      // }
      const dat = {
        channelId: 'channel-id2', // (required)
        channelName: 'My channel',
        //... You can use all the options from localNotifications
        message: remoteMessage?.notification?.body,
        title: remoteMessage?.notification?.title,
      };
      PushNotification.localNotification(dat);
    });

    messaging().onMessage(async remoteMessage => {
      console.log('on message what happened:', remoteMessage);
      PushNotification.createChannel(
        {
          channelId: 'channel-id2', // (required)
          channelName: 'My channel', // (required)
        },
        created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
      );
      const dat = {
        channelId: 'channel-id2', // (required)
        channelName: 'My channel',
        //... You can use all the options from localNotifications
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
      };
      if (handleNotification) {
        handleNotification(remoteMessage);
      }
      // if (remoteMessage.notification.title == 'Payment Authorized') {
      //   closePaymentModal(remoteMessage.notification.title);
      // }
      PushNotification.localNotification(dat);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage,
        );
      });
  }, []);

  return null;
};