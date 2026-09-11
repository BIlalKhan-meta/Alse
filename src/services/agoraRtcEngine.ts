/**
 * Process-wide Agora RTC engine — the single owner for livestream AND 1:1 calls.
 *
 * Android createAgoraRtcEngine() is a native singleton. Calling release() then
 * initialize()/joinChannel while Iris CallIrisApi is still in flight SIGSEGVs
 * on MediaTek/TECNO. Reuse one engine; leaveChannel between sessions; never
 * release on Android.
 *
 * Because the native engine outlives any one screen, the channel profile and
 * client role must be re-asserted every session (configureForLive /
 * configureForCall) — the profile passed to initialize() only applies to the
 * first initialize() call of the process.
 */
import {Platform} from 'react-native';
import {
  AudioProfileType,
  AudioScenarioType,
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  DegradationPreference,
  IRtcEngine,
  OrientationMode,
  VideoCodecType,
  VideoMirrorModeType,
} from 'react-native-agora';
import {AGORA_APP_ID} from '../config/agora';

const g = globalThis as typeof globalThis & {
  __ALSE_AGORA_RTC_ENGINE__?: IRtcEngine | null;
  __ALSE_AGORA_RTC_INITIALIZED__?: boolean;
  __ALSE_AGORA_RTC_IN_CHANNEL__?: boolean;
  __ALSE_AGORA_RTC_APP_ID__?: string;
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

export function getRtcEngine(): IRtcEngine {
  if (!g.__ALSE_AGORA_RTC_ENGINE__) {
    g.__ALSE_AGORA_RTC_ENGINE__ = createAgoraRtcEngine();
  }
  return g.__ALSE_AGORA_RTC_ENGINE__;
}

/** Engine exists and initialize() has run — safe to call config methods on. */
export function peekRtcEngine(): IRtcEngine | null {
  return g.__ALSE_AGORA_RTC_INITIALIZED__
    ? g.__ALSE_AGORA_RTC_ENGINE__ ?? null
    : null;
}

/** Must only be called from inside runExclusive. */
function initializeLocked(channelProfile: ChannelProfileType): IRtcEngine {
  if (!AGORA_APP_ID) {
    throw new Error('Agora App ID is not configured');
  }
  // App ID rotated (Metro reload) — native engine is bound to the old project.
  if (
    g.__ALSE_AGORA_RTC_INITIALIZED__ &&
    g.__ALSE_AGORA_RTC_APP_ID__ &&
    g.__ALSE_AGORA_RTC_APP_ID__ !== AGORA_APP_ID
  ) {
    const stale = g.__ALSE_AGORA_RTC_ENGINE__;
    try {
      stale?.leaveChannel();
    } catch {
      // ignore
    }
    try {
      stale?.release();
    } catch {
      // ignore
    }
    g.__ALSE_AGORA_RTC_ENGINE__ = null;
    g.__ALSE_AGORA_RTC_INITIALIZED__ = false;
    g.__ALSE_AGORA_RTC_IN_CHANNEL__ = false;
    g.__ALSE_AGORA_RTC_APP_ID__ = undefined;
  }
  const engine = getRtcEngine();
  if (!g.__ALSE_AGORA_RTC_INITIALIZED__) {
    engine.initialize({
      appId: AGORA_APP_ID,
      channelProfile,
    });
    g.__ALSE_AGORA_RTC_INITIALIZED__ = true;
    g.__ALSE_AGORA_RTC_APP_ID__ = AGORA_APP_ID;
  }
  return engine;
}

/**
 * Livestream session setup. Re-asserts LiveBroadcasting because a preceding
 * 1:1 call leaves the shared engine in Communication profile.
 */
export async function ensureLiveRtcInitialized(): Promise<IRtcEngine> {
  return runExclusive(async () => {
    const engine = initializeLocked(
      ChannelProfileType.ChannelProfileLiveBroadcasting,
    );
    try {
      engine.setChannelProfile(
        ChannelProfileType.ChannelProfileLiveBroadcasting,
      );
    } catch {
      // older native builds may not expose setChannelProfile
    }
    return engine;
  });
}

/**
 * 1:1 call session setup. Communication profile + broadcaster role, H.264
 * pinned so an iOS device with hardware H.265 encode never publishes a stream
 * the Android peer cannot decode (and vice versa) — that shows up as a black
 * remote view with working audio.
 *
 * Runs under the same lock as leaveRtcChannel so a livestream teardown can
 * never land on top of this configuration.
 */
export async function ensureCallRtcInitialized(
  isVideo: boolean,
): Promise<IRtcEngine> {
  return runExclusive(async () => {
    const engine = initializeLocked(
      ChannelProfileType.ChannelProfileCommunication,
    );
    try {
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
    } catch {
      // older native builds may not expose setChannelProfile
    }
    try {
      engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    } catch {
      // ignore
    }
    // Re-assert a speech profile every call. The shared engine may previously
    // have been configured for livestream music/high-quality audio.
    try {
      engine.setAudioProfile(
        AudioProfileType.AudioProfileSpeechStandard,
        AudioScenarioType.AudioScenarioDefault,
      );
      engine.adjustRecordingSignalVolume(100);
      engine.adjustPlaybackSignalVolume(100);
    } catch (e) {
      console.warn('[AgoraRtc] audio configuration failed', e);
    }
    if (isVideo) {
      try {
        engine.setVideoEncoderConfiguration({
          codecType: VideoCodecType.VideoCodecH264,
          dimensions: {width: 640, height: 360},
          frameRate: 15,
          bitrate: 0,
          orientationMode: OrientationMode.OrientationModeAdaptive,
          degradationPreference: DegradationPreference.MaintainFramerate,
          mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
        });
      } catch (e) {
        console.warn('[AgoraRtc] setVideoEncoderConfiguration failed', e);
      }
    }
    return engine;
  });
}

export function markChannelJoined(): void {
  g.__ALSE_AGORA_RTC_IN_CHANNEL__ = true;
}

export function isChannelJoined(): boolean {
  return !!g.__ALSE_AGORA_RTC_IN_CHANNEL__;
}

export async function leaveRtcChannel(force = false): Promise<void> {
  return runExclusive(async () => {
    const engine = g.__ALSE_AGORA_RTC_ENGINE__;
    if (!engine || !g.__ALSE_AGORA_RTC_INITIALIZED__) {
      g.__ALSE_AGORA_RTC_IN_CHANNEL__ = false;
      return;
    }
    // leaveChannel() while idle puts Iris in a leaving state; the next
    // joinChannel then returns -17 (ERR_JOIN_CHANNEL_REJECTED).
    if (!force && !g.__ALSE_AGORA_RTC_IN_CHANNEL__) {
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
export async function releaseRtcEngine(): Promise<void> {
  if (Platform.OS === 'android') {
    await leaveRtcChannel();
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

/* Legacy livestream aliases — GoLive imports these names. */
export const getLiveRtcEngine = getRtcEngine;
export const markLiveChannelJoined = markChannelJoined;
export const isLiveChannelJoined = isChannelJoined;
export const leaveLiveChannel = leaveRtcChannel;
export const releaseLiveRtcEngine = releaseRtcEngine;
