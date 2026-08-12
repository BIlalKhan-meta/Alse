import notifee, {EventType} from '@notifee/react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {AppState, Platform} from 'react-native';
import {
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {
  buildFcmDevicePayload,
  getStableDeviceId,
  refreshFcmDevice,
  registerFcmDevice,
  removeFcmDevice,
  trackNotificationClick,
  trackNotificationOpen,
} from '../api/notifications';
import store from '../store';
import {displayFcmWithNotifee} from '../utils/displayFcmWithNotifee';
import eventEmitter, {EVENT_TYPES} from '../utils/EventEmitter';
import {navigationRef} from '../utils/navigationRef';
import {refreshNotificationBadgeFromApi} from '../utils/notificationBadge';

type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

let handlersRegistered = false;
let backgroundHandlerRegistered = false;
let appStateSubscription: {remove: () => void} | null = null;
let pendingSyncRetry: ReturnType<typeof setTimeout> | null = null;
let syncAttempt = 0;

const MAX_SYNC_RETRIES = 5;
const BASE_RETRY_MS = 2000;

function clearPendingSyncRetry() {
  if (pendingSyncRetry) {
    clearTimeout(pendingSyncRetry);
    pendingSyncRetry = null;
  }
}

function scheduleFcmSyncRetry() {
  if (pendingSyncRetry || syncAttempt >= MAX_SYNC_RETRIES) {
    return;
  }
  const delay = BASE_RETRY_MS * Math.pow(2, syncAttempt);
  syncAttempt += 1;
  pendingSyncRetry = setTimeout(() => {
    pendingSyncRetry = null;
    syncFcmTokenWithBackend().catch(() => {});
  }, delay);
}

function logFcmNotification(source: string, remoteMessage: RemoteMessage | null) {
  if (!remoteMessage) {
    return;
  }

  const {notification, data, messageId} = remoteMessage;
  const title =
    notification?.title ??
    (data?.title != null ? String(data.title) : undefined) ??
    (data?.notification_title != null
      ? String(data.notification_title)
      : undefined);
  const body =
    notification?.body ??
    (data?.body != null ? String(data.body) : undefined) ??
    (data?.notification_body != null
      ? String(data.notification_body)
      : undefined);

  // Loud, easy-to-spot Metro / Xcode / logcat line for incoming pushes.
  console.log('========================================');
  console.log(`[INCOMING NOTIFICATION] ${source}`);
  console.log('title:', title ?? '(none)');
  console.log('body:', body ?? '(none)');
  console.log('messageId:', messageId ?? '(none)');
  console.log('data:', JSON.stringify(data ?? {}, null, 2));
  console.log('raw:', JSON.stringify(remoteMessage, null, 2));
  console.log('========================================');
}

function getMessageTitle(remoteMessage: RemoteMessage) {
  const data = remoteMessage.data || {};
  return String(
    remoteMessage.notification?.title ??
      data.title ??
      data.notification_title ??
      '',
  );
}

function dataString(data: Record<string, any> | undefined, key: string): string {
  if (!data || data[key] == null) {
    return '';
  }
  return String(data[key]);
}

function isPaymentSuccess(remoteMessage: RemoteMessage) {
  const title = getMessageTitle(remoteMessage).toLowerCase();
  const data = remoteMessage.data || {};
  const type = dataString(data, 'notification_type') || dataString(data, 'type');

  return (
    title === 'payment successful' ||
    type.toLowerCase() === 'payment' ||
    type.toLowerCase() === 'payment_success'
  );
}

function isIncomingCall(remoteMessage: RemoteMessage) {
  const data = remoteMessage.data || {};
  const type = dataString(data, 'notification_type') || dataString(data, 'type');
  const title = getMessageTitle(remoteMessage).toLowerCase();
  return (
    type.toLowerCase() === 'incoming_call' ||
    title.includes('incoming call') ||
    (Boolean(data.chat_id) && Boolean(data.name) && title.includes('calling'))
  );
}

async function handlePaymentNotification(remoteMessage: RemoteMessage) {
  try {
    await InAppBrowser.isAvailable();
    InAppBrowser.close();
  } catch (error) {
    console.warn('[FCM] Unable to close browser after payment:', error);
  }

  eventEmitter.emit(EVENT_TYPES.CHECKOUT_TRIGGER, remoteMessage);
}

function navigateWhenReady(routeName: string, params?: object) {
  const navigate = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(routeName as never, params as never);
      return true;
    }
    return false;
  };

  if (navigate()) {
    return;
  }

  setTimeout(navigate, 500);
  setTimeout(navigate, 1500);
}

