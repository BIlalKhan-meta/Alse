/**
 * 1:1 Agora call session (audio or video).
 *
 * Owns the whole RTC lifecycle for a call screen so VideoCall and AudioCall
 * stay presentational. Built on the shared engine in
 * ../services/agoraRtcEngine — never construct an engine anywhere else.
 *
 * Two rules here exist because of real cross-platform failures:
 *
 * 1. A remote user becomes renderable on onUserJoined, NOT on
 *    onRemoteVideoStateChanged(Decoding). That decoding event is routinely
 *    missed on Android, and gating the view on it is what produced permanent
 *    black remote video while audio flowed fine.
 * 2. For video, startPreview() only runs once the local video view has laid
 *    out. Starting the camera with no attached native view SIGSEGVs the camera
 *    HAL on MediaTek/TECNO devices.
 * 3. Video views may only mount after the engine is initialized (engineReady).
 *    RtcTextureView issues setupLocalVideo/setupRemoteVideo the moment it
 *    mounts; on Android, doing that against an uninitialized engine binds the
 *    TextureView to nothing and it stays black for the whole call. iOS's
 *    RtcSurfaceView happens to tolerate it, which is why this only ever showed
 *    up on Android.
 */
import {useCallback, useEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  IRtcEngineEventHandler,
  RemoteVideoState,
  RemoteVideoStateReason,
} from 'react-native-agora';
import {
  ensureCallRtcInitialized,
  isChannelJoined,
  leaveRtcChannel,
  markChannelJoined,
} from '../services/agoraRtcEngine';

const JOIN_TIMEOUT_MS = 20000;
const CONNECTION_POLL_MS = 300;
/** Local view normally lays out in well under 100ms; this is a safety net. */
const SURFACE_WAIT_MS = 3000;

const toUid = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Agora events sometimes pack the uid into the connection object. */
const extractRemoteUid = (...args: unknown[]): number => {
  if (typeof args[1] === 'number') {
    const n = toUid(args[1]);
    if (n) {
      return n;
    }
  }
  if (typeof args[0] === 'number') {
    const n = toUid(args[0]);
    if (n) {
      return n;
    }
  }
  for (const arg of args) {
    if (arg && typeof arg === 'object') {
      const n = toUid((arg as Record<string, unknown>).remoteUid);
      if (n) {
        return n;
      }
    }
  }
  return 0;
};

export type UseAgoraCallSessionOptions = {
  channel: string | null;
  token: string | null;
  uid: number;
  isVideo: boolean;
  /** Gate the join on permissions + token being ready. */
  enabled: boolean;
  onJoined?: () => void;
  onRemoteJoined?: (uid: number) => void;
  onRemoteLeft?: (uid: number) => void;
  onError?: (message: string) => void;
  /** Resolve a fresh RTC token for renewal; return null to skip. */
  fetchToken?: () => Promise<string | null>;
};

export type AgoraCallSession = {
  joined: boolean;
  /**
   * The native engine is initialized and safe to bind video views to.
   * Video views MUST NOT be mounted before this is true — see the note on
   * rule 3 at the top of this file.
   */
  engineReady: boolean;
  remoteUids: number[];
  primaryRemoteUid: number | null;
  /** Remote is in the channel but publishing no decodable video. */
  remoteVideoOff: boolean;
  micMuted: boolean;
  cameraOff: boolean;
  speakerOn: boolean;
  error: string | null;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
  switchCamera: () => void;
  /** Wire to the local video view's onLayout — gates startPreview. */
  onLocalViewLayout: () => void;
};

const log = (...args: unknown[]) => console.log('[AgoraCall]', ...args);

