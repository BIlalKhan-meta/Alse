import React, {useState, useEffect, useMemo} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Text,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import {X} from 'lucide-react-native';
import InterRegular from '../Text/InterRegular';
import {vh, vw} from '../../constant';
import {changeUrlForData, resolvePlayableMediaUrl} from '../../utils/helpers';
import {useAppIsActive} from '../../hooks/useAppIsActive';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface MediaModalProps {
  visible: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  userName?: string;
  postTime?: string;
  /** Post caption shown over media (Facebook-style truncate + more). */
  description?: string;
  /** Smaller URL shown immediately while full media loads */
  previewUrl?: string;
}

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const VIDEO_EXT = /\.(mp4|mov|webm|mkv|m4v|3gp)(\?|$)/i;
const CAPTION_COLLAPSED_LINES = 3;

const MediaModal: React.FC<MediaModalProps> = ({
  visible,
  onClose,
  mediaUrl,
  mediaType,
  userName,
  postTime,
  description,
  previewUrl,
}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [fullImageReady, setFullImageReady] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [captionTruncated, setCaptionTruncated] = useState(false);
  const appIsActive = useAppIsActive();
  const videoPaused = !visible || !appIsActive;

  const caption = String(description || '').trim();

  const resolvedUrl = useMemo(() => {
    if (!mediaUrl) {
      return '';
    }
    return resolvePlayableMediaUrl(mediaUrl) || mediaUrl;
  }, [mediaUrl]);

  const resolvedPreview = useMemo(() => {
    if (!previewUrl) {
      return '';
    }
    return changeUrlForData(previewUrl) || previewUrl;
  }, [previewUrl]);

  const playAsVideo =
    mediaType === 'video' || VIDEO_EXT.test(resolvedUrl || mediaUrl || '');

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(false);
      setFullImageReady(false);
      setCaptionExpanded(false);
      setCaptionTruncated(false);
    }
  }, [visible, mediaUrl, mediaType, previewUrl, retryKey, description]);

  const showPreview =
    Boolean(resolvedPreview) &&
    resolvedPreview !== resolvedUrl &&
    (playAsVideo ? loading : !fullImageReady);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined}
      hardwareAccelerated>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.container}>
        <View style={[styles.header, {paddingTop: Math.max(insets.top, vh * 4)}]}>
          <View style={styles.headerInfo}>
            {userName ? (
              <InterRegular style={styles.userName}>{userName}</InterRegular>
            ) : null}
            {postTime ? (
              <InterRegular style={styles.postTime}>{postTime}</InterRegular>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.mediaContainer}>
          {!visible || !resolvedUrl ? null : playAsVideo ? (
            error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load video</Text>
                <TouchableOpacity
                  onPress={() => {
                    setError(false);
                    setLoading(true);
                    setRetryKey(k => k + 1);
                  }}
                  style={styles.retryBtn}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.videoContainer}>
                {showPreview ? (
                  <FastImage
                    source={{
                      uri: resolvedPreview,
                      priority: FastImage.priority.high,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.previewImage}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : null}
                {loading && !resolvedPreview ? (
                  <ActivityIndicator
                    size="large"
                    color="#fff"
                    style={styles.loader}
                  />
                ) : null}
                <Video
                  key={`${resolvedUrl}-${retryKey}`}
                  source={{uri: resolvedUrl}}
                  style={styles.video}
                  resizeMode="contain"
                  controls
                  repeat={false}
                  paused={videoPaused}
                  playInBackground={false}
                  playWhenInactive={false}
                  disableFocus={Platform.OS === 'android'}
                  useTextureView={Platform.OS === 'android'}
                  ignoreSilentSwitch="ignore"
                  onLoad={() => {
                    setLoading(false);
                    setError(false);
                  }}
                  onReadyForDisplay={() => setLoading(false)}
                  onError={e => {
                    console.warn(
                      '[MediaModal] playback error',
                      e?.error ?? e,
                      resolvedUrl,
                    );
                    setLoading(false);
                    setError(true);
                  }}
                />
              </View>
            )
          ) : (
            <View style={styles.imageWrap}>
              {showPreview ? (
                <FastImage
                  source={{
                    uri: resolvedPreview,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.previewImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              ) : null}
              {loading && !resolvedPreview ? (
                <ActivityIndicator
                  size="large"
                  color="#fff"
                  style={styles.loader}
                />
              ) : null}
              <FastImage
                key={resolvedUrl}
                source={{
                  uri: resolvedUrl,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={[
                  styles.image,
                  !fullImageReady && resolvedPreview
                    ? styles.fullImageHidden
                    : null,
                ]}
                resizeMode={FastImage.resizeMode.contain}
                onLoad={() => {
                  setFullImageReady(true);
                  setLoading(false);
                }}
                onError={() => {
                  setFullImageReady(true);
                  setLoading(false);
                }}
              />
            </View>
          )}

          {caption ? (
            <View
              style={[
                styles.captionDock,
                {paddingBottom: Math.max(insets.bottom, 12)},
              ]}
              pointerEvents="box-none">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (captionTruncated) {
                    setCaptionExpanded(true);
                  }
                }}
                style={styles.captionCollapsed}
                accessibilityRole="button"
                accessibilityLabel="Expand description">
                <Text
                  style={styles.captionText}
                  numberOfLines={CAPTION_COLLAPSED_LINES}
                  onTextLayout={e => {
                    const lines = e.nativeEvent.lines?.length ?? 0;
                    setCaptionTruncated(lines >= CAPTION_COLLAPSED_LINES);
                  }}>
                  {caption}
                </Text>
                {captionTruncated ? (
                  <Text style={styles.moreText}>more</Text>
                ) : null}
              </TouchableOpacity>
            </View>
          ) : null}

          {caption && captionExpanded ? (
            <View style={styles.captionOverlayRoot} pointerEvents="box-none">
              <Pressable
                style={styles.captionOverlayScrim}
                onPress={() => setCaptionExpanded(false)}
              />
              <View
                style={[
                  styles.captionOverlayCard,
                  {
                    maxHeight: screenHeight * 0.55,
                    paddingBottom: Math.max(insets.bottom, 12),
                  },
                ]}>
                <View style={styles.captionOverlayHeader}>
                  <Text style={styles.captionOverlayTitle}>Description</Text>
                  <TouchableOpacity
                    onPress={() => setCaptionExpanded(false)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={styles.seeLessText}>See less</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.captionScroll}
                  showsVerticalScrollIndicator
                  bounces>
                  <Text style={styles.captionTextExpanded}>{caption}</Text>
                </ScrollView>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1.5,
    zIndex: 20,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  mediaContainer: {
    flex: 1,
    width: '100%',
  },
  imageWrap: {
    flex: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  fullImageHidden: {
    opacity: 0,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  videoContainer: {
    flex: 1,
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: screenWidth,
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  loader: {
    position: 'absolute',
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontWeight: '600',
  },
  captionDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },
  captionCollapsed: {
    paddingHorizontal: vw * 4,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  captionText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  moreText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  captionOverlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    justifyContent: 'flex-end',
  },
  captionOverlayScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  captionOverlayCard: {
    backgroundColor: 'rgba(20,20,20,0.96)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: vw * 4,
    paddingTop: 14,
    zIndex: 41,
  },
  captionOverlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  captionOverlayTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  seeLessText: {
    color: '#9EDCE0',
    fontSize: 14,
    fontWeight: '600',
  },
  captionScroll: {
    flexGrow: 0,
  },
  captionTextExpanded: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    paddingBottom: 16,
  },
});

export default MediaModal;
