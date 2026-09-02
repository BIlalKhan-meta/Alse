/**
 * @format
 */

import * as Sentry from '@sentry/react-native';
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {SENTRY_DSN} from './src/config/sentry';

Sentry.init({
  dsn: SENTRY_DSN || undefined,
  enabled: Boolean(SENTRY_DSN),
  tracesSampleRate: 0.2,
  enableAutoSessionTracking: true,
  // Native crashes (Agora / FFmpeg / Zego) need this on Android.
  enableNative: true,
  enableNativeCrashHandling: true,
  attachScreenshot: true,
  environment: __DEV__ ? 'development' : 'production',
});

// Must run at app entry (not inside React). Otherwise background/quit FCM never reaches JS.
// Lazy-require Notifee here so a bad init order cannot break FCM registration.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('========================================');
  console.log('[INCOMING NOTIFICATION] background (index.js)');
  console.log('title:', remoteMessage?.notification?.title ?? remoteMessage?.data?.title);
  console.log('body:', remoteMessage?.notification?.body ?? remoteMessage?.data?.body);
  console.log('data:', JSON.stringify(remoteMessage?.data ?? {}, null, 2));
  console.log('raw:', JSON.stringify(remoteMessage, null, 2));
  console.log('========================================');
  try {
    const {
      handleBackgroundFcmMessage,
      registerNotifeeBackgroundHandler,
    } = require('./src/services/pushNotificationService');
    registerNotifeeBackgroundHandler();
    await handleBackgroundFcmMessage(remoteMessage);
  } catch (e) {
    console.warn('[FCM] Notifee background display failed:', e?.message ?? e);
  }
});

try {
  const {
    registerNotifeeBackgroundHandler,
  } = require('./src/services/pushNotificationService');
  registerNotifeeBackgroundHandler();
} catch (e) {
  console.warn('[FCM] Notifee background handler init failed:', e?.message ?? e);
}

// Register app first to prevent "has not been registered" error if init fails
AppRegistry.registerComponent(appName, () => Sentry.wrap(App));

// Defer optional init - wrap in try/catch so failures don't block app startup
try {
  const {startNetworkLogging} = require('react-native-network-logger');
  startNetworkLogging();
} catch (e) {
  if (__DEV__) {
    console.warn('Network logger init failed:', e?.message);
  }
}