function trackOpenAndClick(remoteMessage: RemoteMessage, fromUserPress: boolean) {
  const data = remoteMessage.data || {};
  const notificationId = dataString(data, 'notification_id');
  if (!notificationId || !store.getState().auth.token) {
    return;
  }

  trackNotificationOpen(notificationId).catch(() => {});
  if (fromUserPress) {
    trackNotificationClick(notificationId).catch(() => {});
  }
}

/**
 * Route notification taps / auto-nav from push payloads.
 * Exported for in-app notification list presses.
 */
export function routeNotificationPayload(
  data: Record<string, any>,
  options?: {fromUserPress?: boolean; title?: string},
) {
  const fromUserPress = options?.fromUserPress ?? true;
  const remoteMessage = {
    data,
    notification: {title: options?.title, body: ''},
  } as RemoteMessage;
  routeNotification(remoteMessage, fromUserPress);
}

function routeNotification(remoteMessage: RemoteMessage, fromUserPress: boolean) {
  if (isPaymentSuccess(remoteMessage)) {
    handlePaymentNotification(remoteMessage).catch(error => {
      console.warn('[FCM] payment notification handling failed:', error);
    });
    return;
  }

  if (fromUserPress) {
    trackOpenAndClick(remoteMessage, true);
  }

  const data = remoteMessage.data || {};
  const type = (
    dataString(data, 'notification_type') || dataString(data, 'type')
  ).toLowerCase();
  const objectType = dataString(data, 'object_type').toLowerCase();
  const objectId =
    dataString(data, 'object_id') ||
    dataString(data, 'chat_id') ||
    dataString(data, 'post_id') ||
    dataString(data, 'order_id') ||
    dataString(data, 'product_id') ||
    dataString(data, 'shop_id') ||
    dataString(data, 'user_id');
  const chatId = dataString(data, 'chat_id') || (objectType === 'chat' ? objectId : '');

  if (isIncomingCall(remoteMessage) && chatId) {
    navigateWhenReady('AcknowledgeCall', {
      chat_id: chatId,
      role: '0',
      name: data.name,
      image: data.avatar,
    });
    return;
  }

  if (
    (type === 'new_message' ||
      type === 'message_reply' ||
      objectType === 'chat') &&
    chatId
  ) {
    navigateWhenReady('ChatOngoing', {
      id: Number(chatId) || chatId,
      name: data.name || 'Chat',
      user: {avatar: data.avatar},
    });
    return;
  }

  if (objectType === 'order' && objectId) {
    navigateWhenReady('MyOrderDetail', {
      id: Number(objectId) || objectId,
    });
    return;
  }

  if (objectType === 'product' && objectId) {
    navigateWhenReady('ProductView', {
      productId: Number(objectId) || objectId,
    });
    return;
  }

  if (objectType === 'shop' && objectId) {
    navigateWhenReady('Shop', {
      shopId: Number(objectId) || objectId,
    });
    return;
  }

  if ((objectType === 'user' || type.includes('follow')) && objectId) {
    navigateWhenReady('Profile', {
      id: Number(objectId) || objectId,
    });
    return;
  }

  if (objectType === 'post' && objectId) {
    // No dedicated post-detail route; open notifications inbox for context
    navigateWhenReady('Notifications');
    return;
  }

  if (fromUserPress) {
    navigateWhenReady('Notifications');
  }
}

