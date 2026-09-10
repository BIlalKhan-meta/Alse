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
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import {X} from 'lucide-react-native';
import InterRegular from '../Text/InterRegular';
import {vh, vw} from '../../constant';
import {changeUrlForData, resolvePlayableMediaUrl} from '../../utils/helpers';

interface MediaModalProps {
  visible: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  userName?: string;
  postTime?: string;
  /** Smaller URL shown immediately while full media loads */
  previewUrl?: string;
}

const {width: screenWidth} = Dimensions.get('window');
const VIDEO_EXT = /\.(mp4|mov|webm|mkv|m4v|3gp)(\?|$)/i;

const MediaModal: React.FC<MediaModalProps> = ({
  visible,
  onClose,
  mediaUrl,
  mediaType,
  userName,
  postTime,
  previewUrl,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [fullImageReady, setFullImageReady] = useState(false);

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
    }
  }, [visible, mediaUrl, mediaType, previewUrl, retryKey]);

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
        <View style={styles.header}>
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
                  paused={false}
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
    paddingVertical: vh * 2,
    paddingTop: Platform.OS === 'ios' ? vh * 6 : vh * 4,
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
});

export default MediaModal;
