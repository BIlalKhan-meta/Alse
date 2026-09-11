/**
 * Incoming-call UI for background/killed state.
 *
 * iOS: CallKit, reported from PushKit in AppDelegate so the system can ring
 * before JS exists. JS only mirrors the payload and handles answer/decline.
 *
 * Android: a full-screen-intent notification (see androidCallNotification).
 * ConnectionService is not used — it needs a user-enabled phone account and
 * shows nothing until then.
 *
 * When the app is already foregrounded, the in-app CallIncomingModal owns the
 * UX and this module stays out of the way.
 */
import {Platform} from 'react-native';
import RNCallKeep, {CONSTANTS as CallKeepConstants} from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';
import {
  acceptIncomingCall,
  navigateToIncomingCall,
  rejectIncomingCall,
  type IncomingCallInfo,
} from './incomingCallActions';
import {
  cancelAndroidIncomingCall,
  showAndroidIncomingCall,
} from './androidCallNotification';

const CALLKEEP_IOS_OPTIONS = {
  ios: {
    appName: 'Alse',
    supportsVideo: true,
  },
  android: {
    alertTitle: '',
    alertDescription: '',
    cancelButton: '',
    okButton: '',
    additionalPermissions: [],
  },
};

type NativeIncomingCall = IncomingCallInfo & {uuid: string};

const pendingByUuid = new Map<string, NativeIncomingCall>();
const resolvedUuids = new Set<string>();
let setupPromise: Promise<void> | null = null;
let listenersBound = false;
let voipToken: string | null = null;
const voipTokenListeners = new Set<(token: string) => void>();
/** True only while the in-app incoming-call modal can actually be rendered. */
let inAppUiActive = false;

function normalizeUuid(uuid: string): string {
  return String(uuid || '').toLowerCase();
}

export function getVoipPushToken(): string | null {
  return voipToken;
}

export function onVoipToken(listener: (token: string) => void) {
  voipTokenListeners.add(listener);
  if (voipToken) {
    listener(voipToken);
  }
}

function emitVoipToken(token: string) {
  voipToken = token;
  voipTokenListeners.forEach(listener => {
    try {
      listener(token);
    } catch {
      /* listener owns its errors */
    }
  });
}

/**
 * IncomingCallHandler reports whether the in-app modal is mounted. This is a
 * more reliable "are we foregrounded" signal than AppState, which can report
 * `active` inside the Android headless task.
 */
export function setInAppCallUiActive(active: boolean) {
  inAppUiActive = active;
}

export function isInAppCallUiActive(): boolean {
  return inAppUiActive;
}

function parseCallPayload(
  data: Record<string, unknown> | null | undefined,
): NativeIncomingCall | null {
  if (!data) {
    return null;
  }
  const uuid = normalizeUuid(
    String(data.uuid || data.call_id || data.callId || ''),
  );
  const chatId = String(data.chat_id || data.chatId || '');
  if (!uuid || !chatId) {
    return null;
  }
  const callTypeRaw = String(
    data.call_type || data.callType || 'video',
  ).toLowerCase();
  return {
    uuid,
    chatId,
    callId: String(data.call_id || data.callId || uuid),
    callerId: String(data.caller_id || data.callerId || data.handle || ''),
    callerName: String(data.name || data.callerName || 'Incoming call'),
    callType: callTypeRaw === 'audio' ? 'audio' : 'video',
  };
}

function rememberCall(call: NativeIncomingCall) {
  pendingByUuid.set(call.uuid, call);
}

export function getPendingCall(uuid: string): NativeIncomingCall | undefined {
  return pendingByUuid.get(normalizeUuid(uuid));
}

export async function displayNativeIncomingCall(
  data: Record<string, unknown>,
  opts?: {fromPushKit?: boolean},
): Promise<void> {
  const parsed = parseCallPayload(data);
  if (!parsed) {
    console.warn('[IncomingCall] push missing uuid/chat_id', data);
    return;
  }

  const type = String(data.notification_type || data.type || '').toLowerCase();
  if (type === 'call_cancelled' || type === 'call_cancel') {
    console.log('[IncomingCall] cancel for', parsed.uuid);
    await endNativeIncomingCall(
      parsed.uuid,
      CallKeepConstants.END_CALL_REASONS.MISSED,
    );
    return;
  }

  if (resolvedUuids.has(parsed.uuid)) {
    return;
  }
  rememberCall(parsed);

  // CallKit was already presented natively by AppDelegate for this push.
  if (opts?.fromPushKit) {
    console.log('[IncomingCall] CallKit already reported for', parsed.uuid);
    return;
  }

  // Foreground with the modal mounted: let the in-app UI ring instead.
  if (inAppUiActive) {
    console.log('[IncomingCall] in-app modal active, skipping system UI');
    return;
  }

  console.log('[IncomingCall] presenting system UI', {
    uuid: parsed.uuid,
    platform: Platform.OS,
    callType: parsed.callType,
  });

  try {
    if (Platform.OS === 'android') {
      await showAndroidIncomingCall(parsed);
      return;
    }
    await setupNativeCallKeep();
    RNCallKeep.displayIncomingCall(
      parsed.uuid,
      parsed.callerId || parsed.chatId,
      parsed.callerName,
      'generic',
      parsed.callType === 'video',
    );
  } catch (e) {
    console.warn('[IncomingCall] failed to present system UI', e);
  }
}

