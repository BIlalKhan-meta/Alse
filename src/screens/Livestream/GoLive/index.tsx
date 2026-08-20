/**
 * Livestream screen - Zego Cloud Live Streaming Kit.
 * Supports host (Go Live tab) and viewer (joining from Stories) flows.
 */
import React, {useEffect, useRef, useState} from 'react';
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
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import * as ZIM from 'zego-zim-react-native';
import ZegoUIKitPrebuiltLiveStreaming, {
  HOST_DEFAULT_CONFIG,
  AUDIENCE_DEFAULT_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-live-streaming-rn';
import {selectUserProfile} from '../../../store/slices/authSlice';
import {
  ZEGO_LIVE_STREAM_APP_ID,
  ZEGO_LIVE_STREAM_APP_SIGN,
} from '../../../config/zego';
import {
  saveActiveStream,
  removeActiveStream,
  getActiveStreamsFromFirestore,
  getLiveIdByStreamKey,
} from '../../../services/activeStreamService';
import {colors} from '../../../utils/theme';
import {vh, vw} from '../../../constant';

const sanitizeLiveID = (value: string): string =>
  String(value || '').replace(/[^a-zA-Z0-9_]/g, '_') || `live_${Date.now()}`;

const FRONTEND_TEST_STREAM_KEY = 'alsetest_stream';
const FRONTEND_TEST_LIVE_ID = 'alsetest_live_room';
const FRONTEND_FORCE_TEST_ROOM = false;

const generateLocalStreamKey = (uid: string) => {
  const normalizedUid = String(uid || '').replace(/[^a-zA-Z0-9_]/g, '') || 'guest';
  return `live_${normalizedUid}_${Date.now()}`;
};

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('request_timeout')), timeoutMs),
    ),
  ]);
};

