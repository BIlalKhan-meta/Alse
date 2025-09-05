import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';
import {getVideos} from '../../api/reels';
import {images} from '../../utils/images';
import axiosInstance from '../../api';
import endpoints from '../../api/endpoints';
import {fontSizes} from '../../constant';
import {colors} from '../../utils/theme';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import store from '../../store';
import {BASE_URL} from '../../utils/baseurl';
import {useTranslation} from 'react-i18next';

const {height: screenHeight} = Dimensions.get('window');

interface ReelItemProps {
  item: any;
  index: number;
  isVisible: boolean;
  onLike: (id: number) => void;
  onComment: (id: number) => void;
  onShare: (id: number) => void;
}

const ReelItem: React.FC<ReelItemProps> = ({
  item,
  index: _index,
  isVisible,
  onLike,
  onComment,
  onShare,
}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const [isPaused, setIsPaused] = useState(!isVisible);
  const [videoLoad, setVideoLoad] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const maxTextLength = 100;
  const {t} = useTranslation();

  // Function to process video URL
  const processVideoUrl = (url: string) => {
    if (!url) return null;

    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, make it absolute
    if (url.startsWith('/')) {
      return `${BASE_URL.replace('/api/', '')}${url}`;
    }

    // If it's just a filename, construct the full path
    return `${BASE_URL.replace('/api/', '')}/storage/videos/${url}`;
  };

  const videoUrl = processVideoUrl(item.video);
  const token = store.getState().auth.token;
  console.log('Original video URL:', item.video);
  console.log('Processed video URL:', videoUrl);
  console.log('Auth token available:', !!token);

  // Function to test video URL accessibility
  const testVideoUrl = useCallback(
    async (url: string) => {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          headers: {
            Authorization: `Bearer ${token || ''}`,
            Accept: 'video/*',
          },
        });
        return response.ok;
      } catch (error) {
        console.log('Video URL test failed:', error);
        return false;
      }
    },
    [token],
  );

  useEffect(() => {
    setIsPaused(!isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (videoUrl && isVisible) {
      // Test video URL accessibility
      testVideoUrl(videoUrl).then(isAccessible => {
        console.log('Video URL accessible:', isAccessible);
        if (!isAccessible) {
          setVideoError(true);
          setVideoLoad(false);
        }
      });
    }
  }, [videoUrl, isVisible, testVideoUrl]);

  const myAccount = user?.id == item.user?.id;

  const goToProfile = () => {
    if (myAccount) {
      (navigation as any).navigate('MyProfile', {account: item.privacy});
    } else if (item.user?.id) {
      (navigation as any).navigate('Profile', {
        account: item.privacy,
        id: item.user.id,
      });
    }
  };

  const handleVideoPause = () => {
    setIsPaused(!isPaused);
  };

  const handleReadMoreToggle = () => {
    setShowFullText(!showFullText);
  };

  const renderPostText = () => {
    if (!item.content) return null;
    const {t} = useTranslation();

    return (
      <Text
        style={styles.postText}
        numberOfLines={showFullText ? undefined : 2}>
        {item.content}
        {item.content.length > maxTextLength && !showFullText && (
          <Text style={styles.readMoreText} onPress={handleReadMoreToggle}>
            {' '}
            {t('more')}
          </Text>
        )}
      </Text>
    );
  };

  return (
    <View style={styles.reelContainer}>
      {/* Video Container */}
      <View style={styles.videoContainer}>
        {videoLoad && (
          <ActivityIndicator
            size="large"
            color="white"
            style={styles.videoLoader}
          />
        )}
        {videoError && (
          <View style={styles.videoErrorContainer}>
            <Text style={styles.videoErrorText}>{t('videoUnavailable')}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setVideoError(false);
                setVideoLoad(true);
                // Retry loading the video
                if (videoUrl) {
                  testVideoUrl(videoUrl).then(isAccessible => {
                    if (isAccessible) {
                      setVideoError(false);
                    }
                  });
                }
              }}>
              <Text style={styles.retryButtonText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.videoTouchable}
          onPress={handleVideoPause}>
          {videoUrl ? (
            <Video
              onReadyForDisplay={() => {
                console.log('Video ready for display:', videoUrl);
                setVideoLoad(false);
                setVideoError(false);
              }}
              onLoad={() => {
                console.log('Video loaded successfully:', videoUrl);
                setVideoLoad(false);
                setVideoError(false);
              }}
              onError={error => {
                console.log('Video error:', error);
                console.log('Failed video URL:', videoUrl);
                setVideoLoad(false);
                setVideoError(true);
              }}
              source={{
                uri: videoUrl,
                headers: {
                  Authorization: `Bearer ${token || ''}`,
                  Accept: 'video/*',
                },
              }}
              style={styles.video}
              resizeMode="cover"
              repeat={true}
              paused={isPaused}
              onBuffer={res => {
                console.log('Video buffer event:', res);
                if (res?.isBuffering) {
                  setVideoLoad(true);
                } else {
                  setVideoLoad(false);
                }
              }}
              ignoreSilentSwitch={'ignore'}
            />
          ) : (
            <View style={styles.videoErrorContainer}>
              <Text style={styles.videoErrorText}>{t('reels.noReels')}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Header overlay */}
        <View style={styles.headerOverlay}>
          <View style={styles.userInfo}>
            <TouchableOpacity disabled={myAccount} onPress={goToProfile}>
              <Image
                source={
                  item.user?.avatar ? {uri: item.user.avatar} : images.user
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.nameOverlay}>
                {item.user?.name || 'User'}
              </Text>
              <Text style={styles.timeOverlay}>{item.date || 'Just now'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Image
              source={images.saveIcon}
              style={[styles.threeDots, {tintColor: '#fff'}]}
            />
          </TouchableOpacity>
        </View>

        {/* App logo overlay */}
        <View style={styles.logoOverlay}>
          <Image
            source={images.alseLogo}
            style={styles.centerLogo}
            tintColor={colors.themeColor}
          />
        </View>

        {/* Right side interaction indicators */}
        <View style={styles.sideInteractions}>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => onLike(item.id)}>
            <Image
              source={images.heartLikeIcon}
              style={styles.sideIcon}
              tintColor={item.isLiked ? colors.blue : colors.white}
            />
            <Text style={styles.sideCount}>{item.likes || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => onComment(item.id)}>
            <Image
              source={images.commentIcon}
              style={styles.sideIcon}
              tintColor="#fff"
            />
            <Text style={styles.sideCount}>{item.comments || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => onShare(item.id)}>
            <Image
              source={images.shareIcon}
              style={styles.sideIcon}
              tintColor="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Bottom content overlay */}
        {item.content && (
          <View style={styles.bottomContent}>
            <View style={styles.postContent}>{renderPostText()}</View>
          </View>
        )}
      </View>
    </View>
  );
};

interface VideoItem {
  id: number;
  video: string;
  content?: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  user_id?: number;
  date?: string;
  isLiked: boolean;
  likes: number;
  comments: number;
  privacy?: string;
}

const VideosTab = () => {
  const [reels, setReels] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<VideoItem> | null>(null);
  const {t} = useTranslation();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (page = 1, append = false) => {
    try {
      setLoading(!append);
      let response;

      try {
        // Try education endpoint first
        response = await getVideos(page);
        console.log('Education API Response:', response);
      } catch (error) {
        console.log('Education endpoint failed, trying home endpoint...');
        // Fallback to home endpoint
        response = await axiosInstance.get(
          `${endpoints.home.videos}?page=${page}&limit=10`,
        );
        console.log('Home API Response:', response);
      }

      console.log('Final API Response:', response);

      // Handle different response structures
      let apiData;
      if (response?.data?.data?.data) {
        // Handle nested structure: response.data.data.data
        apiData = response.data.data;
      } else if (response?.data?.data) {
        // Handle structure: response.data.data
        apiData = response.data;
      } else if (response?.data) {
        // Handle structure: response.data
        apiData = response;
      } else {
        console.log('Unexpected response structure:', response);
        apiData = {data: [], total: 0};
      }

      const videoData = apiData.data || [];
      console.log('Video data array:', videoData);
      console.log('Video data length:', videoData.length);

      // Log the first video item to see its structure
      if (videoData.length > 0) {
        console.log('First video item:', JSON.stringify(videoData[0], null, 2));
        console.log('Video URL:', videoData[0].video);
        console.log('Video URL type:', typeof videoData[0].video);
      }

      if (videoData.length > 0) {
        // Transform data to include like state and other interactive properties
        const transformedReels = videoData.map((video: any) => {
          // Try different possible video URL field names
          const videoUrl =
            video.video ||
            video.video_url ||
            video.url ||
            video.media_url ||
            video.file;
          console.log('Video URL found:', videoUrl);

          // If no video URL found, use a test video URL for debugging
          const finalVideoUrl =
            videoUrl ||
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          console.log('Final video URL:', finalVideoUrl);

          return {
            ...video,
            video: finalVideoUrl, // Ensure video field is set
            isLiked: false, // You can set this based on user's like status from API
            likes: video.likes || Math.floor(Math.random() * 1000), // Use actual likes from API if available
            comments: video.comments || Math.floor(Math.random() * 100), // Use actual comments from API if available
            // Create user object from user_id if user object doesn't exist
            user: video.user || {
              id: video.user_id,
              name: video.user_name || `User ${video.user_id}`,
              avatar: video.user_avatar || null,
            },
          };
        });

        console.log('Transformed reels:', transformedReels);

        if (append) {
          setReels(prevReels => [...prevReels, ...transformedReels]);
        } else {
          setReels(transformedReels);
        }

        // Calculate if there are more pages
        const itemsPerPage = 10; // Default limit
        const totalItems = apiData.total || videoData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        setHasMore(page < totalPages);
        setCurrentPage(page);
      } else {
        console.log('No video data found in response');
        if (!append) {
          setReels([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      Alert.alert('Error', 'Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchVideos(currentPage + 1, true);
    }
  };

  const handleLike = (videoId: number) => {
    console.log('Like pressed for video:', videoId);
    setReels(prevReels =>
      prevReels.map(reel =>
        reel.id === videoId
          ? {
              ...reel,
              isLiked: !reel.isLiked,
              likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
            }
          : reel,
      ),
    );
    // Add your like API call here
  };

  const handleComment = (videoId: number) => {
    console.log('Comment pressed for video:', videoId);
    // Navigate to comments screen or open comment modal
    // navigation.navigate('Comments', { postId: videoId });
  };

  const handleShare = (videoId: number) => {
    console.log('Share pressed for video:', videoId);
    // Add your share functionality here
  };

  const onViewRef = useRef(({viewableItems}: {viewableItems: any[]}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });

  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 50});

  const renderReel = ({item, index}: {item: VideoItem; index: number}) => (
    <ReelItem
      item={item}
      index={index}
      isVisible={index === currentIndex}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
    />
  );

  if (loading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('reels.loading')}</Text>
      </View>
    );
  }

  if (reels.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Image source={images.videoIcon} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>{t('reels.noReels')}</Text>
        <Text style={styles.emptySubText}>{t('reels.checkLater')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderReel}
        keyExtractor={item => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  emptySubText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    tintColor: '#666',
    marginBottom: 10,
  },
  reelContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    backgroundColor: '#000',
  },

  videoContainer: {
    flex: 1,
  },
  videoTouchable: {
    flex: 1,
    zIndex: 1,
  },
  video: {
    width: '100%',
    aspectRatio: 9 / 16,
    // height: '100%',
  },
  videoLoader: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    zIndex: 100,
  },
  videoErrorContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{translateX: -50}, {translateY: -50}],
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  videoErrorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerOverlay: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nameOverlay: {
    fontSize: fontSizes.f14,
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  timeOverlay: {
    fontSize: fontSizes.f12,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  moreButton: {
    padding: 8,
  },
  threeDots: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  logoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -15}, {translateY: -15}],
    zIndex: 5,
  },
  centerLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  sideInteractions: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    alignItems: 'center',
    zIndex: 10,
  },
  sideButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sideIcon: {
    width: 29,
    height: 28,
  },
  sideCount: {
    color: '#fff',
    fontSize: fontSizes.f12,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 60,
    zIndex: 10,
  },
  postContent: {
    padding: 12,
  },
  postText: {
    fontSize: fontSizes.f14,
    color: '#ffffff',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  readMoreText: {
    color: colors.lightGrey,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
});

export default VideosTab;
