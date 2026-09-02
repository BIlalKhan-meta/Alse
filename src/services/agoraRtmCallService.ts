/**
 * Agora RTM Call Service
 *
 * Initializes Agora RTM (Signaling) and listens for incoming call invitations.
 * When a remote invitation is received, the onIncomingCall callback is fired
 * so the app can show Accept/Decline UI (e.g. via GlobalCallNotification).
 *
 * Uses RtmEngine from agora-react-native-rtm (call invitations are on the
 * engine, not a separate "RtmCallManager" in this SDK).
 */

import RtmEngine, {
  type LocalInvitation,
  type RemoteInvitation,
  RtmConnectionState,
} from 'agora-react-native-rtm';
import {AGORA_APP_ID, AGORA_SIGNALING_TOKEN} from '../config/agora';

/** Agora RTM/Signaling requires channelId to be ≤64 bytes. Use short channel names. */
const RTM_CHANNEL_MAX_BYTES = 64;

const TAG = '[AgoraRtmCallService]';

/** Connection state names for logging */
const CONN_STATE_NAMES: Record<number, string> = {
  [RtmConnectionState.DISCONNECTED]: 'DISCONNECTED',
  [RtmConnectionState.CONNECTING]: 'CONNECTING',
  [RtmConnectionState.CONNECTED]: 'CONNECTED',
  [RtmConnectionState.RECONNECTING]: 'RECONNECTING',
  [RtmConnectionState.ABORTED]: 'ABORTED',
};

let rtmEngine: RtmEngine | null = null;
/**
 * Serialize all native init/release work. Concurrent createInstance/release
 * crashes Android JNI (SIGSEGV) with no JS stack.
 */
let nativeLock: Promise<void> = Promise.resolve();
let initInFlight: Promise<void> | null = null;
let releaseInFlight: Promise<void> | null = null;
let isInitialized = false;

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const next = nativeLock.then(fn, fn);
  nativeLock = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}
let currentRemoteInvitation: RemoteInvitation | null = null;
/** Last sent local invitation (caller side) – used to cancel when receiver doesn't pick up */
let currentLocalInvitation: LocalInvitation | null = null;
/** True once callee has accepted – do not cancel after that (both users on call). */
let localInvitationAccepted = false;
let onIncomingCallCallback: ((remoteInvitation: RemoteInvitation) => void) | null = null;
let onInvitationEndedCallback: (() => void) | null = null;
/** Caller only: called when LocalInvitationAccepted fires so UI can clear no-answer timeout immediately. */
let onLocalInvitationAcceptedCallback: (() => void) | null = null;
/** Caller only: called when LocalInvitationRefused fires (callee declined) so caller UI can close. */
let onLocalInvitationRefusedCallback: (() => void) | null = null;
/** Timestamp when a call was last handled (accepted/declined) - used to prevent duplicate overlays */
let lastCallHandledTimestamp: number = 0;
const CALL_HANDLED_COOLDOWN_MS = 5000;

const subscriptions: Array<{ remove: () => void }> = [];

/**
 * Get or create the RtmEngine instance.
 */
function getEngine(): RtmEngine {
  if (!rtmEngine) {
    rtmEngine = new RtmEngine();
  }
  return rtmEngine;
}

/**
 * Initialize Agora RTM and set up incoming call listeners.
 * Call this when the user is logged in (e.g. from GlobalCallNotification).
 *
 * @param userId - Current user ID (used as RTM uid)
 * @param token - Optional RTM token (use AGORA_SIGNALING_TOKEN or leave empty if no cert)
 * @param onIncomingCall - Called when a remote call invitation is received
 * @param onInvitationEnded - Called when invitation is canceled or failed (e.g. to clear UI and stop ringtone)
 */
