import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  NativeModules,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
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
import IncomingCallHandler from './src/components/IncomingCallHandler';
import MainNavigation from './src/navigation';
import PushTokenSync from './src/components/PushTokenSync';
import {navigationRef} from './src/utils/navigationRef';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import {LanguageProvider} from './src/i18n/LanguageContext';
import './src/i18n';
import NetworkLoggerFAB from './src/components/NetworkLoggerFAB';
import {AppQueryProvider} from './src/providers/AppQueryProvider';
import ErrorBoundary from './src/components/ErrorBoundary';
import UploadProgressBanner from './src/components/UploadProgressBanner';
import {configureGoogleSignin} from './src/components/GoogleAuth/GoogleService';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.headerColor,
  },
};

// Call once at import — never inside render. configureProps JNI aborts on some
// MediaTek/TECNO devices (java_object == null in NativeProxy::configureProps).
// Skip entirely on Android; the logger is only for Reanimated strict warnings.
if (Platform.OS !== 'android') {
  try {
    configureReanimatedLogger({
      level: ReanimatedLogLevel.warn,
      strict: false,
    });
  } catch (e) {
    console.warn('[Reanimated] configureReanimatedLogger failed:', e);
  }
} else {
  // Do not call configureReanimatedLogger on Android (JNI abort). Still turn
  // off strict-mode spam from Feed/Stories shared values.
  const g = globalThis as typeof globalThis & {
    __reanimatedLoggerConfig?: {strict?: boolean; level?: number};
  };
  g.__reanimatedLoggerConfig = {
    ...(g.__reanimatedLoggerConfig ?? {}),
    strict: false,
    level: ReanimatedLogLevel.warn,
  };
}

function hideBootSplash() {
  // Prefer NativeModules over react-native-bootsplash's TurboModule import:
  // getEnforcing("RNBootSplash") can abort JS startup (white "Downloading 100%..." screen).
  const RNBootSplash = NativeModules.RNBootSplash;
  try {
    if (typeof RNBootSplash?.hide === 'function') {
      // Some builds expect (fade: boolean); others take 0 args.
      try {
        RNBootSplash.hide(false);
      } catch {
        RNBootSplash.hide();
      }
    }
  } catch (e) {
    console.warn('[BootSplash] hide failed:', e);
  }
}

function App(): React.JSX.Element {
  useEffect(() => {
    // Fallback if PersistGate onBeforeLift never runs (e.g. rehydrate hang).
    hideBootSplash();
    try {
      configureGoogleSignin();
    } catch (e) {
      console.warn('[GoogleSignIn] configure failed:', e);
    }
    requestPushPermissionAndToken().catch(error => {
      console.warn('[FCM] push setup failed:', error);
    });
    const cleanupPushHandlers = registerPushNotificationHandlers();

    return () => {
      cleanupPushHandlers();
    };
  }, []);

  const appContent = (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={styles.bootContainer}>
            <ActivityIndicator size="large" color={colors.themeColor} />
          </View>
        }
        persistor={persistor}
        onBeforeLift={hideBootSplash}>
        <LanguageProvider>
          <AppQueryProvider>
          <NavigationContainer ref={navigationRef} theme={theme}>
            <PushTokenSync />
            <MainNavigation />
            <IncomingCallHandler />
          </NavigationContainer>
          {__DEV__ && <NetworkLoggerFAB />}
          <Toast />
          </AppQueryProvider>
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ErrorBoundary>
          {appContent}
          <UploadProgressBanner />
        </ErrorBoundary>
      </SafeAreaProvider>
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
// Root is also wrapped with Sentry.wrap in index.js for native + JS coverage.
