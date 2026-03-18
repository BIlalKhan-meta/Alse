/**
 * Livestream screen - Zego Cloud Live Streaming Kit.
 * Supports host (Go Live tab) and viewer (joining from Stories) flows.
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ZegoUIKitPrebuiltLiveStreaming, {
  HOST_DEFAULT_CONFIG,
  AUDIENCE_DEFAULT_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-live-streaming-rn';
import {selectUserProfile} from '../../../store/slices/authSlice';
import {ZEGO_APP_ID, ZEGO_APP_SIGN} from '../../../config/zego';
import {startLiveStream, endLiveStream} from '../../../api/calling';
import {colors} from '../../../utils/theme';
import {vh, vw} from '../../../constant';

const sanitizeLiveID = (value: string): string =>
  String(value || '').replace(/[^a-zA-Z0-9_]/g, '_') || `live_${Date.now()}`;

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
  const [loading, setLoading] = useState(isHost);
  const [error, setError] = useState<string | null>(null);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [isLiveStarted, setIsLiveStarted] = useState(false);

  const userID = user?.id != null ? String(user.id) : '';
  const userName = user?.full_name || user?.name || `user_${userID}`;

  useEffect(() => {
    if (!userID) {
      setError('Please log in to use livestream');
      setLoading(false);
      return;
    }

    if (isHost) {
      startHostSession();
    } else {
      const key =
        streamKeyParam ?? (channel ? channel.replace(/^live\./, '') : '');
      if (!key) {
        setError('Invalid stream. Missing stream key.');
        setLoading(false);
        return;
      }
      setLiveID(sanitizeLiveID(key));
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, userID]);

  const startHostSession = async () => {
    try {
      setError(null);
      const response = await startLiveStream();
      const streamKey = response?.data?.live_stream?.stream_key;
      if (!streamKey) {
        throw new Error('Failed to get stream key from server');
      }
      setLiveID(sanitizeLiveID(streamKey));
      setSessionCreated(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to start livestream';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveLiveStreaming = async () => {
    if (isHost && sessionCreated) {
      try {
        await endLiveStream();
      } catch {
        // Best effort - still navigate back
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.themeColor} />
          <Text style={styles.loadingText}>
            {isHost ? 'Starting livestream...' : 'Loading...'}
          </Text>
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

  const config = isHost ? HOST_DEFAULT_CONFIG : AUDIENCE_DEFAULT_CONFIG;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.zegoContainer}>
        <ZegoUIKitPrebuiltLiveStreaming
          appID={ZEGO_APP_ID}
          appSign={ZEGO_APP_SIGN}
          userID={userID}
          userName={userName}
          liveID={liveID}
          config={{
            ...config,
            onLeaveLiveStreaming: handleLeaveLiveStreaming,
            ...(isHost
              ? {
                  onStartLiveButtonPressed: () => setIsLiveStarted(true),
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
                }),
          }}
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
    opacity: 0.9,
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
});

export default LiveStreamScreen;
