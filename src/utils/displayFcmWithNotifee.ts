import notifee, {AndroidImportance} from '@notifee/react-native';
import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

export const FCM_NOTIFEE_CHANNEL_ID = 'fcm_general';

let androidChannelReady: Promise<void> | null = null;

function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return Promise.resolve();
  }
  if (!androidChannelReady) {
    androidChannelReady = notifee
      .createChannel({
        id: FCM_NOTIFEE_CHANNEL_ID,
        name: 'General',
        importance: AndroidImportance.HIGH,
        vibration: true,
      })
      .then(() => undefined);
  }
  return androidChannelReady;
}

function stringifyData(
  data: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!data || Object.keys(data).length === 0) {
    return undefined;
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = v == null ? '' : String(v);
  }
  return out;
}

/**
 * Shows a heads-up / banner for FCM while foregrounded, and for data-only
 * messages handled in the background JS task.
 */
export async function displayFcmWithNotifee(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const notification = remoteMessage.notification;
  const data = remoteMessage.data;

  const title =
    notification?.title ??
    (data?.title != null ? String(data.title) : undefined) ??
    undefined;
  const body =
    notification?.body ??
    (data?.body != null ? String(data.body) : undefined) ??
    '';

  if (title == null && body === '') {
    return;
  }

  await ensureAndroidChannel();

  const safeId = remoteMessage.messageId
    ? remoteMessage.messageId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128)
    : undefined;

  await notifee.displayNotification({
    id: safeId,
    title: title != null ? String(title) : 'Notification',
    body: String(body),
    data: stringifyData(data),
    android: {
      channelId: FCM_NOTIFEE_CHANNEL_ID,
      // `launchActivity` must be a real Activity class name, not "default".
      pressAction: {id: 'default'},
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        banner: true,
        sound: true,
        badge: true,
        list: true,
      },
    },
  });
}

export async function requestNotifeePermission(): Promise<void> {
  try {
    await notifee.requestPermission();
  } catch {
    // Non-fatal; FCM may still work with messaging permission alone.
  }
}
