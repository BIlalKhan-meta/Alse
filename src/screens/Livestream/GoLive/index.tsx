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
  Alert,
  Platform,
  InteractionManager,
} from 'react-native';
import {
  ClientRoleType,
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
} from '../../../utils/helpers';
import {
  ensureLiveRtcInitialized,
  leaveLiveChannel,
  markLiveChannelJoined,
  releaseLiveRtcEngine,
} from '../../../services/agoraRtcLiveEngine';
import {vh, vw} from '../../../constant';
import KeepAwake from '@sayem314/react-native-keep-awake';

const LocalVideoView = Platform.OS === 'android' ? RtcTextureView : RtcSurfaceView;

const sanitizeLiveID = (value: string): string =>
  String(value || '').replace(/[^a-zA-Z0-9_]/g, '_') || `live_${Date.now()}`;

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

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
    launched: boolean;
  } | null>(null);
  const surfaceReadyRef = useRef(false);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const surfaceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedRef = useRef(false);
  const pendingAfterModalRef = useRef<PendingAfterModal | null>(null);
  const sessionCreatedRef = useRef(false);
  const hostStreamKeyRef = useRef<string | null>(null);
  const channelNameRef = useRef<string | null>(null);
  const effectiveIsHostRef = useRef(false);
  const hostEndedRef = useRef(false);

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
    const engine = engineRef.current;
    const handler = handlerRef.current;
    handlerRef.current = null;
    joiningRef.current = false;
    if (engine && handler) {
      try {
        engine.unregisterEventHandler(handler);
      } catch {
        // handler may already be gone
      }
    }
    try {
      (engine as {removeAllListeners?: () => void})?.removeAllListeners?.();
    } catch {
      // older SDK builds may not expose this
    }
    // Android: leave only — never release() between sessions (Iris singleton race).
    await leaveLiveChannel();
    if (Platform.OS !== 'android') {
      engineRef.current = null;
      await releaseLiveRtcEngine();
    }
  }, [clearJoinTimeout]);

  const launchPendingJoin = useCallback(() => {
    const pending = pendingJoinRef.current;
    const engine = engineRef.current;
    if (!pending || pending.launched || !engine) {
      return;
    }
    // Host must have a mounted video view before enableVideo/startPreview on
    // MediaTek/TECNO — otherwise camera HAL can SIGSEGV during the loader.
    if (pending.asHost && !surfaceReadyRef.current) {
      return;
    }
    pending.launched = true;
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
        // Camera is live — drop the opaque loader even if channel join is slow.
        setPreviewStarted(true);
        setLoading(false);
      }
      const joinResult = engine.joinChannel(
        pending.token,
        pending.chName,
        pending.uid,
        {
          clientRoleType: pending.asHost
            ? ClientRoleType.ClientRoleBroadcaster
            : ClientRoleType.ClientRoleAudience,
          publishMicrophoneTrack: pending.asHost,
          publishCameraTrack: pending.asHost,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        },
      );
      if (typeof joinResult === 'number' && joinResult < 0) {
        throw new Error(`joinChannel failed with code ${joinResult}`);
      }
      markLiveChannelJoined();
      clearJoinTimeout();
      joinTimeoutRef.current = setTimeout(() => {
        if (!joinedRef.current) {
          joiningRef.current = false;
          setError(
            'Could not join the Agora channel in time. Check network and that the server token matches this App ID.',
          );
          setLoading(false);
        }
      }, 15000);
    } catch (err: any) {
      joiningRef.current = false;
      console.warn('[LiveStream] join launch failed', err);
      setError(err?.message || 'Failed to join Agora channel');
      setLoading(false);
    }
  }, [clearJoinTimeout]);

  const onHostSurfaceLayout = useCallback(() => {
    if (surfaceReadyRef.current) {
      return;
    }
    surfaceReadyRef.current = true;
    // Let the native view attach to Iris before enableVideo/startPreview.
    setTimeout(() => launchPendingJoin(), 250);
  }, [launchPendingJoin]);

  const handleLeave = useCallback(async () => {
    if (leavingRef.current) {
      return;
    }
    leavingRef.current = true;
    hostEndedRef.current = true;
    joinedRef.current = false;
    setJoined(false);
    setLoading(false);
    try {
      if (effectiveIsHostRef.current && sessionCreatedRef.current) {
        const liveId = hostStreamKeyRef.current
          ? sanitizeLiveID(hostStreamKeyRef.current)
          : channelNameRef.current;
        if (liveId) {
          await removeActiveStream(liveId).catch(() => {});
        }
        try {
          await EndLiveStream();
        } catch (endErr) {
          console.warn('[LiveStream] EndLiveStream failed', endErr);
        }
        setSessionCreated(false);
      }
      await withTimeout(cleanupEngine(), 2500).catch(() => {
        cleanupEngine();
      });
    } finally {
      setPreviewStarted(false);
      setEngineReady(false);
      setEffectiveMode(null);
      setHostStreamKey(null);
      setChannelName(null);
      setError(null);
      sessionCreatedRef.current = false;
      if (fromTab) {
        setShowChoiceModal(true);
        setChoiceStep('initial');
        leavingRef.current = false;
        hostEndedRef.current = false;
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        setShowChoiceModal(true);
        setChoiceStep('initial');
        leavingRef.current = false;
        hostEndedRef.current = false;
      }
    }
  }, [cleanupEngine, fromTab, navigation]);

  const joinAgoraChannel = useCallback(
    async (
      token: string,
      chName: string,
      uid: number,
      asHost: boolean,
    ) => {
      if (!AGORA_APP_ID) {
        throw new Error('Agora App ID is not configured');
      }
      if (joiningRef.current) {
        console.warn('[LiveStream] join already in progress, skip');
        return;
      }
      joiningRef.current = true;

      try {
      // Leave any prior channel on the process singleton — do not release().
      await leaveLiveChannel();
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

      const handler: IRtcEngineEventHandler = {
        onJoinChannelSuccess: (_connection: RtcConnection) => {
          console.log('[LiveStream] joined channel', _connection?.channelId);
          joiningRef.current = false;
          clearJoinTimeout();
          joinedRef.current = true;
          setJoined(true);
          setPreviewStarted(true);
          setLoading(false);
          setError(null);
        },
        onUserJoined: (_connection: RtcConnection, uidJoined: number) => {
          setRemoteUid(uidJoined);
        },
        onUserOffline: (_connection: RtcConnection, uidOffline: number) => {
          setRemoteUid(prev => (prev === uidOffline ? null : prev));
        },
        onError: (err: number, msg: string) => {
          console.warn('[LiveStream] Agora error', err, msg);
          // already in channel — ignore
          if (err === -17 || err === 17) {
            return;
          }
          if (err === 110 || err === -110 || /token/i.test(String(msg))) {
            joiningRef.current = false;
            clearJoinTimeout();
            setError(
              'Invalid Agora token. Confirm AGORA_APP_ID / AGORA_APP_CERTIFICATE on the server match this app.',
            );
            setLoading(false);
          }
        },
        onConnectionStateChanged: (
          _connection: RtcConnection,
          state: number,
          reason: number,
        ) => {
          console.log('[LiveStream] connection state', state, 'reason', reason);
          // CONNECTION_STATE_CONNECTED = 3
          if (state === 3) {
            joiningRef.current = false;
            clearJoinTimeout();
            joinedRef.current = true;
            setJoined(true);
            setLoading(false);
            setError(null);
            return;
          }
          // CONNECTION_STATE_FAILED = 5
          // reason 8 = invalid token, 9 = token expired
          if (state === 5) {
            joiningRef.current = false;
            clearJoinTimeout();
            const tokenHint =
              reason === 8 || reason === 9
                ? ' Invalid/expired Agora token on the API server.'
                : '';
            setError(`Agora connection failed (reason ${reason}).${tokenHint}`);
            setLoading(false);
          }
        },
      };
      engine.registerEventHandler(handler);
      handlerRef.current = handler;

      // Do NOT call enableVideo/startPreview here for hosts — wait until
      // RtcSurfaceView has laid out (see launchPendingJoin).
      pendingJoinRef.current = {
        token,
        chName,
        uid,
        asHost,
        launched: false,
      };
      surfaceReadyRef.current = false;
      setEngineReady(true);

      if (!asHost) {
        setTimeout(() => launchPendingJoin(), 50);
      } else {
        // Do NOT force startPreview if onLayout never fires — that SIGSEGVs the
        // camera HAL on MediaTek/TECNO. Show an error instead of a blind join.
        surfaceTimeoutRef.current = setTimeout(() => {
          if (!pendingJoinRef.current?.launched) {
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
    [clearJoinTimeout, launchPendingJoin],
  );

  const startHostSession = useCallback(async () => {
    try {
      setError(null);
      leavingRef.current = false;
      // Ask for permissions before the loader so a permission dialog does not
      // sit on top of "Starting livestream..." and look like a hang/crash.
      const alreadyGranted = await hasCameraAndMicPermission({forVideo: true});
      const granted = alreadyGranted
        ? true
        : await ensureCameraPermission({forVideo: true});
      if (!granted) {
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
      const uid = Number(body?.uid ?? res?.data?.uid ?? numericUid) || numericUid;

      setHostStreamKey(streamKey);
      setChannelName(chName);
      setSessionCreated(true);
      setEffectiveMode({isHost: true, stream_key: streamKey});

      const liveId = sanitizeLiveID(streamKey);
      const syncArgs: [string, string, string, number, string] = [
        streamKey,
        liveId,
        chName,
        Number(userID) || 0,
        userName,
      ];
      // Discoverable immediately — do not wait for Agora join.
      saveActiveStream(...syncArgs).catch(syncErr => {
        console.warn('[LiveStream] saveActiveStream failed', syncErr);
      });

      await joinAgoraChannel(token, chName, uid, true);

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await saveActiveStream(...syncArgs);
          break;
        } catch (syncErr) {
          console.warn(
            `[LiveStream] saveActiveStream attempt ${attempt} failed`,
            syncErr,
          );
          if (attempt < 2) {
            await sleep(800);
          } else {
            Alert.alert(
              'Discovery sync issue',
              'Your stream is live, but others may not see it in the list right away.',
            );
          }
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start livestream';
      setError(msg);
      setLoading(false);
    }
  }, [joinAgoraChannel, numericUid, userID, userName]);

  const startViewerSession = useCallback(
    async (streamKey: string, preferredChannel?: string) => {
      try {
        setError(null);
        setLoading(true);
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
        if (!token) {
          throw new Error('Could not get audience token for this stream');
        }
        setChannelName(chName);
        setHostStreamKey(streamKey.replace(/^agora\./, ''));
        await joinAgoraChannel(token, chName, uid || numericUid, false);
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
      if (sessionCreatedRef.current || joinedRef.current) {
        return;
      }
      let cancelled = false;
      (async () => {
        const already = await hasCameraAndMicPermission({forVideo: true});
        if (!already) {
          await ensureCameraPermission({forVideo: true});
        }
        if (!cancelled && !sessionCreatedRef.current) {
          setShowChoiceModal(true);
        }
      })();
      return () => {
        cancelled = true;
      };
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
      });
      startViewerSession(
        pending.stream.stream_key,
        pending.stream.channel_name || `agora.${pending.stream.stream_key}`,
      );
    };
    if (Platform.OS === 'android') {
      const task = InteractionManager.runAfterInteractions(() => {
        kickOff();
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
        ) : engineReady && remoteUid != null ? (
          <RtcSurfaceView style={styles.video} canvas={{uid: remoteUid}} />
        ) : (
          <View style={styles.waitingRemote}>
            {showChoiceModal ? null : (
              <>
                <ActivityIndicator color={colors.white} />
                <Text style={styles.waitingText}>
                  {effectiveIsHost
                    ? 'Starting camera…'
                    : `Waiting for host${
                        streamerName || effectiveMode?.streamerName
                          ? ` (${streamerName || effectiveMode?.streamerName})`
                          : ''
                      }…`}
                </Text>
              </>
            )}
          </View>
        )}
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
  waitingRemote: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw * 8,
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
