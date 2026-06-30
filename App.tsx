import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  NativeModules,
  StyleSheet,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {colors} from './src/utils/theme';
import {Provider} from 'react-redux';
import store, {persistor} from './src/store';
import Toast from 'react-native-toast-message';
import {PersistGate} from 'redux-persist/integration/react';
import {
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {
  displayFcmWithNotifee,
  requestNotifeePermission,
} from './src/utils/displayFcmWithNotifee';
import MainNavigation from './src/navigation';
import IncomingCallHandler from './src/components/IncomingCallHandler';
import {navigationRef} from './src/utils/navigationRef';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import {LanguageProvider} from './src/i18n/LanguageContext';
import './src/i18n';
import NetworkLoggerFAB from './src/components/NetworkLoggerFAB';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.headerColor,
  },
};

function logFcmNotification(
  source: string,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null,
) {
  if (!remoteMessage) {
    return;
  }
  const {notification, data, messageId} = remoteMessage;
  console.log(`[FCM] ${source}`, {
    messageId,
    title: notification?.title,
    body: notification?.body,
    data,
    raw: remoteMessage,
  });
}

async function requestNotificationPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    }
  } catch (e) {
    console.warn('[FCM] permission/token failed:', e);
  }
  await requestNotifeePermission();
}

function App(): React.JSX.Element {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });

  const checkNotificationPermission = async () => {
    try {
      const res = await checkNotifications();
      if (res.status !== 'granted') {
        await requestNotifications(['alert', 'sound', 'badge']);
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  };

  useEffect(() => {
    // Use NativeModules to avoid TurboModule HostFunction "expected 0 arguments, got 1" error
    // when new architecture is disabled (react-native-bootsplash 5.x + RN 0.79)
    const RNBootSplash = NativeModules.RNBootSplash;
    if (RNBootSplash?.hide) {
      RNBootSplash.hide(false);
    }
    checkNotificationPermission();
    requestNotificationPermission();

    const unsubOnMessage = messaging().onMessage(async remoteMessage => {
      logFcmNotification('foreground (app open)', remoteMessage);
      try {
        await displayFcmWithNotifee(remoteMessage);
      } catch (e) {
        console.warn('[FCM] Notifee display failed:', e);
        try {
          const PushNotification =
            require('react-native-push-notification').default;
          const n = remoteMessage.notification;
          const d = remoteMessage.data || {};
          const title =
            n?.title ?? (d.title != null ? String(d.title) : 'Notification');
          const body =
            n?.body ?? (d.body != null ? String(d.body) : '') ?? '';
          PushNotification.createChannel(
            {
              channelId: 'fcm_general',
              channelName: 'General',
            },
            () => {},
          );
          PushNotification.localNotification({
            channelId: 'fcm_general',
            title: String(title),
            message: String(body),
          });
        } catch (e2) {
          console.warn('[FCM] Push fallback failed:', e2);
        }
      }
    });

    const unsubOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        logFcmNotification('opened from background (tap)', remoteMessage);
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          logFcmNotification('opened from quit state (tap)', remoteMessage);
        }
      });

    return () => {
      unsubOnMessage();
      unsubOpenedApp();
    };
  }, []);

  // function handleNotificationPress(remoteMessage: object) {
  //   // console.log('NTOFIIIIIIIIIIIICATIONNNNNN', remoteMessage);
  // }

  // function handleNotification(remoteMessage: any) {
  //   console.log('Message handled in the !', remoteMessage?.notification);
  //   if (remoteMessage?.notification) {
  //     InAppBrowser.close();
  //     // navigation.navigate("Home");
  //     // navigate('DrawerNavigation1');
  //     // RNRestart.restart();
  //   }
  //   // RNRestart.restart();
  // }

  const appContent = (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={styles.bootContainer}>
            <ActivityIndicator size="large" color={colors.themeColor} />
          </View>
        }
        persistor={persistor}>
        <LanguageProvider>
          <NavigationContainer ref={navigationRef} theme={theme}>
            <MainNavigation />
            <IncomingCallHandler />
          </NavigationContainer>
          {__DEV__ && <NetworkLoggerFAB />}
          <Toast />
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {appContent}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  bootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default App;
