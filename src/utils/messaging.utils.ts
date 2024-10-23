import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {Platform} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
// import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
// import RNRestart from 'react-native-restart';

export const getFcmToken = async () => {
  const token = await messaging().getToken();
  console.log('token', token);
  if (token) {
    return token;
  }
};

export const NotificationListener = ({handleNotification}: any) => {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      console.log('onMessage', remoteMessage);
      if (handleNotification) {
        handleNotification(remoteMessage);
      }
      messaging().onNotificationOpenedApp(async remoteMessage => {
        console.log('remoteonNotificationOpenedApp', remoteMessage);
      });
      messaging()
        .getInitialNotification()
        .then(async remoteMessage => {
          console.log('remotegetInitialNotification', remoteMessage);
          handleNotification(remoteMessage);
          if (
            remoteMessage?.data?.title === 'Subscription purchased successfully'
          ) {
            if (Platform.OS === 'ios') {
              InAppBrowser.close();
              // RNRestart.restart();
            }
          }
        });
    });

    getFcmToken().then(console.log);
    return unsubscribe;
  }, []);

  return null;
};

export const BacKgroundNotifListener = ({handleNotification}: any) => {
  useEffect(() => {
    const unsubscribe = messaging().setBackgroundMessageHandler(
      async (remoteMessage: any) => {
        console.log('remoteMessagesetBackgroundMessageHandler', remoteMessage);
        if (handleNotification) {
          handleNotification(remoteMessage);
        }
      },
    );

    return unsubscribe;
  }, []);

  return null;
};
