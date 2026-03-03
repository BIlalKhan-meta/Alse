import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {NativeModules, Platform, StyleSheet} from 'react-native';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {colors} from './src/utils/theme';
import {Provider} from 'react-redux';
import store, {persistor} from './src/store';
import Toast from 'react-native-toast-message';
import {PersistGate} from 'redux-persist/integration/react';
import {
  checkNotifications,
  PERMISSIONS,
  request,
} from 'react-native-permissions';
import {requestUserPermission} from './src/utils/NotificationServices';
import MainNavigation from './src/navigation';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import {ZoomVideoSdkProvider} from '@zoom/react-native-videosdk';
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

function App(): React.JSX.Element {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });

  const checkNotificationPermission = async () => {
    try {
      const permission = PERMISSIONS.ANDROID?.POST_NOTIFICATIONS;
      if (!permission) {
        return;
      }
      const res = await checkNotifications();
      if (
        res?.status === 'denied' ||
        res?.status === 'blocked' ||
        res?.status === 'unavailable' ||
        res?.status === 'limited'
      ) {
        await request(permission);
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
    if (Platform.OS === 'android') {
      checkNotificationPermission();
    }
    requestUserPermission();
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

  return (
    <ZoomVideoSdkProvider
      config={{appGroupId: 'test', domain: 'zoom.us', enableLog: true}}>
      <PersistGate loading={null} persistor={persistor}>
        <Provider store={store}>
          <LanguageProvider>
            {/* <SafeAreaView style={styles.container}> */}

            <NavigationContainer theme={theme}>
              <MainNavigation />
              {__DEV__ && <NetworkLoggerFAB />}
            </NavigationContainer>

            <Toast />
            {/* </SafeAreaView> */}
          </LanguageProvider>
        </Provider>
      </PersistGate>
    </ZoomVideoSdkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default App;
