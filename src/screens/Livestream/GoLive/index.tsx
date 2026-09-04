/**
 * Livestream screen — Agora RTC Live Broadcasting.
 * Host (Go Live tab) and viewer (join from list / Stories) flows.
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  InteractionManager,
} from 'react-native';
import {
  AudienceLatencyLevelType,
  ClientRoleType,
  ConnectionStateType,
  RemoteVideoState,
  RenderModeType,
  VideoSourceType,
  RtcSurfaceView,
  RtcTextureView,
  RtcConnection,
  IRtcEngine,
  IRtcEngineEventHandler,
} from 'react-native-agora';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  Mic,
  MicOff,
  SwitchCamera,
  PhoneOff,
} from 'lucide-react-native';
import {selectUserProfile} from '../../../store/slices/authSlice';
import {AGORA_APP_ID} from '../../../config/agora';
import {
  saveActiveStream,
  removeActiveStream,
  getActiveStreamsFromFirestore,
} from '../../../services/activeStreamService';
import {
  EndLiveStream,
  GetLiveStreams,
  GetLiveStreamToken,
  StartLiveStream,
} from '../../../api/liveStream';
import {colors} from '../../../utils/theme';
import {
  ensureCameraPermission,
  hasCameraAndMicPermission,
  setSuppressAndroidPermissionPrompts,
} from '../../../utils/helpers';
import {
  ensureLiveRtcInitialized,
  isLiveChannelJoined,
  leaveLiveChannel,
  markLiveChannelJoined,
  releaseLiveRtcEngine,
} from '../../../services/agoraRtcLiveEngine';
import {vh, vw} from '../../../constant';
import KeepAwake from '@sayem314/react-native-keep-awake';

const LocalVideoView = Platform.OS === 'android' ? RtcTextureView : RtcSurfaceView;
const RemoteVideoView = Platform.OS === 'android' ? RtcTextureView : RtcSurfaceView;

const JOIN_TIMEOUT_MS = 30000;
const FIRST_FRAME_FALLBACK_MS = Platform.OS === 'android' ? 12000 : 400;

const toUid = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Agora events sometimes pack uid into the connection object. */
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

const sanitizeLiveID = (value: string): string =>
  String(value || '').replace(/[^a-zA-Z0-9_]/g, '_') || `live_${Date.now()}`;

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('request_timeout')), timeoutMs),
    ),
  ]);
};

type RouteParams = {
  isHost?: boolean;
  stream_key?: string;
  channel?: string;
  streamerName?: string;
  streamerAvatar?: string;
};

interface LiveStreamItem {
  stream_key: string;
  live_id?: string;
  channel_name?: string;
  user_id: number;
  user_name: string;
}

type PendingAfterModal =
  | {kind: 'start'}
  | {kind: 'join'; stream: LiveStreamItem};

const LiveStreamScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector(selectUserProfile);
  const params = (route.params || {}) as RouteParams;

  const {
    isHost = false,
    stream_key: streamKeyParam,
    channel = '',
    streamerName = '',
  } = params;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [hostStreamKey, setHostStreamKey] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [previewStarted, setPreviewStarted] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [remoteVideoStarted, setRemoteVideoStarted] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [liveStreams, setLiveStreams] = useState<LiveStreamItem[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [choiceStep, setChoiceStep] = useState<'initial' | 'pickStream'>(
    'initial',
  );
  const [effectiveMode, setEffectiveMode] = useState<{
    isHost: boolean;
    stream_key?: string;
    streamerName?: string;
    channel_name?: string;
    hostUid?: number;
  } | null>(null);

  const engineRef = useRef<IRtcEngine | null>(null);
  const handlerRef = useRef<IRtcEngineEventHandler | null>(null);
  const joiningRef = useRef(false);
  const leavingRef = useRef(false);
  const pendingJoinRef = useRef<{
    token: string;
    chName: string;
    uid: number;
    asHost: boolean;
    hostUid?: number;
    previewLaunched: boolean;
    joinLaunched: boolean;
  } | null>(null);
  const leavePromiseRef = useRef<Promise<void> | null>(null);
  const surfaceReadyRef = useRef(false);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const surfaceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstFrameFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const connectionPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const markJoinedRef = useRef<(source: string, channelId?: string) => void>(
    () => {},
  );
  const emitterListenersRef = useRef<
    {event: string; listener: (...args: any[]) => void}[]
  >([]);
  const joinedRef = useRef(false);
  const pendingAfterModalRef = useRef<PendingAfterModal | null>(null);
  const sessionCreatedRef = useRef(false);
  const hostStreamKeyRef = useRef<string | null>(null);
  const channelNameRef = useRef<string | null>(null);
  const effectiveIsHostRef = useRef(false);
  const hostEndedRef = useRef(false);
  const hostStartLockRef = useRef(false);

  const userID = user?.id != null ? String(user.id) : '';
  const userName = user?.full_name || user?.name || `user_${userID}`;
  const numericUid = Number(userID) || 0;

  const fromTab = isHost && !streamKeyParam && !channel;
  const effectiveIsHost = effectiveMode?.isHost ?? isHost;
  sessionCreatedRef.current = sessionCreated;
  hostStreamKeyRef.current = hostStreamKey;
  channelNameRef.current = channelName;
  effectiveIsHostRef.current = effectiveIsHost;

  const clearJoinTimeout = useCallback(() => {
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
      joinTimeoutRef.current = null;
    }
    if (surfaceTimeoutRef.current) {
      clearTimeout(surfaceTimeoutRef.current);
      surfaceTimeoutRef.current = null;
    }
    if (firstFrameFallbackRef.current) {
      clearTimeout(firstFrameFallbackRef.current);
      firstFrameFallbackRef.current = null;
    }
    if (connectionPollRef.current) {
      clearInterval(connectionPollRef.current);
      connectionPollRef.current = null;
    }
  }, []);

  const detachEmitterListeners = useCallback(() => {
    const engine = engineRef.current;
    for (const {event, listener} of emitterListenersRef.current) {
      try {
        engine?.removeListener(event as any, listener);
      } catch {
        // listener may already be gone
      }
    }
    emitterListenersRef.current = [];
  }, []);

  const cleanupEngine = useCallback(async () => {
    clearJoinTimeout();
    pendingJoinRef.current = null;
    surfaceReadyRef.current = false;
    joinedRef.current = false;
    setEngineReady(false);
    setPreviewStarted(false);
    setJoined(false);
    setRemoteUid(null);
    setRemoteVideoStarted(false);
    const engine = engineRef.current;
    const handler = handlerRef.current;
    handlerRef.current = null;
    joiningRef.current = false;
    hostStartLockRef.current = false;
    setSuppressAndroidPermissionPrompts(false);
    detachEmitterListeners();
    if (engine && handler) {
      try {
        engine.unregisterEventHandler(handler);
      } catch {
        // handler may already be gone
      }
    }
    try {
      engine?.removeAllListeners?.();
    } catch {
      // older SDK builds may not expose this
    }
    // Android: leave only — never release() between sessions (Iris singleton race).
    await leaveLiveChannel(true);
    if (Platform.OS !== 'android') {
      engineRef.current = null;
      await releaseLiveRtcEngine();
    }
  }, [clearJoinTimeout, detachEmitterListeners]);

  const joinPendingChannel = useCallback(async () => {
    const pending = pendingJoinRef.current;
    const engine = engineRef.current;
    if (!pending || pending.joinLaunched || !engine) {
      return;
    }
    pending.joinLaunched = true;
    if (firstFrameFallbackRef.current) {
      clearTimeout(firstFrameFallbackRef.current);
      firstFrameFallbackRef.current = null;
    }
    try {
      const joinOptions = {
        clientRoleType: pending.asHost
          ? ClientRoleType.ClientRoleBroadcaster
          : ClientRoleType.ClientRoleAudience,
        publishMicrophoneTrack: pending.asHost,
        publishCameraTrack: pending.asHost,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
        ...(pending.asHost
          ? {}
          : {
              audienceLatencyLevel:
                AudienceLatencyLevelType.AudienceLatencyLevelLowLatency,
            }),
      };
      console.log(
        '[LiveStream] joinChannel',
        pending.asHost ? 'host' : 'audience',
        pending.chName,
        'uid',
        pending.uid,
      );
      try {
        const preState = engine.getConnectionState();
        console.log('[LiveStream] pre-join connection state', preState);
        if (
          preState === ConnectionStateType.ConnectionStateConnecting ||
          preState === ConnectionStateType.ConnectionStateConnected ||
          preState === ConnectionStateType.ConnectionStateReconnecting
        ) {
          await leaveLiveChannel(true);
        }
      } catch {
        // getConnectionState may be missing on older native builds
      }
      const joinResult = engine.joinChannel(
        pending.token,
        pending.chName,
        pending.uid,
        joinOptions,
      );
      // -17 ERR_JOIN_CHANNEL_REJECTED usually means join is already in
      // progress. Leaving here aborts that join and causes the 30s timeout.
      if (joinResult === -17 || joinResult === 17) {
        console.warn(
          '[LiveStream] joinChannel -17, waiting for join success (not leaving)',
        );
      } else if (typeof joinResult === 'number' && joinResult < 0) {
        throw new Error(`joinChannel failed with code ${joinResult}`);
      }
      markLiveChannelJoined();
      if (!pending.asHost) {
        try {
          engine.muteAllRemoteVideoStreams(false);
          engine.muteAllRemoteAudioStreams(false);
          if (pending.hostUid) {
            engine.muteRemoteVideoStream(pending.hostUid, false);
          }
          engine.setEnableSpeakerphone(true);
        } catch {
          // older native builds may not expose these
        }
      }
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
      if (connectionPollRef.current) {
        clearInterval(connectionPollRef.current);
      }
      connectionPollRef.current = setInterval(() => {
        if (joinedRef.current) {
          if (connectionPollRef.current) {
            clearInterval(connectionPollRef.current);
            connectionPollRef.current = null;
          }
          return;
        }
        try {
          const state = engine.getConnectionState();
          console.log('[LiveStream] poll connection state', state);
          if (state === ConnectionStateType.ConnectionStateConnected) {
            markJoinedRef.current('poll-connected', pending.chName);
          }
        } catch {
          // ignore
        }
      }, 1000);
      joinTimeoutRef.current = setTimeout(() => {
        if (!joinedRef.current) {
          joiningRef.current = false;
          if (connectionPollRef.current) {
            clearInterval(connectionPollRef.current);
            connectionPollRef.current = null;
          }
          let state: number | string = 'unknown';
          try {
            state = engine.getConnectionState();
          } catch {
            // ignore
          }
          console.warn(
            '[LiveStream] join timed out waiting for Agora',
            pending.chName,
            'state',
            state,
          );
          setError('Could not reach Agora. Check network and try again.');
          setLoading(false);
        }
      }, JOIN_TIMEOUT_MS);
    } catch (err: any) {
      joiningRef.current = false;
      console.warn('[LiveStream] join launch failed', err);
      setError(err?.message || 'Failed to join Agora channel');
      setLoading(false);
    }
  }, []);

  const launchPendingPreview = useCallback(() => {
    const pending = pendingJoinRef.current;
    const engine = engineRef.current;
    if (!pending || pending.previewLaunched || !engine) {
      return;
    }
    // Host must have a mounted video view before enableVideo/startPreview on
    // MediaTek/TECNO — otherwise camera HAL can SIGSEGV during the loader.
    if (pending.asHost && !surfaceReadyRef.current) {
      return;
    }
    pending.previewLaunched = true;
    try {
      engine.enableVideo();
      engine.enableAudio();
      if (pending.asHost) {
        engine.enableLocalVideo(true);
        engine.enableLocalAudio(true);
      }
      engine.setClientRole(
        pending.asHost
          ? ClientRoleType.ClientRoleBroadcaster
          : ClientRoleType.ClientRoleAudience,
      );
      if (pending.asHost) {
        engine.startPreview();
        setPreviewStarted(true);
        setLoading(false);
        // iOS can join as soon as preview starts. Android waits for the first
        // camera frame (or 12s) so MediaTek HAL is not still opening.
        if (Platform.OS !== 'android') {
          joinPendingChannel();
          return;
        }
        firstFrameFallbackRef.current = setTimeout(() => {
          if (pendingJoinRef.current && !pendingJoinRef.current.joinLaunched) {
            console.warn(
              '[LiveStream] first frame fallback, joining anyway',
            );
            joinPendingChannel();
          }
        }, FIRST_FRAME_FALLBACK_MS);
        return;
      }
      joinPendingChannel();
    } catch (err: any) {
      joiningRef.current = false;
      console.warn('[LiveStream] preview launch failed', err);
      setError(err?.message || 'Failed to start camera preview');
      setLoading(false);
    }
  }, [joinPendingChannel]);

  const onHostSurfaceLayout = useCallback(() => {
    if (surfaceReadyRef.current) {
      return;
    }
    surfaceReadyRef.current = true;
    // Let the native view attach to Iris before enableVideo/startPreview.
    setTimeout(() => launchPendingPreview(), 250);
  }, [launchPendingPreview]);

  const handleLeave = useCallback(() => {
    if (leavingRef.current) {
      return;
    }
    leavingRef.current = true;
    hostEndedRef.current = true;
    joiningRef.current = false;
    joinedRef.current = false;
    pendingJoinRef.current = null;
    surfaceReadyRef.current = false;
    clearJoinTimeout();

    const wasHost = effectiveIsHostRef.current && sessionCreatedRef.current;
    const liveId = hostStreamKeyRef.current
      ? sanitizeLiveID(hostStreamKeyRef.current)
      : channelNameRef.current;

    const engine = engineRef.current;
    try {
      engine?.stopPreview();
    } catch {
      // preview may not have started
    }
    try {
      engine?.enableLocalVideo(false);
      engine?.enableLocalAudio(false);
    } catch {
      // engine may already be idle
    }

    // Tear down the camera UI immediately — do not wait for EndLiveStream.
    setJoined(false);
    setLoading(false);
    setPreviewStarted(false);
    setEngineReady(false);
    setRemoteUid(null);
    setRemoteVideoStarted(false);
    setEffectiveMode(null);
    setHostStreamKey(null);
    setChannelName(null);
    setError(null);
    setSessionCreated(false);
    sessionCreatedRef.current = false;

    if (fromTab) {
      setShowChoiceModal(true);
      setChoiceStep('initial');
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      setShowChoiceModal(true);
      setChoiceStep('initial');
    }

    const done = (async () => {
      try {
        if (wasHost) {
          if (liveId) {
            await removeActiveStream(liveId).catch(() => {});
          }
          try {
            await EndLiveStream();
          } catch (endErr) {
            console.warn('[LiveStream] EndLiveStream failed', endErr);
          }
        }
        await withTimeout(cleanupEngine(), 2500).catch(() => {
          void cleanupEngine();
        });
      } finally {
        leavingRef.current = false;
        hostEndedRef.current = false;
      }
    })();
    leavePromiseRef.current = done;
  }, [cleanupEngine, clearJoinTimeout, fromTab, navigation]);

  const joinAgoraChannel = useCallback(
    async (
      token: string,
      chName: string,
      uid: number,
      asHost: boolean,
      hostUid?: number,
    ) => {
      if (!AGORA_APP_ID) {
        throw new Error('Agora App ID is not configured');
      }
      if (leavePromiseRef.current) {
        await leavePromiseRef.current.catch(() => {});
        leavePromiseRef.current = null;
      }
      if (joiningRef.current) {
        console.warn('[LiveStream] join already in progress, skip');
        return;
      }
      joiningRef.current = true;

      try {
      // Only leave when we actually joined. leaveChannel() while idle makes
      // the next joinChannel return -17 on Android.
      if (isLiveChannelJoined()) {
        await leaveLiveChannel();
      }
      leavingRef.current = false;

      const engine = await ensureLiveRtcInitialized();
      engineRef.current = engine;
      if (handlerRef.current) {
        try {
          engine.unregisterEventHandler(handlerRef.current);
        } catch {
          // previous handler may already be gone
        }
        handlerRef.current = null;
      }

      const applyRemoteUid = (uidJoined: number) => {
        if (leavingRef.current || hostEndedRef.current) {
          return;
        }
        const remote = toUid(uidJoined);
        if (!remote || remote === uid) {
          return;
        }
        setRemoteUid(remote);
        setRemoteVideoStarted(true);
      };

      const markJoined = (source: string, channelId?: string) => {
        if (leavingRef.current || hostEndedRef.current) {
          return;
        }
        console.log('[LiveStream] event', source, channelId ?? '');
        joiningRef.current = false;
        clearJoinTimeout();
        joinedRef.current = true;
        setJoined(true);
        setPreviewStarted(true);
        setLoading(false);
        setError(null);
        if (!asHost) {
          const hint = toUid(hostUid || pendingJoinRef.current?.hostUid);
          if (hint && hint !== uid) {
            setRemoteUid(prev => prev ?? hint);
            // Host is already in the channel; don't keep the waiting overlay
            // up until onFirstRemoteVideoFrame (often missing on Android).
            setRemoteVideoStarted(true);
          }
        }
      };
      markJoinedRef.current = markJoined;

      const onTokenInvalid = () => {
        joiningRef.current = false;
        clearJoinTimeout();
        setError(
          'Invalid Agora token. Confirm AGORA_APP_ID / AGORA_APP_CERTIFICATE on the server match this app.',
        );
        setLoading(false);
      };

      const handler: IRtcEngineEventHandler = {
        onJoinChannelSuccess: (_connection: RtcConnection) => {
          markJoined('onJoinChannelSuccess', _connection?.channelId);
        },
        onFirstLocalVideoFrame: () => {
          console.log('[LiveStream] event onFirstLocalVideoFrame');
          joinPendingChannel();
        },
        onUserJoined: (...args: any[]) => {
          const uidJoined = extractRemoteUid(...args);
          console.log('[LiveStream] event onUserJoined', uidJoined, args?.[0]);
          applyRemoteUid(uidJoined);
        },
        onUserOffline: (...args: any[]) => {
          const uidOffline = extractRemoteUid(...args);
          console.log('[LiveStream] event onUserOffline', uidOffline);
          setRemoteUid(prev => (prev === uidOffline ? null : prev));
          setRemoteVideoStarted(false);
        },
        onFirstRemoteVideoFrame: (...args: any[]) => {
          const uidJoined = extractRemoteUid(...args);
          console.log('[LiveStream] event onFirstRemoteVideoFrame', uidJoined);
          applyRemoteUid(uidJoined);
        },
        onRemoteVideoStateChanged: (...args: any[]) => {
          const uidJoined = extractRemoteUid(...args);
          const state = typeof args[2] === 'number' ? args[2] : undefined;
          console.log(
            '[LiveStream] event onRemoteVideoStateChanged',
            uidJoined,
            state,
          );
          if (
            state === undefined ||
            state === RemoteVideoState.RemoteVideoStateDecoding ||
            state === RemoteVideoState.RemoteVideoStateStarting
          ) {
            applyRemoteUid(uidJoined);
          } else if (
            state === RemoteVideoState.RemoteVideoStateStopped ||
            state === RemoteVideoState.RemoteVideoStateFailed
          ) {
            setRemoteVideoStarted(false);
          }
        },
        onError: (err: number, msg: string) => {
          console.warn('[LiveStream] event onError', err, msg);
          if (err === -17 || err === 17) {
            return;
          }
          if (err === 110 || err === -110) {
            onTokenInvalid();
          }
        },
        onConnectionStateChanged: (
          _connection: RtcConnection,
          state: number,
          reason: number,
        ) => {
          console.log(
            '[LiveStream] event onConnectionStateChanged',
            state,
            'reason',
            reason,
          );
          if (state === 3) {
            markJoined('connectionState=3');
            return;
          }
          if (state === 5) {
            joiningRef.current = false;
            clearJoinTimeout();
            if (reason === 8 || reason === 9) {
              onTokenInvalid();
              return;
            }
            setError(`Agora connection failed (reason ${reason}).`);
            setLoading(false);
          }
        },
      };
      engine.registerEventHandler(handler);
      handlerRef.current = handler;
      detachEmitterListeners();
      const listen = (
        event: keyof IRtcEngineEventHandler,
        listener: (...args: any[]) => void,
      ) => {
        engine.addListener(event as any, listener as any);
        emitterListenersRef.current.push({event, listener});
      };
      listen('onJoinChannelSuccess', handler.onJoinChannelSuccess!);
      listen('onConnectionStateChanged', handler.onConnectionStateChanged!);
      listen('onError', handler.onError!);
      listen('onFirstLocalVideoFrame', handler.onFirstLocalVideoFrame!);
      listen('onUserJoined', handler.onUserJoined!);
      listen('onUserOffline', handler.onUserOffline!);
      listen('onFirstRemoteVideoFrame', handler.onFirstRemoteVideoFrame!);
      listen('onRemoteVideoStateChanged', handler.onRemoteVideoStateChanged!);

      // Do NOT call enableVideo/startPreview here for hosts — wait until
      // RtcSurfaceView has laid out (see launchPendingPreview).
      pendingJoinRef.current = {
        token,
        chName,
        uid,
        asHost,
        hostUid: toUid(hostUid) || undefined,
        previewLaunched: false,
        joinLaunched: false,
      };
      surfaceReadyRef.current = false;
      setRemoteVideoStarted(false);
      setEngineReady(true);

      if (!asHost) {
        setTimeout(() => launchPendingPreview(), 50);
      } else {
        // Do NOT force startPreview if onLayout never fires — that SIGSEGVs the
        // camera HAL on MediaTek/TECNO. Show an error instead of a blind join.
        surfaceTimeoutRef.current = setTimeout(() => {
          if (!pendingJoinRef.current?.previewLaunched) {
            joiningRef.current = false;
            setError(
              'Camera preview did not start. Close Go Live and try again.',
            );
            setLoading(false);
          }
        }, 8000);
      }
    } catch (joinSetupErr) {
      joiningRef.current = false;
      throw joinSetupErr;
    }
    },
    [clearJoinTimeout, detachEmitterListeners, joinPendingChannel, launchPendingPreview],
  );

  const startHostSession = useCallback(async () => {
    try {
      setError(null);
      if (leavePromiseRef.current) {
        await leavePromiseRef.current.catch(() => {});
        leavePromiseRef.current = null;
      }
      leavingRef.current = false;
      hostStartLockRef.current = true;
      // Block FCM/notifee from stacking GrantPermissionsActivity while we
      // request camera/mic. Android 16 treats that as rapidActivityLaunch.
      setSuppressAndroidPermissionPrompts(true);
      // Ask for permissions before the loader so a permission dialog does not
      // sit on top of "Starting livestream..." and look like a hang/crash.
      const alreadyGranted = await hasCameraAndMicPermission({forVideo: true});
      const granted = alreadyGranted
        ? true
        : await ensureCameraPermission({forVideo: true});
      setSuppressAndroidPermissionPrompts(false);
      if (!granted) {
        hostStartLockRef.current = false;
        throw new Error(
          'Camera and microphone permissions are required to go live',
        );
      }
      setLoading(true);
      const res: any = await StartLiveStream();
      const body = res?.data?.data ?? res?.data ?? {};
      if (res?.status >= 400 || body?.message && !body?.agora_token) {
        throw new Error(
          body?.message ||
            'Server did not return an Agora token. Check AGORA_APP_ID / AGORA_APP_CERTIFICATE on the backend.',
        );
      }
      const liveStream =
        body?.live_stream ??
        res?.data?.live_stream ??
        res?.data?.data?.live_stream ??
        res?.data?.data;
      const streamKey =
        liveStream?.stream_key ||
        body?.stream_key ||
        res?.data?.stream_key ||
        body?.channel_name?.replace(/^agora\./, '');
      if (!streamKey) {
        throw new Error('Server did not return a stream key');
      }
      const chName =
        body?.channel_name ||
        res?.data?.channel_name ||
        `agora.${streamKey}`;
      const token = body?.agora_token || res?.data?.agora_token;
      if (!token) {
        throw new Error(
          body?.message ||
            'Server did not return an Agora token. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE on the server.',
        );
      }
      const serverAppId =
        body?.agora_app_id || res?.data?.agora_app_id || '';
      if (serverAppId && AGORA_APP_ID && serverAppId !== AGORA_APP_ID) {
        throw new Error(
          'Agora App ID on the server does not match this app. Update AGORA_APP_ID in the server .env.',
        );
      }
      const uid = Number(body?.uid ?? res?.data?.uid ?? numericUid) || numericUid;
      console.log(
        '[LiveStream] host starting',
        chName,
        'uid',
        uid,
        'appId',
        AGORA_APP_ID,
        'serverAppId',
        serverAppId || '(not returned — deploy backend)',
      );

      setHostStreamKey(streamKey);
      setChannelName(chName);
      setSessionCreated(true);
      setEffectiveMode({isHost: true, stream_key: streamKey});

      await joinAgoraChannel(token, chName, uid, true);
    } catch (err: any) {
      hostStartLockRef.current = false;
      setSuppressAndroidPermissionPrompts(false);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start livestream';
      setError(msg);
      setLoading(false);
    }
  }, [joinAgoraChannel, numericUid]);

  const startViewerSession = useCallback(
    async (
      streamKey: string,
      preferredChannel?: string,
      knownHostUid?: number,
    ) => {
      try {
        setError(null);
        setLoading(true);
        if (leavePromiseRef.current) {
          await leavePromiseRef.current.catch(() => {});
          leavePromiseRef.current = null;
        }
        const chName =
          preferredChannel ||
          (streamKey.startsWith('agora.')
            ? streamKey
            : `agora.${streamKey}`);
        const tokenRes: any = await GetLiveStreamToken(chName);
        const token =
          tokenRes?.data?.agora_token ?? tokenRes?.data?.data?.agora_token;
        const uid = Number(
          tokenRes?.data?.uid ?? tokenRes?.data?.data?.uid ?? numericUid,
        );
        const hostUid = Number(
          tokenRes?.data?.host_uid ??
            tokenRes?.data?.data?.host_uid ??
            knownHostUid ??
            0,
        );
        if (!token) {
          throw new Error('Could not get audience token for this stream');
        }
        const serverAppId =
          tokenRes?.data?.agora_app_id ?? tokenRes?.data?.data?.agora_app_id;
        if (serverAppId && AGORA_APP_ID && serverAppId !== AGORA_APP_ID) {
          throw new Error(
            'Agora App ID on the server does not match this app. Update AGORA_APP_ID in the server .env.',
          );
        }
        const audienceUid = uid || numericUid;
        const resolvedHostUid = hostUid || knownHostUid || 0;
        if (resolvedHostUid && audienceUid === resolvedHostUid) {
          throw new Error(
            'This device joined with the host account. Agora cannot show the host camera to the same uid — use another login, or update the server so audience tokens use a different uid.',
          );
        }
        setChannelName(chName);
        setHostStreamKey(streamKey.replace(/^agora\./, ''));
        setEffectiveMode(prev => ({
          isHost: false,
          stream_key: streamKey,
          streamerName: prev?.streamerName,
          channel_name: chName,
          hostUid: resolvedHostUid || prev?.hostUid,
        }));
        console.log(
          '[LiveStream] audience joining',
          chName,
          'uid',
          audienceUid,
          'hostUid',
          resolvedHostUid || '(unknown)',
          'stream_key',
          streamKey,
        );
        await joinAgoraChannel(
          token,
          chName,
          audienceUid,
          false,
          resolvedHostUid || undefined,
        );
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to join livestream';
        setError(msg);
        setLoading(false);
      }
    },
    [joinAgoraChannel, numericUid],
  );

  useEffect(() => {
    if (!userID) {
      setError('Please log in to use livestream');
      return;
    }

    if (fromTab) {
      return;
    }

    if (isHost) {
      startHostSession();
    } else {
      const key =
        streamKeyParam ??
        (channel ? channel.replace(/^(live\.|agora\.)/, '') : '');
      if (!key) {
        setError('Invalid stream. Missing stream key.');
        return;
      }
      const preferred =
        channel ||
        (key.startsWith('agora.') ? key : `agora.${key}`);
      startViewerSession(key, preferred);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, userID, fromTab]);

  useFocusEffect(
    useCallback(() => {
      if (!fromTab || !userID) {
        return;
      }
      if (
        sessionCreatedRef.current ||
        joinedRef.current ||
        joiningRef.current ||
        hostStartLockRef.current ||
        pendingAfterModalRef.current
      ) {
        return;
      }
      setShowChoiceModal(true);
    }, [fromTab, userID]),
  );

  useEffect(() => {
    if (!effectiveIsHost || !joined || !hostStreamKey || !channelName) {
      return;
    }
    let cancelled = false;
    const liveId = sanitizeLiveID(hostStreamKey);
    const syncArgs: [string, string, string, number, string] = [
      hostStreamKey,
      liveId,
      channelName,
      Number(userID) || 0,
      userName,
    ];
    const heartbeat = async () => {
      if (cancelled || hostEndedRef.current) {
        return;
      }
      try {
        await saveActiveStream(...syncArgs);
      } catch (err) {
        if (!cancelled && !hostEndedRef.current) {
          console.warn('[LiveStream] heartbeat failed', err);
        }
      }
    };
    heartbeat();
    const intervalId = setInterval(heartbeat, 15000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [
    effectiveIsHost,
    joined,
    hostStreamKey,
    channelName,
    userID,
    userName,
  ]);

  useEffect(() => {
    return () => {
      // Tab switch no longer unmounts this screen. Real unmount (logout /
      // leaving the tab navigator) should leave the channel but must not
      // EndLiveStream — that is only for explicit hang-up. Never release()
      // on Android from here.
      cleanupEngine();
    };
  }, [cleanupEngine]);

  // Kick off start/join only after the choice Modal is gone. Requesting camera
  // while the Modal still owns focus hangs on Android (no /live-stream/start).
  useEffect(() => {
    if (showChoiceModal) {
      return;
    }
    const pending = pendingAfterModalRef.current;
    if (!pending) {
      return;
    }
    let cancelled = false;
    const kickOff = () => {
      if (cancelled) {
        return;
      }
      pendingAfterModalRef.current = null;
      if (pending.kind === 'start') {
        startHostSession();
        return;
      }
      setEffectiveMode({
        isHost: false,
        stream_key: pending.stream.stream_key,
        streamerName: pending.stream.user_name,
        channel_name: pending.stream.channel_name,
        hostUid: toUid(pending.stream.user_id) || undefined,
      });
      startViewerSession(
        pending.stream.stream_key,
        pending.stream.channel_name || `agora.${pending.stream.stream_key}`,
        pending.stream.user_id ? toUid(pending.stream.user_id) : undefined,
      );
    };
    if (Platform.OS === 'android') {
      const task = InteractionManager.runAfterInteractions(() => {
        // Let the choice Modal finish closing before a single permission
        // activity — overlapping dialogs get Force-removed on TECNO.
        setTimeout(kickOff, 250);
      });
      return () => {
        cancelled = true;
        task.cancel();
      };
    }
    kickOff();
    return () => {
      cancelled = true;
    };
  }, [showChoiceModal, startHostSession, startViewerSession]);

  const handleStartNew = () => {
    pendingAfterModalRef.current = {kind: 'start'};
    setChoiceStep('initial');
    setShowChoiceModal(false);
  };

  const handleJoinTap = async () => {
    setChoiceStep('pickStream');
    setLoadingStreams(true);
    try {
      const byKey = new Map<string, LiveStreamItem>();

      try {
        const streamsFromFirestore = await withTimeout(
          getActiveStreamsFromFirestore(),
          8000,
        );
        streamsFromFirestore.forEach(s => {
          if (!s.stream_key) {
            return;
          }
          byKey.set(s.stream_key, {
            stream_key: s.stream_key,
            live_id: s.live_id,
            channel_name: s.channel_name || `agora.${s.stream_key}`,
            user_id: s.user_id,
            user_name: s.user_name,
          });
        });
      } catch (err: any) {
        if (err?.message === 'request_timeout') {
          console.warn('[LiveStream] Firestore join list timed out');
        }
      }

      try {
        const apiRes: any = await GetLiveStreams();
        const apiStreams =
          apiRes?.data?.live_streams ??
          apiRes?.data?.data?.live_streams ??
          apiRes?.data?.data ??
          [];
        const list = Array.isArray(apiStreams)
          ? apiStreams
          : Array.isArray(apiStreams?.data)
            ? apiStreams.data
            : [];
        list.forEach((s: any) => {
          const key = s?.stream_key;
          if (!key || byKey.has(key)) {
            return;
          }
          byKey.set(key, {
            stream_key: key,
            live_id: sanitizeLiveID(key),
            channel_name: `agora.${key}`,
            user_id: s?.user_id ?? s?.user?.id ?? 0,
            user_name:
              s?.user?.full_name || s?.user_name || s?.user?.name || 'Live',
          });
        });
      } catch (apiErr) {
        console.warn('[LiveStream] GetLiveStreams failed', apiErr);
      }

      setLiveStreams(Array.from(byKey.values()));
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleSelectStream = (stream: LiveStreamItem) => {
    pendingAfterModalRef.current = {kind: 'join', stream};
    setChoiceStep('initial');
    setShowChoiceModal(false);
  };

  const handleCloseModal = () => {
    pendingAfterModalRef.current = null;
    setShowChoiceModal(false);
    setChoiceStep('initial');
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const toggleMic = () => {
    const engine = engineRef.current;
    if (!engine || !effectiveIsHost) {
      return;
    }
    const next = !micMuted;
    engine.muteLocalAudioStream(next);
    setMicMuted(next);
  };

  const flipCamera = () => {
    engineRef.current?.switchCamera();
  };

  if (!userID) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Please log in to use livestream</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.canGoBack() && navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Keep video mounted under overlays so host preview has a real native view
  // before Agora startPreview (TECNO/MediaTek crash fix).
  const showBlockingLoader =
    loading && !previewStarted && !joined && !error;
  const showControls =
    (previewStarted || joined || (engineReady && effectiveIsHost)) && !error;
  const remoteCanvasUid = !effectiveIsHost
    ? toUid(remoteUid ?? effectiveMode?.hostUid)
    : 0;
  const showWaitingForHost =
    !effectiveIsHost &&
    !error &&
    !showChoiceModal &&
    !showBlockingLoader &&
    remoteCanvasUid === 0;

  return (
    <View style={styles.container}>
      {(joined || previewStarted) && <KeepAwake />}
      <View style={styles.videoContainer}>
        {engineReady && effectiveIsHost ? (
          <LocalVideoView
            style={styles.video}
            canvas={{uid: 0}}
            onLayout={onHostSurfaceLayout}
          />
        ) : engineReady && remoteCanvasUid > 0 ? (
          <RemoteVideoView
            style={styles.video}
            canvas={{
              uid: remoteCanvasUid,
              sourceType: VideoSourceType.VideoSourceRemote,
              renderMode: RenderModeType.RenderModeHidden,
            }}
          />
        ) : (
          <View style={styles.video} />
        )}
        {showWaitingForHost ? (
          <View style={styles.waitingOverlay} pointerEvents="none">
            <ActivityIndicator color={colors.white} />
            <Text style={styles.waitingText}>
              {`Waiting for host${
                streamerName || effectiveMode?.streamerName
                  ? ` (${streamerName || effectiveMode?.streamerName})`
                  : ''
              }…`}
            </Text>
          </View>
        ) : null}
      </View>

      {showBlockingLoader ? (
        <View style={styles.joiningOverlay} pointerEvents="box-none">
          <ActivityIndicator size="large" color={colors.themeColor} />
          <Text style={styles.loadingText}>
            {effectiveIsHost ? 'Starting livestream...' : 'Joining stream...'}
          </Text>
          <TouchableOpacity
            style={styles.loadingBackButton}
            onPress={handleLeave}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {error ? (
        <View style={styles.joiningOverlay}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleLeave}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showControls ? (
        <SafeAreaView style={styles.controlsSafe} pointerEvents="box-none">
          <View style={styles.topBar}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>
                {joined ? 'LIVE' : 'PREVIEW'}
              </Text>
            </View>
            <Text style={styles.channelHint} numberOfLines={1}>
              {joined
                ? effectiveIsHost
                  ? 'You are live'
                  : 'Watching'
                : 'Connecting to channel…'}
            </Text>
          </View>

          <View style={styles.controlsBar}>
            {effectiveIsHost ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.controlBtn,
                    micMuted && styles.controlBtnActive,
                  ]}
                  onPress={toggleMic}
                  accessibilityLabel={micMuted ? 'Unmute mic' : 'Mute mic'}>
                  {micMuted ? (
                    <MicOff size={22} color={colors.white} />
                  ) : (
                    <Mic size={22} color={colors.white} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={flipCamera}
                  accessibilityLabel="Switch camera">
                  <SwitchCamera size={22} color={colors.white} />
                </TouchableOpacity>
              </>
            ) : null}
            <TouchableOpacity
              style={[styles.controlBtn, styles.endBtn]}
              onPress={handleLeave}
              accessibilityLabel="End live stream">
              <PhoneOff size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : null}

      <Modal
        visible={showChoiceModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Live Stream</Text>
            {choiceStep === 'initial' ? (
              <>
                <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  onPress={handleStartNew}
                  activeOpacity={0.8}>
                  <Text style={styles.modalButtonText}>
                    Start New Live Stream
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSecondaryButton}
                  onPress={handleJoinTap}
                  disabled={loadingStreams}
                  activeOpacity={0.8}>
                  {loadingStreams ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.modalButtonText}>
                      Join Running Stream
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  {loadingStreams
                    ? 'Loading streams...'
                    : liveStreams.length === 0
                      ? 'No live streams at the moment'
                      : 'Select a stream to join'}
                </Text>
                {!loadingStreams && liveStreams.length > 0 && (
                  <FlatList
                    data={liveStreams}
                    keyExtractor={item => item.stream_key}
                    style={styles.streamList}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.streamItem}
                        onPress={() => handleSelectStream(item)}
                        activeOpacity={0.8}>
                        <View style={styles.streamAvatar}>
                          <Text style={styles.streamAvatarText}>
                            {item.user_name?.charAt(0)?.toUpperCase() || '?'}
                          </Text>
                        </View>
                        <Text style={styles.streamName} numberOfLines={1}>
                          {item.user_name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => setChoiceStep('initial')}>
                  <Text style={styles.modalBackButtonText}>Back</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={handleCloseModal}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  joiningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vw * 8,
  },
  waitingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw * 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  waitingText: {
    color: colors.white,
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.85,
  },
  controlsSafe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    gap: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  liveBadgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  channelHint: {
    color: colors.white,
    opacity: 0.85,
    fontSize: 13,
    flex: 1,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingBottom: Platform.OS === 'android' ? 28 : 16,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(229,57,53,0.85)',
  },
  endBtn: {
    backgroundColor: '#E53935',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vw * 8,
  },
  loadingText: {
    fontSize: 16,
    color: colors.white,
    marginTop: vh * 2,
    marginBottom: vh * 3,
    opacity: 0.9,
  },
  loadingBackButton: {
    paddingVertical: vh * 1.5,
    paddingHorizontal: vw * 4,
  },
  errorText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: vh * 4,
    opacity: 0.9,
  },
  backButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: vh * 1.5,
    paddingHorizontal: vw * 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: vw * 6,
  },
  modalContent: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: vw * 6,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: vh * 3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: vh * 2,
  },
  modalPrimaryButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: vh * 1.5,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: vh * 1.5,
  },
  modalSecondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: vh * 1.5,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: vh * 2,
    minHeight: 48,
    justifyContent: 'center',
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackButton: {
    paddingVertical: vh * 1,
    alignItems: 'center',
    marginBottom: vh * 1,
  },
  modalBackButtonText: {
    color: colors.themeColor,
    fontSize: 14,
  },
  modalCancelButton: {
    paddingVertical: vh * 1,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.7,
  },
  streamList: {
    maxHeight: vh * 30,
    marginBottom: vh * 2,
  },
  streamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vh * 1.5,
    paddingHorizontal: vw * 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  streamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: vw * 3,
  },
  streamAvatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  streamName: {
    color: colors.white,
    fontSize: 16,
    flex: 1,
  },
});

export default LiveStreamScreen;
