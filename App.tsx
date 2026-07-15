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
  registerPushNotificationHandlers,
  requestPushPermissionAndToken,
} from './src/services/pushNotificationService';
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

function App(): React.JSX.Element {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });

  useEffect(() => {
    // Use NativeModules to avoid TurboModule HostFunction "expected 0 arguments, got 1" error
    // when new architecture is disabled (react-native-bootsplash 5.x + RN 0.79)
    const RNBootSplash = NativeModules.RNBootSplash;
    if (RNBootSplash?.hide) {
      RNBootSplash.hide(false);
    }
    requestPushPermissionAndToken().catch(error => {
      console.warn('[FCM] push setup failed:', error);
    });
    const cleanupPushHandlers = registerPushNotificationHandlers();

    return () => {
      cleanupPushHandlers();
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
