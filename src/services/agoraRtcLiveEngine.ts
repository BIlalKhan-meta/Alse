/**
 * Livestream view of the shared Agora RTC engine.
 *
 * The engine is a process-wide singleton owned by ./agoraRtcEngine — livestream
 * and 1:1 calls must not each construct their own, because on Android
 * createAgoraRtcEngine() returns the same native instance.
 */
export {
  ensureLiveRtcInitialized,
  getLiveRtcEngine,
  isLiveChannelJoined,
  leaveLiveChannel,
  markLiveChannelJoined,
  releaseLiveRtcEngine,
} from './agoraRtcEngine';
