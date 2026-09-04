/**
 * Process-wide Agora RTC engine for livestream.
 *
 * Android createAgoraRtcEngine() is a native singleton. Calling release() then
 * initialize()/joinChannel while Iris CallIrisApi is still in flight SIGSEGVs
 * on MediaTek/TECNO. Reuse one engine; leaveChannel between sessions; never
 * release on Android.
 */
import {Platform} from 'react-native';
import {
  ChannelProfileType,
  createAgoraRtcEngine,
  IRtcEngine,
} from 'react-native-agora';
import {AGORA_APP_ID} from '../config/agora';

const g = globalThis as typeof globalThis & {
  __ALSE_AGORA_RTC_ENGINE__?: IRtcEngine | null;
  __ALSE_AGORA_RTC_INITIALIZED__?: boolean;
  __ALSE_AGORA_RTC_IN_CHANNEL__?: boolean;
};

let nativeLock: Promise<void> = Promise.resolve();

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const next = nativeLock.then(fn, fn);
  nativeLock = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export function getLiveRtcEngine(): IRtcEngine {
  if (!g.__ALSE_AGORA_RTC_ENGINE__) {
    g.__ALSE_AGORA_RTC_ENGINE__ = createAgoraRtcEngine();
  }
  return g.__ALSE_AGORA_RTC_ENGINE__;
}

export async function ensureLiveRtcInitialized(): Promise<IRtcEngine> {
  return runExclusive(async () => {
    const engine = getLiveRtcEngine();
    if (!g.__ALSE_AGORA_RTC_INITIALIZED__) {
      if (!AGORA_APP_ID) {
        throw new Error('Agora App ID is not configured');
      }
      engine.initialize({
        appId: AGORA_APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      g.__ALSE_AGORA_RTC_INITIALIZED__ = true;
    }
    return engine;
  });
}

export function markLiveChannelJoined(): void {
  g.__ALSE_AGORA_RTC_IN_CHANNEL__ = true;
}

export async function leaveLiveChannel(): Promise<void> {
  return runExclusive(async () => {
    const engine = g.__ALSE_AGORA_RTC_ENGINE__;
    if (!engine || !g.__ALSE_AGORA_RTC_INITIALIZED__) {
      g.__ALSE_AGORA_RTC_IN_CHANNEL__ = false;
      return;
    }
    try {
      engine.stopPreview();
    } catch {
      // preview may not have started
    }
    try {
      engine.enableLocalVideo(false);
      engine.enableLocalAudio(false);
    } catch {
      // engine may already be idle
    }
    try {
      engine.leaveChannel();
    } catch {
      // may not be in a channel
    }
    g.__ALSE_AGORA_RTC_IN_CHANNEL__ = false;
    // Let in-flight CallIrisApi finish before the next join (Android singleton).
    await new Promise<void>(resolve => {
      setTimeout(resolve, Platform.OS === 'android' ? 400 : 80);
    });
  });
}

/** iOS-only. Never release on Android — native singleton + Iris race. */
export async function releaseLiveRtcEngine(): Promise<void> {
  if (Platform.OS === 'android') {
    await leaveLiveChannel();
    return;
  }
  return runExclusive(async () => {
    const engine = g.__ALSE_AGORA_RTC_ENGINE__;
    g.__ALSE_AGORA_RTC_ENGINE__ = null;
    g.__ALSE_AGORA_RTC_INITIALIZED__ = false;
    g.__ALSE_AGORA_RTC_IN_CHANNEL__ = false;
    if (!engine) {
      return;
    }
    try {
      engine.stopPreview();
    } catch {
      // ignore
    }
    try {
      engine.leaveChannel();
    } catch {
      // ignore
    }
    try {
      engine.release();
    } catch {
      // ignore
    }
  });
}
