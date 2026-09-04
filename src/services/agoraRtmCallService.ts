/**
 * Agora RTM Call Service
 *
 * Initializes Agora RTM (Signaling) and listens for incoming call invitations.
 * When a remote invitation is received, the onIncomingCall callback is fired
 * so the app can show Accept/Decline UI (e.g. via GlobalCallNotification).
 *
 * Uses RtmEngine from agora-react-native-rtm (call invitations are on the
 * engine, not a separate "RtmCallManager" in this SDK).
 *
 * IMPORTANT: Do not top-level import agora-react-native-rtm — constructing
 * NativeEventEmitter before native methods exist floods Metro with warnings
 * and can contribute to flaky native crashes. Lazy-require only in init/release.
 */

import {AGORA_APP_ID, AGORA_SIGNALING_TOKEN} from '../config/agora';
import {GetAgoraRtmToken} from '../api/liveStream';

/** Agora RTM/Signaling requires channelId to be ≤64 bytes. Use short channel names. */
const RTM_CHANNEL_MAX_BYTES = 64;

const TAG = '[AgoraRtmCallService]';

/** Opaque invitation objects from the RTM SDK (avoid eager native import). */
type LocalInvitation = any;
type RemoteInvitation = any;
type RtmEngine = {
  createInstance: (appId: string) => Promise<void>;
  loginV2: (userId: string, token?: string) => Promise<void>;
  addListener: (
    event: string,
    cb: (...args: any[]) => void,
  ) => {remove: () => void};
  acceptRemoteInvitationV2: (inv: RemoteInvitation) => Promise<void>;
  refuseRemoteInvitationV2: (inv: RemoteInvitation) => Promise<void>;
  createLocalInvitation: (
    calleeId: string,
    content?: string,
    channelId?: string,
  ) => Promise<LocalInvitation>;
  sendLocalInvitationV2: (inv: LocalInvitation) => Promise<void>;
  cancelLocalInvitationV2: (inv: LocalInvitation) => Promise<void>;
  release: () => Promise<void>;
};

type RtmModule = {
  default: new () => RtmEngine;
  RtmConnectionState: {
    DISCONNECTED: number;
    CONNECTING: number;
    CONNECTED: number;
    RECONNECTING: number;
    ABORTED: number;
  };
};

let rtmModule: RtmModule | null = null;

function loadRtmModule(): RtmModule {
  if (!rtmModule) {
    // Lazy require — only when starting/ending call signaling.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    rtmModule = require('agora-react-native-rtm') as RtmModule;
  }
  return rtmModule;
}

function connectionStateName(state: number): string {
  const S = loadRtmModule().RtmConnectionState;
  const names: Record<number, string> = {
    [S.DISCONNECTED]: 'DISCONNECTED',
    [S.CONNECTING]: 'CONNECTING',
    [S.CONNECTED]: 'CONNECTED',
    [S.RECONNECTING]: 'RECONNECTING',
    [S.ABORTED]: 'ABORTED',
  };
  return names[state] ?? `UNKNOWN(${state})`;
}

let rtmEngine: RtmEngine | null = null;
/**
 * Serialize all native init/release work. Concurrent createInstance/release
 * crashes Android JNI (SIGSEGV) with no JS stack.
 */
let nativeLock: Promise<void> = Promise.resolve();
let initInFlight: Promise<void> | null = null;
let releaseInFlight: Promise<void> | null = null;
let isInitialized = false;
/**
 * Bumped on every release so late native callbacks (e.g. after Metro reload /
 * bridge destroy) no-op instead of emitting into a dead JS bridge.
 */
let sessionGeneration = 0;

const g = globalThis as typeof globalThis & {
  __ALSE_AGORA_RTM_CREATED__?: boolean;
  __ALSE_AGORA_RTM_ENGINE__?: RtmEngine | null;
};

function nativeRtmAlreadyCreated(): boolean {
  return !!g.__ALSE_AGORA_RTM_CREATED__;
}

function markNativeRtmCreated(engine: RtmEngine): void {
  g.__ALSE_AGORA_RTM_CREATED__ = true;
  g.__ALSE_AGORA_RTM_ENGINE__ = engine;
}

function clearNativeRtmCreated(): void {
  g.__ALSE_AGORA_RTM_CREATED__ = false;
  g.__ALSE_AGORA_RTM_ENGINE__ = null;
}

function isAlreadyCreatedError(err: unknown): boolean {
  const msg = String((err as {message?: string})?.message ?? err).toLowerCase();
  return (
    msg.includes('already') ||
    msg.includes('exist') ||
    msg.includes('created') ||
    msg.includes('duplicate')
  );
}

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const next = nativeLock.then(fn, fn);
  nativeLock = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

