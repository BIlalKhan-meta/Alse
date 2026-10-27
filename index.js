/**
 * @format
 */

import * as Sentry from '@sentry/react-native';
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {SENTRY_DSN} from './src/config/sentry';

const isNoisyNetworkError = (event, hint) => {
  const values = event?.exception?.values || [];
  const messages = [
    ...values.map(v => `${v?.type || ''} ${v?.value || ''}`),
    event?.message || '',
    hint?.originalException?.message || '',
    String(hint?.originalException || ''),
  ]
    .join(' ')
    .toLowerCase();

  return (
    messages.includes('socketexception') ||
    messages.includes('software caused connection abort') ||
    messages.includes('the request timed out') ||
    messages.includes('network request failed') ||
    messages.includes('network error') ||
    messages.includes('failed to connect') ||
    messages.includes('econnreset') ||
    messages.includes('econnaborted') ||
    messages.includes('etimedout')
  );
};

Sentry.init({
  dsn: SENTRY_DSN || undefined,
  enabled: Boolean(SENTRY_DSN),
  tracesSampleRate: 0.2,
  enableAutoSessionTracking: true,
  // Native crashes (Agora / FFmpeg) need this on Android.
  enableNative: true,
  enableNativeCrashHandling: true,
  attachScreenshot: true,
  // Default ~2s flags keyboard/system stalls as hangs (ALSE-M / ALSE-3).
  // 5s keeps real freezes while reducing false positives around keyboard/bridge.
  appHangTimeoutInterval: 5,
  environment: __DEV__ ? 'development' : 'production',
  beforeSend(event, hint) {
    // ALSE-1A / ALSE-P: transient network failures — don't flood the issue stream.
    if (isNoisyNetworkError(event, hint)) {
      return null;
    }
    return event;
  },
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
      isIncomingCallPush,
    } = require('./src/services/pushNotificationService');
    registerNotifeeBackgroundHandler();
    // Only load CallKeep native libs for actual call pushes. Loading them for
    // every "X is live" / like push on the main thread caused Background ANRs
    // (ALSE-21 / ALSE-1Z / ALSE-23) while the activity was stopped.
    const data = remoteMessage?.data || {};
    const title = String(
      remoteMessage?.notification?.title ?? data.title ?? '',
    ).toLowerCase();
    const type = String(
      data.notification_type ?? data.type ?? '',
    ).toLowerCase();
    const looksLikeCall =
      (typeof isIncomingCallPush === 'function' &&
        isIncomingCallPush(remoteMessage)) ||
      type === 'incoming_call' ||
      type === 'call_cancelled' ||
      type === 'call_cancel' ||
      title.includes('incoming call') ||
      title.includes('calling');
    if (looksLikeCall) {
      const {setupNativeCallKeep} = require('./src/services/nativeCallKeepService');
      await setupNativeCallKeep().catch(() => {});
    }
    await handleBackgroundFcmMessage(remoteMessage);
  } catch (e) {
    console.warn('[FCM] Notifee background display failed:', e?.message ?? e);
  }
});

  try {
    const {
      registerNotifeeBackgroundHandler,
    } = require('./src/services/pushNotificationService');
    const {setupNativeCallKeep} = require('./src/services/nativeCallKeepService');
    registerNotifeeBackgroundHandler();
    setupNativeCallKeep().catch(() => {});
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
