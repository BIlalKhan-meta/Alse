import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import {X} from 'lucide-react-native';
import InterRegular from '../Text/InterRegular';
import {vh, vw} from '../../constant';
import {changeUrlForData, getAbsoluteAvatarUrl} from '../../utils/helpers';

interface MediaModalProps {
  visible: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  userName?: string;
  postTime?: string;
}

const {width: screenWidth} = Dimensions.get('window');

const MediaModal: React.FC<MediaModalProps> = ({
  visible,
  onClose,
  mediaUrl,
  mediaType,
  userName,
  postTime,
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<typeof Video | any>(null);

  const resolvedUrl = useMemo(() => {
    if (!mediaUrl) {
      return '';
    }
    return getAbsoluteAvatarUrl(mediaUrl) || changeUrlForData(mediaUrl) || mediaUrl;
  }, [mediaUrl]);

  useEffect(() => {
    if (visible) {
      setIsVideoLoading(true);
      setIsImageLoading(true);
      setVideoError(false);
    }
  }, [visible, mediaUrl, mediaType]);

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setVideoError(true);
  };

  const retryVideo = () => {
    setVideoError(false);
    setIsVideoLoading(true);
  };

  const renderVideoContent = () => {
    if (videoError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load video</Text>
          <TouchableOpacity onPress={retryVideo} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.videoContainer}>
        {isVideoLoading && (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={styles.videoLoader}
          />
        )}

        <Video
          ref={videoRef}
          source={{uri: resolvedUrl}}
          style={styles.video}
          resizeMode="contain"
          controls
          repeat={false}
          bufferConfig={{
            minBufferMs: 1500,
            maxBufferMs: 15000,
            bufferForPlaybackMs: 1000,
            bufferForPlaybackAfterRebufferMs: 2000,
          }}
          onLoad={handleVideoLoad}
          onReadyForDisplay={handleVideoLoad}
          onError={handleVideoError}
          ignoreSilentSwitch="ignore"
        />
      </View>
    );
  };

  const renderImageContent = () => {
    return (
      <View style={styles.imageWrap}>
        {isImageLoading ? (
          <View style={styles.loaderOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : null}
        {resolvedUrl ? (
          <Image
            key={resolvedUrl}
            source={{uri: resolvedUrl}}
            style={styles.image}
            resizeMode="contain"
            onLoad={() => setIsImageLoading(false)}
            onLoadEnd={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
          />
        ) : null}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined}>
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.mediaContainer}>
          {mediaType === 'image' ? renderImageContent() : renderVideoContent()}
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
    paddingTop: vh * 6,
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
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  videoContainer: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: screenWidth,
    flex: 1,
  },
  videoLoader: {
    position: 'absolute',
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0C959B',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default MediaModal;
