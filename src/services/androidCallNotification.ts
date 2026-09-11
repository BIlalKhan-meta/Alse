/**
 * Android incoming-call UI for background/killed state.
 *
 * Android 10+ forbids starting an activity from the background, so a killed app
 * cannot simply open itself when a call push arrives. The allowed mechanism is a
 * high-importance notification carrying a full-screen intent: the system shows
 * it over the lock screen, and falls back to a heads-up banner with
 * Answer/Decline actions when the device is unlocked.
 *
 * CallKeep's ConnectionService is deliberately not used here — it requires the
 * user to enable a phone account in system settings first, and silently shows
 * nothing until they do.
 */
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import {Platform} from 'react-native';

export const CALL_CHANNEL_ID = 'incoming_calls_v2';
export const CALL_NOTIFICATION_ID_PREFIX = 'call_';
export const CALL_ACTION_ANSWER = 'call_answer';
export const CALL_ACTION_DECLINE = 'call_decline';
export const CALL_ACTION_FULLSCREEN = 'call_fullscreen';

/** Matches the caller-side no-answer timeout in VideoCall/AudioCall. */
const RING_TIMEOUT_MS = 35000;

let channelReady: Promise<void> | null = null;

function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return Promise.resolve();
  }
  if (!channelReady) {
    channelReady = notifee
      .createChannel({
        id: CALL_CHANNEL_ID,
        name: 'Incoming calls',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'incoming_call',
        vibration: true,
        vibrationPattern: [300, 600, 300, 600],
        bypassDnd: true,
      })
      .then(() => undefined)
      .catch(err => {
        channelReady = null;
        throw err;
      });
  }
  return channelReady;
}

export function callNotificationId(uuid: string): string {
  return `${CALL_NOTIFICATION_ID_PREFIX}${String(uuid).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

export type AndroidIncomingCall = {
  uuid: string;
  chatId: string;
  callId: string;
  callerId: string;
  callerName: string;
  callType: 'audio' | 'video';
};

export async function showAndroidIncomingCall(
  call: AndroidIncomingCall,
): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await ensureChannel();

  // Notifee only round-trips string data back through press events.
  const data: Record<string, string> = {
    notification_type: 'incoming_call',
    uuid: call.uuid,
    call_id: call.callId,
    chat_id: call.chatId,
    caller_id: call.callerId,
    name: call.callerName,
    call_type: call.callType,
  };

  await notifee.displayNotification({
    id: callNotificationId(call.uuid),
    title: call.callerName || 'Incoming call',
    body: call.callType === 'video' ? 'Incoming video call' : 'Incoming voice call',
    data,
    android: {
      channelId: CALL_CHANNEL_ID,
      category: AndroidCategory.CALL,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      // Keep ringing until answered, declined, or the caller gives up.
      ongoing: true,
      autoCancel: false,
      onlyAlertOnce: false,
      loopSound: true,
      timeoutAfter: RING_TIMEOUT_MS,
      // Shows over the lock screen; degrades to a heads-up banner when unlocked.
      fullScreenAction: {
        id: CALL_ACTION_FULLSCREEN,
        launchActivity: 'default',
      },
      pressAction: {
        id: CALL_ACTION_ANSWER,
        launchActivity: 'default',
      },
      actions: [
        {
          title: 'Decline',
          pressAction: {id: CALL_ACTION_DECLINE},
        },
        {
          title: 'Answer',
          pressAction: {
            id: CALL_ACTION_ANSWER,
            launchActivity: 'default',
          },
        },
      ],
    },
  });
}

export async function cancelAndroidIncomingCall(uuid: string): Promise<void> {
  if (Platform.OS !== 'android' || !uuid) {
    return;
  }
  try {
    await notifee.cancelNotification(callNotificationId(uuid));
  } catch {
    /* already gone */
  }
}