export async function initAgoraRtm(
  userId: string,
  token?: string,
  onIncomingCall?: (remoteInvitation: RemoteInvitation) => void,
  onInvitationEnded?: () => void
): Promise<void> {
  if (!userId) {
    console.warn(TAG, 'init skipped: no userId');
    return;
  }

  // Always refresh callbacks even while another init is in flight.
  onIncomingCallCallback = onIncomingCall ?? null;
  onInvitationEndedCallback = onInvitationEnded ?? null;

  if (isInitialized) {
    console.log(TAG, 'already initialized, updating callbacks');
    return;
  }

  if (initInFlight) {
    await initInFlight;
    onIncomingCallCallback = onIncomingCall ?? null;
    onInvitationEndedCallback = onInvitationEnded ?? null;
    return;
  }

  initInFlight = runExclusive(async () => {
    // Release may have finished while we waited for the lock.
    if (isInitialized) {
      return;
    }

    let engine: RtmEngine | null = null;
    try {
      engine = getEngine();
      await engine.createInstance(AGORA_APP_ID);
      console.log(TAG, 'createInstance ok');

      // RTM SDK requires a token field; use empty string if not using app certificate
      const rtmToken = (token ?? AGORA_SIGNALING_TOKEN ?? '').trim();
      await engine.loginV2(userId, rtmToken || undefined);
      console.log(TAG, 'loginV2 ok for user:', userId);

      isInitialized = true;

      // Set up RTM call manager–style listeners (events are on RtmEngine in this SDK)
      const subReceived = engine.addListener(
        'RemoteInvitationReceived',
        (remoteInvitation: RemoteInvitation) => {
          console.log(TAG, 'Incoming call from:', remoteInvitation.callerId);
          currentRemoteInvitation = remoteInvitation;
          if (onIncomingCallCallback) {
            onIncomingCallCallback(remoteInvitation);
          }
        }
      );
      subscriptions.push(subReceived);

      const subAccepted = engine.addListener(
        'RemoteInvitationAccepted',
        (_remoteInvitation: RemoteInvitation) => {
          console.log(TAG, 'Callee accepted the call');
          currentRemoteInvitation = null;
        }
      );
      subscriptions.push(subAccepted);

      const subRefused = engine.addListener(
        'RemoteInvitationRefused',
        (_remoteInvitation: RemoteInvitation) => {
          console.log(TAG, 'Callee refused the call');
          currentRemoteInvitation = null;
        }
      );
      subscriptions.push(subRefused);

      const subCanceled = engine.addListener(
        'RemoteInvitationCanceled',
        (_remoteInvitation: RemoteInvitation) => {
          console.log(TAG, 'Caller canceled the call');
          currentRemoteInvitation = null;
          onInvitationEndedCallback?.();
        }
      );
      subscriptions.push(subCanceled);

      const subFailure = engine.addListener(
        'RemoteInvitationFailure',
        (_remoteInvitation: RemoteInvitation, reason: number) => {
          console.log(TAG, 'Call invitation failed, reason:', reason);
          currentRemoteInvitation = null;
          onInvitationEndedCallback?.();
        }
      );
      subscriptions.push(subFailure);

      // Caller side: clear local invitation when callee responds or invitation ends
      const subLocalAccepted = engine.addListener(
        'LocalInvitationAccepted',
        (_localInvitation: LocalInvitation) => {
          console.log(TAG, 'Callee accepted – call connected');
          localInvitationAccepted = true;
          currentLocalInvitation = null;
          console.log(TAG, 'Calling onLocalInvitationAcceptedCallback, callback exists:', !!onLocalInvitationAcceptedCallback);
          if (onLocalInvitationAcceptedCallback) {
            try {
              onLocalInvitationAcceptedCallback();
              console.log(TAG, '✅ onLocalInvitationAcceptedCallback executed successfully');
            } catch (err) {
              console.error(TAG, '❌ Error in onLocalInvitationAcceptedCallback:', err);
            }
          }
        }
      );
      subscriptions.push(subLocalAccepted);

      const subLocalRefused = engine.addListener(
        'LocalInvitationRefused',
        (_localInvitation: LocalInvitation) => {
          console.log(TAG, 'Callee refused the call');
          currentLocalInvitation = null;
          // Notify caller UI that callee declined
          if (onLocalInvitationRefusedCallback) {
            try {
              onLocalInvitationRefusedCallback();
              console.log(TAG, '✅ onLocalInvitationRefusedCallback executed successfully');
            } catch (err) {
              console.error(TAG, '❌ Error in onLocalInvitationRefusedCallback:', err);
            }
          }
        }
      );
      subscriptions.push(subLocalRefused);

      const subLocalCanceled = engine.addListener(
        'LocalInvitationCanceled',
        (_localInvitation: LocalInvitation) => {
          currentLocalInvitation = null;
        }
      );
      subscriptions.push(subLocalCanceled);

      const subLocalFailure = engine.addListener(
        'LocalInvitationFailure',
        (_localInvitation: LocalInvitation, _errorCode: number) => {
          currentLocalInvitation = null;
        }
      );
      subscriptions.push(subLocalFailure);

      // Log connection state so you can verify signaling is working
      const subConn = engine.addListener(
        'ConnectionStateChanged',
        (state: RtmConnectionState, _reason: number) => {
          const name = CONN_STATE_NAMES[state] ?? `UNKNOWN(${state})`;
          console.log(TAG, 'Connection state:', name);
          if (state === RtmConnectionState.CONNECTED) {
            console.log(TAG, '✅ Agora RTM signaling is connected and ready');
          }
        }
      );
      subscriptions.push(subConn);

      console.log(TAG, 'RTM call listeners set up');
    } catch (err) {
      console.error(TAG, 'init error:', err);
      // Tear down half-initialized native engine so the next init can retry safely.
      isInitialized = false;
      subscriptions.forEach(sub => {
        try {
          sub.remove();
        } catch (_) {}
      });
      subscriptions.length = 0;
      if (engine || rtmEngine) {
        try {
          await (engine ?? rtmEngine)!.release();
        } catch (_) {}
        rtmEngine = null;
      }
      throw err;
    }
  });

  try {
    await initInFlight;
  } finally {
    initInFlight = null;
  }
}

