import React, {useState, useRef} from 'react';
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
} from 'react-native';
import Video from 'react-native-video';
import {X, Play, Pause} from 'lucide-react-native';
import InterRegular from '../Text/InterRegular';
import {colors} from '../../utils/theme';
import {vh, vw} from '../../constant';

interface MediaModalProps {
  visible: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  userName?: string;
  postTime?: string;
}

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const MediaModal: React.FC<MediaModalProps> = ({
  visible,
  onClose,
  mediaUrl,
  mediaType,
  userName,
  postTime,
}) => {
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<Video>(null);

  const handleVideoPress = () => {
    setIsVideoPaused(!isVideoPaused);
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setVideoError(true);
  };

  const renderVideoContent = () => {
    if (videoError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load video</Text>
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

        <TouchableOpacity
          style={styles.videoTouchable}
          activeOpacity={0.9}
          onPress={handleVideoPress}>
          <Video
            ref={videoRef}
            source={{uri: mediaUrl}}
            style={styles.video}
            resizeMode="contain"
            repeat={true}
            paused={isVideoPaused}
            onLoad={handleVideoLoad}
            onError={handleVideoError}
            onBuffer={({isBuffering}) => {
              if (isBuffering) {
                setIsVideoLoading(true);
              }
            }}
            ignoreSilentSwitch="ignore"
          />
        </TouchableOpacity>

        {/* Video Controls Overlay */}
        <View style={styles.videoControls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handleVideoPress}>
            {isVideoPaused ? (
              <Play size={40} color="#fff" />
            ) : (
              <Pause size={40} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderImageContent = () => {
    return (
      <Image
        source={{uri: mediaUrl}}
        style={styles.image}
        resizeMode="contain"
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
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

        {/* Media Content */}
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
    paddingTop: vh * 6, // Account for status bar
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
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTouchable: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default MediaModal;