/** Guard for native listener callbacks — skip if this session was released. */
function ifLiveSession(gen: number, fn: () => void): void {
  if (!isInitialized || gen !== sessionGeneration) {
    return;
  }
  try {
    fn();
  } catch (err) {
    console.warn(TAG, 'listener callback error (ignored):', err);
  }
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
 * Get or create the RtmEngine instance (loads native module on first use).
 */
function getEngine(): RtmEngine {
  if (g.__ALSE_AGORA_RTM_ENGINE__) {
    rtmEngine = g.__ALSE_AGORA_RTM_ENGINE__;
    return rtmEngine;
  }
  if (!rtmEngine) {
    const RtmEngineCtor = loadRtmModule().default;
    rtmEngine = new RtmEngineCtor();
    g.__ALSE_AGORA_RTM_ENGINE__ = rtmEngine;
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

      if (nativeRtmAlreadyCreated()) {
        console.log(TAG, 'native RTM already created this process, skip createInstance');
      } else {
        try {
          await engine.createInstance(AGORA_APP_ID);
          console.log(TAG, 'createInstance ok');
        } catch (createErr) {
          if (!isAlreadyCreatedError(createErr)) {
            throw createErr;
          }
          console.warn(TAG, 'createInstance already ran this process, reusing');
        }
        markNativeRtmCreated(engine);
      }

      // App Certificate is enabled on the Agora project — loginV2 with an
      // empty token is LOGIN_ERR_INVALID_TOKEN. Fetch a Signaling token.
      let rtmToken = (token ?? AGORA_SIGNALING_TOKEN ?? '').trim();
      if (!rtmToken) {
        try {
          const tokenRes: any = await GetAgoraRtmToken();
          rtmToken = String(
            tokenRes?.data?.rtm_token ?? tokenRes?.data?.data?.rtm_token ?? '',
          ).trim();
          const serverAppId = String(
            tokenRes?.data?.agora_app_id ??
              tokenRes?.data?.data?.agora_app_id ??
              '',
          );
          if (serverAppId && AGORA_APP_ID && serverAppId !== AGORA_APP_ID) {
            throw new Error(
              'Agora App ID on the server does not match this app',
            );
          }
        } catch (tokenErr) {
          console.warn(TAG, 'failed to fetch RTM token', tokenErr);
        }
      }
      if (!rtmToken) {
        throw new Error(
          'Agora RTM token missing. App Certificate is enabled — cannot login with an empty token.',
        );
      }
      try {
        await engine.loginV2(userId, rtmToken);
        console.log(TAG, 'loginV2 ok for user:', userId);
      } catch (loginErr) {
        const loginMsg = String(
          (loginErr as {message?: string})?.message ?? loginErr,
        ).toLowerCase();
        if (
          isAlreadyCreatedError(loginErr) ||
          loginMsg.includes('logged in') ||
          loginMsg.includes('already login')
        ) {
          console.warn(TAG, 'login already done this process, continuing');
        } else {
          throw loginErr;
        }
      }

      const gen = sessionGeneration;
      isInitialized = true;

      if (subscriptions.length > 0) {
        console.log(TAG, 'RTM listeners already attached');
        return;
      }

      // Set up RTM call manager–style listeners (events are on RtmEngine in this SDK)
      const subReceived = engine.addListener(
        'RemoteInvitationReceived',
        (remoteInvitation: RemoteInvitation) => {
          ifLiveSession(gen, () => {
            console.log(TAG, 'Incoming call from:', remoteInvitation.callerId);
            currentRemoteInvitation = remoteInvitation;
            onIncomingCallCallback?.(remoteInvitation);
          });
        },
      );
      subscriptions.push(subReceived);

      const subAccepted = engine.addListener(
        'RemoteInvitationAccepted',
        (_remoteInvitation: RemoteInvitation) => {
          ifLiveSession(gen, () => {
            console.log(TAG, 'Callee accepted the call');
            currentRemoteInvitation = null;
          });
        },
      );
      subscriptions.push(subAccepted);

      const subRefused = engine.addListener(
        'RemoteInvitationRefused',
        (_remoteInvitation: RemoteInvitation) => {
          ifLiveSession(gen, () => {
            console.log(TAG, 'Callee refused the call');
            currentRemoteInvitation = null;
          });
        },
      );
      subscriptions.push(subRefused);

      const subCanceled = engine.addListener(
        'RemoteInvitationCanceled',
        (_remoteInvitation: RemoteInvitation) => {
          ifLiveSession(gen, () => {
            console.log(TAG, 'Caller canceled the call');
            currentRemoteInvitation = null;
            onInvitationEndedCallback?.();
          });
        },
      );
      subscriptions.push(subCanceled);

      const subFailure = engine.addListener(
        'RemoteInvitationFailure',
        (_remoteInvitation: RemoteInvitation, reason: number) => {
          ifLiveSession(gen, () => {
            console.log(TAG, 'Call invitation failed, reason:', reason);
            currentRemoteInvitation = null;
            onInvitationEndedCallback?.();
          });
        },
      );
      subscriptions.push(subFailure);

      // Caller side: clear local invitation when callee responds or invitation ends
      const subLocalAccepted = engine.addListener(
        'LocalInvitationAccepted',
        (_localInvitation: LocalInvitation) => {
          ifLiveSession(gen, () => {
            console.log(TAG, 'Callee accepted – call connected');
            localInvitationAccepted = true;
            currentLocalInvitation = null;
            if (onLocalInvitationAcceptedCallback) {
              try {
                onLocalInvitationAcceptedCallback();
              } catch (err) {
                console.error(TAG, 'onLocalInvitationAcceptedCallback error:', err);
              }
            }
          });
        },
      );
      subscriptions.push(subLocalAccepted);

      const subLocalRefused = engine.addListener(
        'LocalInvitationRefused',
        (_localInvitation: LocalInvitation) => {
          ifLiveSession(gen, () => {
            console.log(TAG, 'Callee refused the call');
            currentLocalInvitation = null;
            if (onLocalInvitationRefusedCallback) {
              try {
                onLocalInvitationRefusedCallback();
              } catch (err) {
                console.error(TAG, 'onLocalInvitationRefusedCallback error:', err);
              }
            }
          });
        },
      );
      subscriptions.push(subLocalRefused);

      const subLocalCanceled = engine.addListener(
        'LocalInvitationCanceled',
        (_localInvitation: LocalInvitation) => {
          ifLiveSession(gen, () => {
            currentLocalInvitation = null;
          });
        },
      );
      subscriptions.push(subLocalCanceled);

      const subLocalFailure = engine.addListener(
        'LocalInvitationFailure',
        (_localInvitation: LocalInvitation, _errorCode: number) => {
          ifLiveSession(gen, () => {
            currentLocalInvitation = null;
          });
        },
      );
      subscriptions.push(subLocalFailure);

      // Log connection state so you can verify signaling is working
      const subConn = engine.addListener(
        'ConnectionStateChanged',
        (state: number, _reason: number) => {
          ifLiveSession(gen, () => {
            console.log(TAG, 'Connection state:', connectionStateName(state));
            const connected = loadRtmModule().RtmConnectionState.CONNECTED;
            if (state === connected) {
              console.log(TAG, 'Agora RTM signaling is connected and ready');
            }
          });
        },
      );
      subscriptions.push(subConn);

      console.log(TAG, 'RTM call listeners set up');
    } catch (err) {
      console.error(TAG, 'init error:', err);
      if (nativeRtmAlreadyCreated()) {
        isInitialized = true;
        console.warn(TAG, 'keeping existing native RTM after init error');
        return;
      }
      // Tear down half-initialized native engine so the next init can retry safely.
      sessionGeneration += 1;
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
        clearNativeRtmCreated();
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
 * Release RTM and remove all listeners. Call on logout / App unmount (Metro reload).
 * Safe to call from multiple places concurrently (e.g. Redux listener + useEffect cleanup).
 * Shares the same exclusive lock as init so Android JNI never sees overlapping create/release.
 */
export async function releaseAgoraRtm(): Promise<void> {
  if (releaseInFlight) {
    return releaseInFlight;
  }
  releaseInFlight = runExclusive(async () => {
    // Invalidate first so any in-flight native → JS emits no-op.
    sessionGeneration += 1;
    isInitialized = false;
    localInvitationAccepted = false;

    const subs = subscriptions.splice(0, subscriptions.length);
    for (const sub of subs) {
      try {
        sub.remove();
      } catch (_) {}
    }

    currentRemoteInvitation = null;
    currentLocalInvitation = null;
    onIncomingCallCallback = null;
    onInvitationEndedCallback = null;
    onLocalInvitationAcceptedCallback = null;
    onLocalInvitationRefusedCallback = null;

    const engine = rtmEngine;
    rtmEngine = null;
    clearNativeRtmCreated();
    if (engine) {
      try {
        await engine.release();
      } catch (err) {
        console.warn(TAG, 'release error (ignored):', err);
      }
      if (__DEV__) {
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