export default function useAgoraCallSession(
  options: UseAgoraCallSessionOptions,
): AgoraCallSession {
  const {channel, token, uid, isVideo, enabled} = options;

  const [joined, setJoined] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [remoteUids, setRemoteUids] = useState<number[]>([]);
  const [remoteVideoOff, setRemoteVideoOff] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(!isVideo);
  // Start audibly on both platforms. Users can still switch an audio call to
  // the earpiece with the existing Speaker control.
  const [speakerOn, setSpeakerOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef<IRtcEngine | null>(null);
  const handlerRef = useRef<IRtcEngineEventHandler | null>(null);
  const emitterListenersRef = useRef<
    Array<{event: string; listener: (...args: any[]) => void}>
  >([]);
  const startedRef = useRef(false);
  const teardownRef = useRef(false);
  const joinedRef = useRef(false);
  const surfaceReadyRef = useRef(false);
  const pendingRef = useRef<{
    token: string;
    channel: string;
    uid: number;
    previewLaunched: boolean;
    joinLaunched: boolean;
  } | null>(null);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const surfaceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Callbacks change identity every render; keep them in refs so the session
  // effect never re-runs (a re-run would rejoin the channel).
  const cbRef = useRef(options);
  cbRef.current = options;

  const clearJoinTimeout = useCallback(() => {
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
      joinTimeoutRef.current = null;
    }
    if (connectionPollRef.current) {
      clearInterval(connectionPollRef.current);
      connectionPollRef.current = null;
    }
  }, []);

  /**
   * RN 0.79's EventEmitter has no removeListener, so engine.removeListener()
   * throws and emitter subscriptions leak. removeAllListeners(event) is the
   * only working path, and it is safe: registerEventHandler keeps its handlers
   * in a static array, not on DeviceEventEmitter.
   */
  const detachEmitterListeners = useCallback(() => {
    const engine = engineRef.current;
    const events = new Set(emitterListenersRef.current.map(l => l.event));
    events.forEach(event => {
      try {
        engine?.removeAllListeners?.(event as any);
      } catch {
        // ignore
      }
    });
    emitterListenersRef.current = [];
  }, []);

  const fail = useCallback((message: string) => {
    setError(message);
    cbRef.current.onError?.(message);
  }, []);

  const activateAudio = useCallback((engine: IRtcEngine) => {
    // leaveRtcChannel() disables local audio on the process-wide native
    // engine. Re-enable it both before and after join; Android/iOS can reset
    // the track while transitioning into the channel.
    engine.enableAudio();
    engine.enableLocalAudio(true);
    engine.muteLocalAudioStream(false);
    engine.muteAllRemoteAudioStreams(false);
    engine.adjustRecordingSignalVolume(100);
    engine.adjustPlaybackSignalVolume(100);
    engine.setEnableSpeakerphone(true);
  }, []);

  const markSessionJoined = useCallback(
    (source: string) => {
      if (joinedRef.current || teardownRef.current) {
        return;
      }
      log('joined via', source);
      joinedRef.current = true;
      clearJoinTimeout();
      setJoined(true);
      setError(null);
      const engine = engineRef.current;
      if (engine) {
        try {
          activateAudio(engine);
        } catch (e) {
          log('post-join audio activation failed', e);
        }
      }
      cbRef.current.onJoined?.();
    },
    [activateAudio, clearJoinTimeout],
  );

  /** joinChannel + explicit subscribe/route. Idempotent. */
  const joinPending = useCallback(() => {
    const pending = pendingRef.current;
    const engine = engineRef.current;
    if (!pending || pending.joinLaunched || !engine || teardownRef.current) {
      return;
    }
    pending.joinLaunched = true;
    try {
      log('joinChannel', pending.channel, 'uid', pending.uid);
      const result = engine.joinChannel(
        pending.token,
        pending.channel,
        pending.uid,
        {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          publishMicrophoneTrack: true,
          publishCameraTrack: isVideo,
          autoSubscribeAudio: true,
          autoSubscribeVideo: isVideo,
        },
      );
      // -17 ERR_JOIN_CHANNEL_REJECTED means a join is already in flight.
      // Leaving here would abort it and strand the call.
      if (result === -17 || result === 17) {
        log('joinChannel returned -17, waiting for join success');
      } else if (typeof result === 'number' && result < 0) {
        throw new Error(`joinChannel failed with code ${result}`);
      }
      markChannelJoined();

      // The UIKit never did this, and a stale global mute from a previous
      // livestream session is enough to produce a black remote view.
      try {
        engine.muteAllRemoteVideoStreams(false);
        activateAudio(engine);
      } catch {
        // older native builds may not expose these
      }

      clearJoinTimeout();
      // Android can carry media while dropping both the join callback and the
      // JS emitter event. Native connection state is authoritative, so poll it
      // briefly instead of leaving an opaque loader over a working call.
      connectionPollRef.current = setInterval(() => {
        try {
          if (engine.getConnectionState() === 3) {
            markSessionJoined('getConnectionState=3');
          }
        } catch {
          // ignore
        }
      }, CONNECTION_POLL_MS);
      joinTimeoutRef.current = setTimeout(() => {
        if (!joinedRef.current && !teardownRef.current) {
          fail('Could not connect the call. Check your network and try again.');
        }
      }, JOIN_TIMEOUT_MS);
    } catch (e: any) {
      log('join failed', e);
      fail(e?.message || 'Failed to join the call');
    }
  }, [
    isVideo,
    activateAudio,
    clearJoinTimeout,
    fail,
    markSessionJoined,
  ]);

  /** enableVideo/startPreview then join. Gated on local view layout for video. */
  const launchPending = useCallback(() => {
    const pending = pendingRef.current;
    const engine = engineRef.current;
    if (!pending || pending.previewLaunched || !engine || teardownRef.current) {
      return;
    }
    if (isVideo && !surfaceReadyRef.current) {
      return;
    }
    pending.previewLaunched = true;
    if (surfaceTimeoutRef.current) {
      clearTimeout(surfaceTimeoutRef.current);
      surfaceTimeoutRef.current = null;
    }
    try {
      activateAudio(engine);
      if (isVideo) {
        engine.enableVideo();
        engine.enableLocalVideo(true);
        engine.muteLocalVideoStream(false);
        try {
          engine.startPreview();
        } catch (e) {
          // Missing preview is survivable; remote video still works.
          log('startPreview failed', e);
        }
      } else {
        // Audio call: keep the video module off entirely.
        engine.disableVideo();
        engine.enableLocalVideo(false);
        engine.muteLocalVideoStream(true);
      }
    } catch (e: any) {
      log('preview launch failed', e);
      fail(e?.message || 'Failed to start the camera');
      return;
    }
    joinPending();
  }, [isVideo, activateAudio, joinPending, fail]);

  const onLocalViewLayout = useCallback(() => {
    if (surfaceReadyRef.current) {
      return;
    }
    surfaceReadyRef.current = true;
    log('local view laid out');
    // Let the native view attach to Iris before enableVideo/startPreview.
    setTimeout(() => launchPending(), 250);
  }, [launchPending]);

  useEffect(() => {
    if (!enabled || !channel || !token || uid <= 0) {
      return;
    }
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    teardownRef.current = false;
    // Video views only mount once engineReady flips true below, so the local
    // view's onLayout always lands after this reset.
    surfaceReadyRef.current = false;
    joinedRef.current = false;

    let cancelled = false;

    const start = async () => {
      try {
        // The shared engine may still be in a livestream channel.
        if (isChannelJoined()) {
          await leaveRtcChannel();
        }
        const engine = await ensureCallRtcInitialized(isVideo);
        if (cancelled || teardownRef.current) {
          return;
        }
        engineRef.current = engine;

        try {
          engine.setDefaultAudioRouteToSpeakerphone(true);
          activateAudio(engine);
        } catch (e) {
          log('initial audio activation failed', e);
        }

        // onUserJoined, onFirstRemoteVideoFrame and onRemoteVideoStateChanged
        // all report the same peer, so dedupe before notifying the screen.
        const knownRemotes = new Set<number>();
        const addRemote = (remote: number) => {
          if (!remote || remote === uid || teardownRef.current) {
            return;
          }
          if (knownRemotes.has(remote)) {
            return;
          }
          knownRemotes.add(remote);
          setRemoteUids(prev =>
            prev.includes(remote) ? prev : [...prev, remote],
          );
          cbRef.current.onRemoteJoined?.(remote);
        };
        const removeRemote = (remote: number) => {
          if (!remote || !knownRemotes.delete(remote)) {
            return;
          }
          setRemoteUids(prev => prev.filter(u => u !== remote));
          cbRef.current.onRemoteLeft?.(remote);
        };

        const handler: IRtcEngineEventHandler = {
          onJoinChannelSuccess: () =>
            markSessionJoined('onJoinChannelSuccess'),
          onUserJoined: (...args: any[]) => {
            const remote = extractRemoteUid(...args);
            log('onUserJoined', remote);
            markSessionJoined('onUserJoined');
            // Render immediately — do not wait for a video state event.
            setRemoteVideoOff(false);
            addRemote(remote);
          },
          onUserOffline: (...args: any[]) => {
            const remote = extractRemoteUid(...args);
            log('onUserOffline', remote);
            setRemoteVideoOff(false);
            removeRemote(remote);
          },
          onFirstRemoteVideoFrame: (...args: any[]) => {
            const remote = extractRemoteUid(...args);
            log('onFirstRemoteVideoFrame', remote);
            markSessionJoined('onFirstRemoteVideoFrame');
            setRemoteVideoOff(false);
            addRemote(remote);
          },
          onRemoteVideoStateChanged: (...args: any[]) => {
            const remote = extractRemoteUid(...args);
            const state = typeof args[2] === 'number' ? args[2] : undefined;
            const reason = typeof args[3] === 'number' ? args[3] : undefined;
            log('onRemoteVideoStateChanged', remote, 'state', state, 'reason', reason);
            markSessionJoined('onRemoteVideoStateChanged');
            if (reason === RemoteVideoStateReason.RemoteVideoStateReasonCodecNotSupport) {
              // Should be impossible now that H.264 is pinned, but never fail
              // silently into a black rectangle again.
              fail('This device cannot decode the other side\u2019s video.');
              return;
            }
            if (
              state === RemoteVideoState.RemoteVideoStateDecoding ||
              state === RemoteVideoState.RemoteVideoStateStarting
            ) {
              setRemoteVideoOff(false);
              addRemote(remote);
            } else if (state === RemoteVideoState.RemoteVideoStateStopped) {
              setRemoteVideoOff(true);
            }
          },
          onLocalVideoStateChanged: (...args: any[]) => {
            log('onLocalVideoStateChanged', args[1], 'reason', args[2]);
          },
          onLocalAudioStateChanged: (...args: any[]) => {
            log('onLocalAudioStateChanged', args[1], 'reason', args[2]);
          },
          onRemoteAudioStateChanged: (...args: any[]) => {
            const remote = extractRemoteUid(...args);
            log(
              'onRemoteAudioStateChanged',
              remote,
              'state',
              args[2],
              'reason',
              args[3],
            );
            markSessionJoined('onRemoteAudioStateChanged');
            addRemote(remote);
          },
          onAudioPublishStateChanged: (...args: any[]) => {
            log('onAudioPublishStateChanged', args);
          },
          onAudioSubscribeStateChanged: (...args: any[]) => {
            log('onAudioSubscribeStateChanged', args);
          },
          onError: (err: number, msg: string) => {
            log('onError', err, msg);
            if (err === -17 || err === 17) {
              return;
            }
            if (err === 110 || err === -110 || err === 109 || err === -109) {
              fail('Call token was rejected. Please try again.');
            }
          },
          onConnectionStateChanged: (
            _connection: any,
            state: number,
            reason: number,
          ) => {
            log('onConnectionStateChanged state', state, 'reason', reason);
            if (state === 3) {
              markSessionJoined('connectionState=3');
              return;
            }
            if (state === 5) {
              clearJoinTimeout();
              if (reason === 8 || reason === 9) {
                fail('Call token was rejected. Please try again.');
                return;
              }
              fail(`Call connection failed (reason ${reason}).`);
            }
          },
          onTokenPrivilegeWillExpire: () => {
            log('onTokenPrivilegeWillExpire');
            const fetcher = cbRef.current.fetchToken;
            if (!fetcher) {
              return;
            }
            fetcher()
              .then(fresh => {
                if (fresh && engineRef.current) {
                  engineRef.current.renewToken(fresh);
                  log('token renewed');
                }
              })
              .catch(e => log('token renewal failed', e));
          },
        };

        engine.registerEventHandler(handler);
        handlerRef.current = handler;

        // registerEventHandler alone drops events on some native builds;
        // GoLive relies on the emitter too. Belt and braces.
        detachEmitterListeners();
        const listen = (event: keyof IRtcEngineEventHandler) => {
          const listener = handler[event] as (...a: any[]) => void;
          if (!listener) {
            return;
          }
          try {
            engine.addListener(event as any, listener as any);
            emitterListenersRef.current.push({event, listener});
          } catch {
            // ignore
          }
        };
        listen('onJoinChannelSuccess');
        listen('onConnectionStateChanged');
        listen('onError');
        listen('onUserJoined');
        listen('onUserOffline');
        listen('onFirstRemoteVideoFrame');
        listen('onRemoteVideoStateChanged');
        listen('onLocalVideoStateChanged');
        listen('onLocalAudioStateChanged');
        listen('onRemoteAudioStateChanged');
        listen('onAudioPublishStateChanged');
        listen('onAudioSubscribeStateChanged');
        listen('onTokenPrivilegeWillExpire');

        pendingRef.current = {
          token,
          channel,
          uid,
          previewLaunched: false,
          joinLaunched: false,
        };

        // Engine + handlers are live, so video views can now safely bind.
        // This is what releases the local view for mounting on Android.
        setEngineReady(true);

        if (!isVideo) {
          launchPending();
          return;
        }
        // Video: wait for the local view to lay out. It mounts as soon as
        // engineReady propagates, so this normally fires within a frame or two.
        surfaceTimeoutRef.current = setTimeout(() => {
          if (!pendingRef.current?.previewLaunched) {
            log('local view never laid out; joining without preview');
            surfaceReadyRef.current = true;
            launchPending();
          }
        }, SURFACE_WAIT_MS);
      } catch (e: any) {
        log('session start failed', e);
        if (!cancelled) {
          fail(e?.message || 'Could not start the call');
        }
      }
    };

    // start() handles its own errors, so it never rejects.
    start();

    return () => {
      cancelled = true;
      teardownRef.current = true;
      startedRef.current = false;
      clearJoinTimeout();
      if (surfaceTimeoutRef.current) {
        clearTimeout(surfaceTimeoutRef.current);
        surfaceTimeoutRef.current = null;
      }
      pendingRef.current = null;
      setEngineReady(false);
      const engine = engineRef.current;
      detachEmitterListeners();
      if (engine) {
        try {
          if (handlerRef.current) {
            engine.unregisterEventHandler(handlerRef.current);
          }
        } catch {
          // ignore
        }
        handlerRef.current = null;
      }
      // Never release() on Android — shared native singleton.
      leaveRtcChannel(true).catch(() => {});
      engineRef.current = null;
      joinedRef.current = false;
    };
  }, [
    enabled,
    channel,
    token,
    uid,
    isVideo,
    launchPending,
    detachEmitterListeners,
    clearJoinTimeout,
    fail,
    activateAudio,
    markSessionJoined,
  ]);

  const toggleMic = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    const next = !micMuted;
    try {
      engine.muteLocalAudioStream(next);
    } catch (e) {
      log('muteLocalAudioStream failed', e);
    }
    setMicMuted(next);
  }, [micMuted]);

  const toggleCamera = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !isVideo) {
      return;
    }
    const next = !cameraOff;
    try {
      engine.enableLocalVideo(!next);
      engine.muteLocalVideoStream(next);
      if (next) {
        engine.stopPreview();
      } else {
        engine.startPreview();
      }
    } catch (e) {
      log('camera toggle failed', e);
    }
    setCameraOff(next);
  }, [isVideo, cameraOff]);

  const toggleSpeaker = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    const next = !speakerOn;
    try {
      engine.setEnableSpeakerphone(next);
    } catch (e) {
      log('setEnableSpeakerphone failed', e);
    }
    setSpeakerOn(next);
  }, [speakerOn]);

  const switchCamera = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !isVideo) {
      return;
    }
    try {
      engine.switchCamera();
    } catch (e) {
      log('switchCamera failed', e);
    }
  }, [isVideo]);

  // Keep Android's audio route stable across route changes mid-call.
  useEffect(() => {
    if (!joined || Platform.OS !== 'android') {
      return;
    }
    const engine = engineRef.current;
    try {
      engine?.setEnableSpeakerphone(speakerOn);
    } catch {
      // ignore
    }
  }, [joined, speakerOn]);

  return {
    joined,
    engineReady,
    remoteUids,
    primaryRemoteUid: remoteUids.length > 0 ? remoteUids[0] : null,
    remoteVideoOff,
    micMuted,
    cameraOff,
    speakerOn,
    error,
    toggleMic,
    toggleCamera,
    toggleSpeaker,
    switchCamera,
    onLocalViewLayout,
  };
}
