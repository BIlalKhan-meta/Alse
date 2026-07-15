import notifee, {EventType} from '@notifee/react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import {
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {displayFcmWithNotifee} from '../utils/displayFcmWithNotifee';
import eventEmitter, {EVENT_TYPES} from '../utils/EventEmitter';
import {navigationRef} from '../utils/navigationRef';

type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

let handlersRegistered = false;
let backgroundHandlerRegistered = false;

function logFcmNotification(source: string, remoteMessage: RemoteMessage | null) {
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

function getMessageTitle(remoteMessage: RemoteMessage) {
  const data = remoteMessage.data || {};
  return String(
    remoteMessage.notification?.title ??
      data.title ??
      data.notification_title ??
      '',
  );
}

function isPaymentSuccess(remoteMessage: RemoteMessage) {
  const title = getMessageTitle(remoteMessage).toLowerCase();
  const data = remoteMessage.data || {};

  return (
    title === 'payment successful' ||
    String(data.type || '').toLowerCase() === 'payment_success'
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
}

function routeNotification(remoteMessage: RemoteMessage, fromUserPress: boolean) {
  if (isPaymentSuccess(remoteMessage)) {
    handlePaymentNotification(remoteMessage).catch(error => {
      console.warn('[FCM] payment notification handling failed:', error);
    });
    return;
  }

  const data = remoteMessage.data || {};
  if (data.chat_id) {
    navigateWhenReady('AcknowledgeCall', {
      chat_id: data.chat_id,
      role: '0',
      name: data.name,
      image: data.avatar,
    });
    return;
  }

  if (fromUserPress) {
    navigateWhenReady('Notifications');
  }
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
    }
    return await messaging().getToken();
  } catch (error) {
    console.warn('[FCM] get token failed:', error);
    return undefined;
  }
}

export async function handleBackgroundFcmMessage(remoteMessage: RemoteMessage) {
  logFcmNotification('background handler', remoteMessage);
  await displayFcmWithNotifee(remoteMessage);
}

export function registerNotifeeBackgroundHandler() {
  if (backgroundHandlerRegistered) {
    return;
  }

  backgroundHandlerRegistered = true;
  notifee.onBackgroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS && detail.notification) {
      console.log('[FCM] Notifee background press', detail.notification.data);
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
    routeNotification(remoteMessage, false);
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
  });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOpenedApp();
    unsubscribeNotifeeForeground();
    unsubscribeTokenRefresh();
    handlersRegistered = false;
  };
}