/**
 * Caller only: set a callback to run when the callee accepts (LocalInvitationAccepted).
 * Use this to clear the no-answer timeout as soon as the call is accepted, so we never
 * call cancelLocalInvitation() after the callee has accepted. Pass null to unregister.
 */
export function setOnLocalInvitationAccepted(callback: (() => void) | null): void {
  onLocalInvitationAcceptedCallback = callback;
}

/**
 * Caller only: set a callback to run when the callee declines (LocalInvitationRefused).
 * Use this to close the caller's call screen when the receiver declines the call.
 * Pass null to unregister.
 */
export function setOnLocalInvitationRefused(callback: (() => void) | null): void {
  onLocalInvitationRefusedCallback = callback;
}

/**
 * Mark that a call was just handled (accepted/declined).
 * Used to prevent duplicate overlays from socket + RTM race conditions.
 */
export function markCallHandled(): void {
  lastCallHandledTimestamp = Date.now();
  console.log(TAG, 'Call marked as handled');
}

/**
 * Check if a call was recently handled (within cooldown period).
 * Use this to prevent showing duplicate overlays.
 */
export function wasCallRecentlyHandled(): boolean {
  const timeSinceHandled = Date.now() - lastCallHandledTimestamp;
  return timeSinceHandled < CALL_HANDLED_COOLDOWN_MS;
}

/**
 * Get the current pending remote invitation (if any).
 * Use this when the user taps Accept to pass the invitation to acceptRemoteInvitation.
 */
export function getCurrentRemoteInvitation(): RemoteInvitation | null {
  return currentRemoteInvitation;
}

/**
 * Accept the given remote invitation (or the current one if none passed).
 * Call this when the user taps Accept on the incoming call UI.
 */
export async function acceptRemoteInvitation(
  remoteInvitation?: RemoteInvitation | null
): Promise<void> {
  const inv = remoteInvitation ?? currentRemoteInvitation;
  if (!inv) {
    console.warn(TAG, 'acceptRemoteInvitation: no invitation');
    return;
  }
  const engine = getEngine();
  await engine.acceptRemoteInvitationV2(inv);
  currentRemoteInvitation = null;
  console.log(TAG, 'Accepted remote invitation');
}

/**
 * Refuse the given remote invitation (or the current one if none passed).
 * Call this when the user taps Decline.
 */
export async function refuseRemoteInvitation(
  remoteInvitation?: RemoteInvitation | null
): Promise<void> {
  const inv = remoteInvitation ?? currentRemoteInvitation;
  if (!inv) {
    console.warn(TAG, 'refuseRemoteInvitation: no invitation');
    return;
  }
  const engine = getEngine();
  await engine.refuseRemoteInvitationV2(inv);
  currentRemoteInvitation = null;
  console.log(TAG, 'Refused remote invitation');
}

/**
 * Clear the current invitation without accepting/refusing (e.g. when call was canceled).
 */
export function clearCurrentInvitation(): void {
  currentRemoteInvitation = null;
}

/**
 * Send an outgoing call invitation via Agora RTM (caller side).
 * Call this when starting a call so the callee receives onRemoteInvitationReceived.
 *
 * Agora requires channelId to be ≤64 bytes; content ≤8 KB. Use options.chatId to build
 * a short channel like "chat_123" so caller and callee join the same RTC channel.
 *
 * @param calleeId - Other user's ID (same as RTM login uid, e.g. user_id from chat)
 * @param options - chatId (used to build short channelId "chat_<chatId>"), content (JSON string with chatId, callType, name; must be ≤8 KB)
 */