const EndLiveStreamButton = ({
  onPress,
}: {
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={endButtonStyles.button}
    onPress={onPress}
    activeOpacity={0.8}>
    <Text style={endButtonStyles.buttonText}>End</Text>
  </TouchableOpacity>
);

const endButtonStyles = StyleSheet.create({
  button: {
    backgroundColor: '#E53935',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

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
  user_id: number;
  user_name: string;
}

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
    streamerAvatar = '',
  } = params;

  const [liveID, setLiveID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [hostStreamKey, setHostStreamKey] = useState<string | null>(null);
  const [hostChannelName, setHostChannelName] = useState<string | null>(null);
  const [isLiveStarted, setIsLiveStarted] = useState(false);
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
  } | null>(null);

  const userID = user?.id != null ? String(user.id) : '';
  const userName = user?.full_name || user?.name || `user_${userID}`;

  // Unique Zego userID per device - prevents "no host" when same user joins as viewer on 2nd device
  const zegoUserIDSuffix = useRef<string | null>(null);
  if (zegoUserIDSuffix.current === null && userID) {
    zegoUserIDSuffix.current = Math.random().toString(36).slice(2, 12);
  }
  const zegoUserID =
    userID && zegoUserIDSuffix.current
      ? `${userID}_${zegoUserIDSuffix.current}`
      : userID;

  const fromTab = isHost && !streamKeyParam && !channel;

  useEffect(() => {
    if (!userID) {
      setError('Please log in to use livestream');
      return;
    }

    if (fromTab) {
      setShowChoiceModal(true);
      return;
    }

    if (isHost) {
      setLoading(true);
      startHostSession();
    } else {
      const key =
        streamKeyParam ?? (channel ? channel.replace(/^live\./, '') : '');
      if (!key) {
        setError('Invalid stream. Missing stream key.');
        return;
      }
      setLoading(true);
      (async () => {
        try {
          const resolvedLiveId = await getLiveIdByStreamKey(key);
          setLiveID(resolvedLiveId ?? sanitizeLiveID(key));
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, userID, fromTab]);

  const handleStartNew = () => {
    setShowChoiceModal(false);
    setChoiceStep('initial');
    setLoading(true);
    startHostSession();
  };

  const handleJoinTap = async () => {
    setChoiceStep('pickStream');
    setLoadingStreams(true);
    try {
      const streamsFromFirestore =
        await withTimeout(getActiveStreamsFromFirestore(), 8000);
      const firestoreStreams: LiveStreamItem[] = streamsFromFirestore.map(
        s => ({
          stream_key: s.stream_key,
          live_id: s.live_id,
          user_id: s.user_id,
          user_name: s.user_name,
        }),
      );
      const filteredStreams = firestoreStreams.filter(s => s.stream_key);
      const hasTestStream = filteredStreams.some(
        stream => stream.live_id === FRONTEND_TEST_LIVE_ID,
      );
      if (!hasTestStream) {
        filteredStreams.unshift({
          stream_key: FRONTEND_TEST_STREAM_KEY,
          live_id: FRONTEND_TEST_LIVE_ID,
          user_id: 0,
          user_name: 'Test Stream',
        });
      }
      setLiveStreams(filteredStreams);
    } catch (err: any) {
      setLiveStreams([
        {
          stream_key: FRONTEND_TEST_STREAM_KEY,
          live_id: FRONTEND_TEST_LIVE_ID,
          user_id: 0,
          user_name: 'Test Stream',
        },
      ]);
      if (err?.message === 'request_timeout') {
        console.warn('[LiveStream] Join list fetch timed out');
      }
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleSelectStream = (stream: LiveStreamItem) => {
    setShowChoiceModal(false);
    setChoiceStep('initial');
    const liveId = stream.live_id ?? sanitizeLiveID(stream.stream_key);
    setEffectiveMode({
      isHost: false,
      stream_key: stream.stream_key,
      streamerName: stream.user_name,
    });
    setLiveID(liveId);
  };

  const handleCloseModal = () => {
    setShowChoiceModal(false);
    setChoiceStep('initial');
    if (navigation.canGoBack()) navigation.goBack();
  };

  const effectiveIsHost = effectiveMode?.isHost ?? isHost;
  const effectiveStreamKey =
    effectiveMode?.stream_key ?? streamKeyParam ?? (channel ? channel.replace(/^live\./, '') : '');

  useEffect(() => {
    if (!effectiveIsHost || !isLiveStarted || !hostStreamKey || !liveID) {
      return;
    }

    let cancelled = false;
    const syncArgs: [string, string, string, number, string] = [
      hostStreamKey,
      liveID,
      hostChannelName ?? hostStreamKey,
      Number(userID) || 0,
      userName,
    ];

    const heartbeat = async () => {
      if (cancelled) return;
      try {
        await saveActiveStream(...syncArgs);
      } catch (err) {
        if (!cancelled) {
          console.warn('[LiveStream] heartbeat saveActiveStream failed', err);
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
    isLiveStarted,
    hostStreamKey,
    liveID,
    hostChannelName,
    userID,
    userName,
  ]);

  const startHostSession = async () => {
    try {
      setError(null);
      const streamKey = FRONTEND_FORCE_TEST_ROOM
        ? FRONTEND_TEST_STREAM_KEY
        : userID
          ? generateLocalStreamKey(userID)
          : FRONTEND_TEST_STREAM_KEY;
      const channelName = streamKey;
      const liveId = FRONTEND_FORCE_TEST_ROOM
        ? FRONTEND_TEST_LIVE_ID
        : userID
          ? sanitizeLiveID(streamKey)
          : FRONTEND_TEST_LIVE_ID;
      setLiveID(liveId);
      setHostStreamKey(streamKey);
      setHostChannelName(channelName);
      setSessionCreated(true);
      setLoading(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to start livestream';
      setError(msg);
      setLoading(false);
    }
  };

  const handleLeaveLiveStreaming = async () => {
    if (effectiveIsHost && sessionCreated) {
      try {
        if (liveID) {
          await removeActiveStream(liveID);
        }
      } catch {
        // Best effort - still navigate back
        if (liveID) {
          removeActiveStream(liveID).catch(() => {});
        }
      }
    }
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleLiveStreamingEnded = () => {
    if (navigation.canGoBack()) navigation.goBack();
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

  if (showChoiceModal) {
    return (
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.themeColor} />
          <Text style={styles.loadingText}>
            {effectiveIsHost ? 'Starting livestream...' : 'Loading...'}
          </Text>
          <TouchableOpacity
            style={styles.loadingBackButton}
            onPress={() => {
              setLoading(false);
              if (navigation.canGoBack()) navigation.goBack();
            }}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.canGoBack() && navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!liveID) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Invalid stream</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.canGoBack() && navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const config = effectiveIsHost ? HOST_DEFAULT_CONFIG : AUDIENCE_DEFAULT_CONFIG;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.zegoContainer}>
        <ZegoUIKitPrebuiltLiveStreaming
          appID={ZEGO_LIVE_STREAM_APP_ID}
          appSign={ZEGO_LIVE_STREAM_APP_SIGN}
          userID={zegoUserID}
          userName={userName}
          liveID={liveID}
          config={{
            ...config,
            onLeaveLiveStreaming: handleLeaveLiveStreaming,
            // Keep in-room chat visible for host and audience (ZIM plugin).
            inRoomMessageViewConfig: {
              ...(config as any).inRoomMessageViewConfig,
              visible: true,
            },
            ...(effectiveIsHost
              ? {
                  onStartLiveButtonPressed: () => {
                    setIsLiveStarted(true);
                    if (hostStreamKey && liveID) {
                      (async () => {
                        const syncArgs: [string, string, string, number, string] = [
                          hostStreamKey,
                          liveID,
                          hostChannelName ?? hostStreamKey,
                          Number(userID) || 0,
                          userName,
                        ];
                        let synced = false;
                        for (let attempt = 1; attempt <= 2; attempt++) {
                          try {
                            await saveActiveStream(...syncArgs);
                            synced = true;
                            break;
                          } catch (syncErr) {
                            console.warn(
                              `[LiveStream] saveActiveStream attempt ${attempt} failed`,
                              syncErr,
                            );
                            if (attempt < 2) {
                              await sleep(800);
                            }
                          }
                        }
                        if (!synced) {
                          Alert.alert(
                            'Discovery sync issue',
                            'Your stream is live, but others may not see it in the list right away.',
                          );
                        }
                      })();
                    }
                  },
                  onLiveStreamingEnded: handleLeaveLiveStreaming,
                  bottomMenuBarConfig: {
                    ...config.bottomMenuBarConfig,
                    hostExtendButtons: isLiveStarted
                      ? [
                          <EndLiveStreamButton
                            key="end"
                            onPress={handleLeaveLiveStreaming}
                          />,
                        ]
                      : [],
                  },
                }
              : {
                  onLiveStreamingEnded: handleLiveStreamingEnded,
                  showNoHostOnlineTipAfterSeconds: 12,
                }),
          }}
          plugins={[ZIM]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  zegoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
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