async function waitForApnsToken(maxAttempts = 10, delayMs = 500): Promise<string | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const apnsToken = await messaging().getAPNSToken();
      if (apnsToken) {
        console.log('[APNs] token ready', apnsToken);
        return apnsToken;
      }
      console.log(`[APNs] token not ready yet (attempt ${attempt}/${maxAttempts})`);
    } catch (error) {
      console.warn('[APNs] getAPNSToken failed:', error);
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  console.warn(
    '[APNs] No APNs token after waiting — iOS push will NOT deliver. Check Push capability + Firebase APNs key.',
  );
  return null;
}

export async function requestPushPermissionAndToken() {
  try {
    const permissionStatus = await checkNotifications();
    if (permissionStatus.status !== 'granted') {
      await requestNotifications(['alert', 'sound', 'badge']);
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
      const apnsToken = await waitForApnsToken();
      if (!apnsToken) {
        // Still try getToken for diagnostics, but warn hard.
        console.warn('[FCM] Continuing without APNs token — delivery will fail on iOS');
      }
    }

    await notifee.requestPermission();

    if (!enabled && Platform.OS === 'ios') {
      return undefined;
    }

    const token = await messaging().getToken();
    console.log('[FCM] token', token);
    return token;
  } catch (error) {
    console.warn('[FCM] permission/token failed:', error);
    return undefined;
  }
}

export async function getFcmToken() {
  try {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
      await waitForApnsToken();
    }
    return await messaging().getToken();
  } catch (error) {
    console.warn('[FCM] get token failed:', error);
    return undefined;
  }
}

export async function getDeviceIdsForAuth(): Promise<{
  deviceId: string;
  fcmToken?: string;
}> {
  const [deviceId, fcmToken] = await Promise.all([
    getStableDeviceId(),
    getFcmToken(),
  ]);
  return {deviceId, fcmToken: fcmToken || undefined};
}

/**
 * Register current FCM token with backend (requires auth).
 * Retries with exponential backoff on failure.
 */
export async function syncFcmTokenWithBackend(): Promise<void> {
  const authToken = store.getState().auth.token;
  if (!authToken) {
    return;
  }

  try {
    const fcmToken = await requestPushPermissionAndToken();
    if (!fcmToken) {
      console.warn('[FCM] No token to sync');
      scheduleFcmSyncRetry();
      return;
    }
    const payload = await buildFcmDevicePayload(fcmToken);
    await registerFcmDevice(payload);
    console.log('[FCM] device registered with backend', payload.device_id);
    syncAttempt = 0;
    clearPendingSyncRetry();
    refreshNotificationBadgeFromApi().catch(() => {});
  } catch (error) {
    console.warn('[FCM] sync with backend failed:', error);
    scheduleFcmSyncRetry();
  }
}

async function refreshFcmTokenWithBackend(fcmToken: string): Promise<void> {
  if (!store.getState().auth.token) {
    return;
  }
  try {
    const payload = await buildFcmDevicePayload(fcmToken);
    await refreshFcmDevice(payload);
    console.log('[FCM] device refreshed with backend', payload.device_id);
    syncAttempt = 0;
    clearPendingSyncRetry();
  } catch (error) {
    console.warn('[FCM] refresh with backend failed:', error);
    scheduleFcmSyncRetry();
  }
}

export async function unregisterFcmDeviceFromBackend(
  authTokenOverride?: string | null,
): Promise<void> {
  try {
    await removeFcmDevice(undefined, authTokenOverride);
    console.log('[FCM] device removed from backend');
  } catch (error) {
    console.warn('[FCM] remove device failed:', error);
  }
}