export async function sendLocalInvitation(
  calleeId: string,
  options?: { channelId?: string; content?: string; chatId?: string | number }
): Promise<void> {
  if (!calleeId) {
    console.warn(TAG, 'sendLocalInvitation: no calleeId');
    return;
  }
  if (!isInitialized || !rtmEngine) {
    console.warn(TAG, 'sendLocalInvitation: RTM not initialized, skipping');
    return;
  }
  // Agora RTM requires channelId ≤64 bytes. Prefer short "chat_<chatId>" when we have chatId.
  let channelId = options?.channelId;
  if (channelId == null || channelId.length > RTM_CHANNEL_MAX_BYTES) {
    channelId =
      options?.chatId != null ? `chat_${options.chatId}` : 'default';
  }
  const content = options?.content ?? '';
  if (content.length > 8 * 1024) {
    console.warn(TAG, 'sendLocalInvitation: content exceeds 8 KB, truncating');
  }
  try {
    const localInvitation = await rtmEngine.createLocalInvitation(
      String(calleeId),
      content || undefined,
      channelId
    );
    localInvitationAccepted = false; // New call – not yet accepted
    currentLocalInvitation = localInvitation;
    await rtmEngine.sendLocalInvitationV2(localInvitation);
    console.log(TAG, 'Sent call invitation to:', calleeId, 'channel:', channelId);
  } catch (err) {
    currentLocalInvitation = null;
    console.error(TAG, 'sendLocalInvitation error:', err);
    throw err;
  }
}

/**
 * Cancel the outgoing call (caller side) when receiver doesn't pick up.
 * Call this from the call screen after a no-answer timeout (e.g. 10s).
 */
export async function cancelLocalInvitation(): Promise<void> {
  // Do not cancel once both users are on the call (callee already accepted).
  if (localInvitationAccepted) {
    return;
  }
  const inv = currentLocalInvitation;
  if (!inv || !rtmEngine) {
    return;
  }
  try {
    await rtmEngine.cancelLocalInvitationV2(inv);
    console.log(TAG, 'Canceled local invitation (no answer)');
  } catch (err) {
    console.warn(TAG, 'cancelLocalInvitation error:', err);
  } finally {
    currentLocalInvitation = null;
  }
}

/**
 * Release RTM and remove all listeners. Call on logout.
 * Safe to call from multiple places concurrently (e.g. Redux listener + useEffect cleanup).
 * Shares the same exclusive lock as init so Android JNI never sees overlapping create/release.
 */
export async function releaseAgoraRtm(): Promise<void> {
  if (releaseInFlight) {
    return releaseInFlight;
  }
  releaseInFlight = runExclusive(async () => {
    subscriptions.forEach(sub => {
      try {
        sub.remove();
      } catch (_) {}
    });
    subscriptions.length = 0;
    currentRemoteInvitation = null;
    currentLocalInvitation = null;
    onIncomingCallCallback = null;
    onInvitationEndedCallback = null;
    onLocalInvitationAcceptedCallback = null;
    onLocalInvitationRefusedCallback = null;
    isInitialized = false;
    if (rtmEngine) {
      try {
        await rtmEngine.release();
      } catch (err) {
        console.warn(TAG, 'release error (ignored):', err);
      } finally {
        rtmEngine = null;
        console.log(TAG, 'released');
      }
    }
  });
  try {
    await releaseInFlight;
  } finally {
    releaseInFlight = null;
  }
}

/**
 * Returns whether Agora RTM has been initialized (login completed).
 * Use this to verify signaling is set up before testing incoming calls.
 */
export function isAgoraRtmReady(): boolean {
  return isInitialized;
}

/**
 * Returns whether the local (outgoing) call invitation has been accepted by the callee.
 * Use this to check if the callee already accepted before the callback was registered.
 */
export function isLocalInvitationAccepted(): boolean {
  return localInvitationAccepted;
}

export default {
  initAgoraRtm,
  setOnLocalInvitationAccepted,
  setOnLocalInvitationRefused,
  getCurrentRemoteInvitation,
  acceptRemoteInvitation,
  refuseRemoteInvitation,
  clearCurrentInvitation,
  sendLocalInvitation,
  cancelLocalInvitation,
  releaseAgoraRtm,
  isAgoraRtmReady,
  isLocalInvitationAccepted,
  markCallHandled,
  wasCallRecentlyHandled,
};
