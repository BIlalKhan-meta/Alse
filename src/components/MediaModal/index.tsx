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
import CustomImage from '../CustomeImage';
import {vh, vw} from '../../constant';
import {changeUrlForData} from '../../utils/helpers';
import {appCache} from '../../utils/appCache';

interface MediaModalProps {
  visible: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  userName?: string;
  postTime?: string;
  /** Optional medium URL for progressive quality upgrade */
  previewUrl?: string;
}

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const MediaModal: React.FC<MediaModalProps> = ({
  visible,
  onClose,
  mediaUrl,
  mediaType,
  userName,
  postTime,
  previewUrl,
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [useFullQuality, setUseFullQuality] = useState(!previewUrl);
  const videoRef = useRef<typeof Video | any>(null);

  const resolvedUrl = useMemo(() => {
    const preferred =
      !useFullQuality && previewUrl ? previewUrl : mediaUrl;
    return preferred ? changeUrlForData(preferred) : '';
  }, [mediaUrl, previewUrl, useFullQuality]);

  useEffect(() => {
    if (visible) {
      setIsVideoLoading(true);
      setVideoError(false);
      setUseFullQuality(!previewUrl);
      if (mediaUrl) {
        appCache.set(`recent-media:${mediaUrl}`, String(Date.now()));
      }
    }
  }, [visible, mediaUrl, mediaType, previewUrl]);

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoError(false);
    if (!useFullQuality && previewUrl && mediaUrl) {
      setUseFullQuality(true);
    }
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setVideoError(true);
  };

  const retryVideo = () => {
    setVideoError(false);
    setIsVideoLoading(true);
    setUseFullQuality(true);
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
      <CustomImage
        source={{uri: resolvedUrl}}
        variant="full"
        style={styles.image}
        resizeMode="contain"
        showPlaceholder
        onLoadEnd={() => {
          if (!useFullQuality && previewUrl) {
            setUseFullQuality(true);
          }
        }}
      />
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
            {userName && (
              <InterRegular style={styles.userName}>{userName}</InterRegular>
            )}
            {postTime && (
              <InterRegular style={styles.postTime}>{postTime}</InterRegular>
            )}
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
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: screenHeight * 0.75,
  },
  image: {
    width: screenWidth,
    flex: 1,
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