export async function endNativeIncomingCall(
  uuid?: string | null,
  reason?: number,
): Promise<void> {
  if (!uuid) {
    return;
  }
  const id = normalizeUuid(uuid);
  pendingByUuid.delete(id);
  resolvedUuids.add(id);

  if (Platform.OS === 'android') {
    await cancelAndroidIncomingCall(id);
    return;
  }
  try {
    if (typeof reason === 'number') {
      RNCallKeep.reportEndCallWithUUID(id, reason);
    } else {
      RNCallKeep.endCall(id);
    }
  } catch {
    /* already ended */
  }
}

/** Answer from the system UI (CallKit button, or notification Answer action). */
export async function answerNativeCall(
  callUUID: string,
  fallback?: Record<string, unknown>,
): Promise<void> {
  const uuid = normalizeUuid(callUUID);
  const pending = pendingByUuid.get(uuid) || parseCallPayload(fallback);
  if (!pending) {
    console.warn('[IncomingCall] answer without payload', uuid);
    return;
  }
  resolvedUuids.add(uuid);
  pendingByUuid.delete(uuid);

  if (Platform.OS === 'android') {
    await cancelAndroidIncomingCall(uuid);
  } else {
    try {
      RNCallKeep.setCurrentCallActive(uuid);
    } catch {
      /* iOS reports active via CallKit itself */
    }
  }

  await acceptIncomingCall(pending);
  navigateToIncomingCall(pending);
}

/** Decline from the system UI. */
export async function declineNativeCall(
  callUUID: string,
  fallback?: Record<string, unknown>,
): Promise<void> {
  const uuid = normalizeUuid(callUUID);
  const pending = pendingByUuid.get(uuid) || parseCallPayload(fallback);
  pendingByUuid.delete(uuid);
  if (resolvedUuids.has(uuid)) {
    return;
  }
  resolvedUuids.add(uuid);

  if (Platform.OS === 'android') {
    await cancelAndroidIncomingCall(uuid);
  }
  if (!pending) {
    return;
  }
  await rejectIncomingCall(pending);
}

function bindListeners() {
  if (listenersBound) {
    return;
  }
  listenersBound = true;

  if (Platform.OS !== 'ios') {
    return;
  }

  RNCallKeep.addEventListener('answerCall', ({callUUID}) => {
    answerNativeCall(callUUID).catch(err =>
      console.warn('[CallKeep] answer failed', err),
    );
  });
  RNCallKeep.addEventListener('endCall', ({callUUID}) => {
    declineNativeCall(callUUID).catch(err =>
      console.warn('[CallKeep] end failed', err),
    );
  });
  RNCallKeep.addEventListener('didDisplayIncomingCall', payload => {
    const parsed = parseCallPayload(
      (payload?.payload || payload) as Record<string, unknown>,
    );
    if (parsed) {
      rememberCall(parsed);
    }
  });
  RNCallKeep.addEventListener('didLoadWithEvents', events => {
    (events || []).forEach(event => {
      const data = (event?.data || {}) as {
        callUUID?: string;
        payload?: Record<string, unknown>;
      };
      if (event.name === 'RNCallKeepDidDisplayIncomingCall') {
        const parsed = parseCallPayload(
          (data.payload || data) as Record<string, unknown>,
        );
        if (parsed) {
          rememberCall(parsed);
        }
      }
      if (event.name === 'RNCallKeepPerformAnswerCallAction' && data.callUUID) {
        answerNativeCall(data.callUUID).catch(() => {});
      }
      if (event.name === 'RNCallKeepPerformEndCallAction' && data.callUUID) {
        declineNativeCall(data.callUUID).catch(() => {});
      }
    });
  });

  VoipPushNotification.addEventListener('register', token => {
    console.log('[VoIP] token registered');
    emitVoipToken(String(token || ''));
  });
  VoipPushNotification.addEventListener('notification', notification => {
    const data = (notification || {}) as Record<string, unknown>;
    console.log('[VoIP] push received', data);
    displayNativeIncomingCall(data, {fromPushKit: true}).catch(() => {});
    const uuid = String(data.uuid || data.call_id || '');
    if (uuid) {
      VoipPushNotification.onVoipNotificationCompleted(uuid);
    }
  });
  VoipPushNotification.addEventListener('didLoadWithEvents', events => {
    (events || []).forEach(event => {
      if (
        event.name ===
        VoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent
      ) {
        emitVoipToken(String(event.data || ''));
      }
      if (
        event.name ===
        VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent
      ) {
        displayNativeIncomingCall(
          (event.data || {}) as Record<string, unknown>,
          {fromPushKit: true},
        ).catch(() => {});
      }
    });
  });
  VoipPushNotification.registerVoipToken();
}

export async function setupNativeCallKeep(): Promise<void> {
  if (setupPromise) {
    return setupPromise;
  }
  setupPromise = (async () => {
    bindListeners();
    if (Platform.OS !== 'ios') {
      // Android needs no CallKeep setup; the notification path has no
      // prerequisites beyond the notification channel.
      return;
    }
    try {
      await RNCallKeep.setup(CALLKEEP_IOS_OPTIONS);
    } catch (e) {
      console.warn('[CallKeep] setup failed', e);
    }
  })();
  return setupPromise;
}