export async function handleBackgroundFcmMessage(remoteMessage: RemoteMessage) {
  logFcmNotification('background handler', remoteMessage);
  // If FCM already includes a notification payload, the OS shows it when
  // backgrounded/killed. Still display via Notifee for data-only messages.
  const hasNotificationPayload = Boolean(
    remoteMessage.notification?.title || remoteMessage.notification?.body,
  );
  if (!hasNotificationPayload) {
    await displayFcmWithNotifee(remoteMessage);
  }
}

export function registerNotifeeBackgroundHandler() {
  if (backgroundHandlerRegistered) {
    return;
  }

  backgroundHandlerRegistered = true;
  notifee.onBackgroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS && detail.notification) {
      console.log('[FCM] Notifee background press', detail.notification.data);
      const remoteMessage = {
        data: detail.notification.data || {},
        notification: {
          title: detail.notification.title,
          body: detail.notification.body,
        },
        messageId: detail.notification.id,
      } as RemoteMessage;
      routeNotification(remoteMessage, true);
    }
  });
}

export function registerPushNotificationHandlers() {
  if (handlersRegistered) {
    return () => {};
  }
  handlersRegistered = true;

  const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    logFcmNotification('foreground', remoteMessage);
    await displayFcmWithNotifee(remoteMessage);
    eventEmitter.emit(EVENT_TYPES.FCM_FOREGROUND_RECEIVED, remoteMessage);
    refreshNotificationBadgeFromApi().catch(() => {});
    // Foreground: show banner only; don't auto-navigate except payment/call
    if (isPaymentSuccess(remoteMessage) || isIncomingCall(remoteMessage)) {
      routeNotification(remoteMessage, false);
    }
  });

  const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
    remoteMessage => {
      logFcmNotification('opened from background tap', remoteMessage);
      routeNotification(remoteMessage, true);
    },
  );

  const unsubscribeNotifeeForeground = notifee.onForegroundEvent(
    ({type, detail}) => {
      if (type !== EventType.PRESS || !detail.notification) {
        return;
      }

      const remoteMessage = {
        data: detail.notification.data,
        notification: {
          title: detail.notification.title,
          body: detail.notification.body,
        },
        messageId: detail.notification.id,
      } as RemoteMessage;
      logFcmNotification('Notifee foreground tap', remoteMessage);
      routeNotification(remoteMessage, true);
    },
  );

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (!remoteMessage) {
        return;
      }
      logFcmNotification('opened from quit state tap', remoteMessage);
      routeNotification(remoteMessage, true);
    })
    .catch(error => {
      console.warn('[FCM] initial notification failed:', error);
    });

  if (notifee.getInitialNotification) {
    notifee
      .getInitialNotification()
      .then(initialNotification => {
        if (!initialNotification?.notification) {
          return;
        }

        const remoteMessage = {
          data: initialNotification.notification.data,
          notification: {
            title: initialNotification.notification.title,
            body: initialNotification.notification.body,
          },
          messageId: initialNotification.notification.id,
        } as RemoteMessage;
        logFcmNotification('Notifee initial tap', remoteMessage);
        routeNotification(remoteMessage, true);
      })
      .catch(error => {
        console.warn('[FCM] Notifee initial notification failed:', error);
      });
  }

  const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
    console.log('[FCM] token refreshed', token);
    refreshFcmTokenWithBackend(token).catch(() => {});
  });

  if (!appStateSubscription) {
    appStateSubscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && store.getState().auth.token) {
        syncFcmTokenWithBackend().catch(() => {});
        refreshNotificationBadgeFromApi().catch(() => {});
      }
    });
  }

  return () => {
    unsubscribeOnMessage();
    unsubscribeOpenedApp();
    unsubscribeNotifeeForeground();
    unsubscribeTokenRefresh();
    appStateSubscription?.remove();
    appStateSubscription = null;
    clearPendingSyncRetry();
    handlersRegistered = false;
  };
}
