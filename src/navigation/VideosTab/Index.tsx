import React, {useEffect, useState, useRef} from 'react';
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
  SafeAreaView,
} from 'react-native';
import Video from 'react-native-video';
import {getVideos} from '../../api/reels';
import {images} from '../../utils/images';
import {fontSizes, vh} from '../../constant';
import {colors} from '../../utils/theme';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';

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
  index,
  isVisible,
  onLike,
  onComment,
  onShare,
}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const [isPaused, setIsPaused] = useState(!isVisible);
  const [videoLoad, setVideoLoad] = useState(true);
  const [showFullText, setShowFullText] = useState(false);
  const maxTextLength = 100;

  useEffect(() => {
    setIsPaused(!isVisible);
  }, [isVisible]);

  const myAccount = user?.id == item.user?.id;

  const goToProfile = () => {
    if (myAccount) {
      navigation.navigate('MyProfile', {account: item.privacy});
    } else if (item.user?.id) {
      navigation.navigate('Profile', {
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

    return (
      <Text
        style={styles.postText}
        numberOfLines={showFullText ? undefined : 2}>
        {item.content}
        {item.content.length > maxTextLength && !showFullText && (
          <Text style={styles.readMoreText} onPress={handleReadMoreToggle}>
            {' '}
            more
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
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.videoTouchable}
          onPress={handleVideoPause}>
          <Video
            onReadyForDisplay={() => setVideoLoad(false)}
            source={{uri: item.video}}
            style={styles.video}
            resizeMode="cover"
            repeat={true}
            paused={isPaused}
            onBuffer={res => {
              if (res?.isBuffering) {
                setVideoLoad(true);
              }
            }}
            ignoreSilentSwitch={'ignore'}
          />
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
            source={images.logoIcon}
            style={styles.centerLogo}
            tintColor="#06B6D4"
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

const VideosTab = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (page = 1, append = false) => {
    try {
      setLoading(!append);
      const response = await getVideos(page);

      console.log('API Response:', response);

      // Handle both response structures - direct data or nested in response.data
      let apiData;
      if (response.data && response.data.data && response.data.data.data) {
        // Handle axios response structure: response.data.data.data
        apiData = response.data.data;
      } else if (response.data && response.data.data) {
        // Handle direct response structure: response.data.data
        apiData = response.data;
      } else if (response.status && response.data) {
        // Handle status-based response: response.data
        apiData = response.data;
      } else {
        console.log('Unexpected response structure:', response);
        apiData = {data: [], total: 0};
      }

      const videoData = apiData.data || [];
      console.log('Video data array:', videoData);
      console.log('Video data length:', videoData.length);

      if (videoData.length > 0) {
        // Transform data to include like state and other interactive properties
        const transformedReels = videoData.map(video => ({
          ...video,
          isLiked: false, // You can set this based on user's like status from API
          likes: Math.floor(Math.random() * 1000), // Replace with actual likes from API
          comments: Math.floor(Math.random() * 100), // Replace with actual comments from API
          // Create user object from user_id if user object doesn't exist
          user: video.user || {
            id: video.user_id,
            name: `User ${video.user_id}`,
            avatar: null,
          },
        }));

        console.log('Transformed reels:', transformedReels);

        if (append) {
          setReels(prevReels => [...prevReels, ...transformedReels]);
        } else {
          setReels(transformedReels);
        }

        const totalPages = Math.ceil(
          (apiData.total || videoData.length) / videoData.length,
        );
        setHasMore(page < totalPages);
        setCurrentPage(page);
      } else {
        console.log('No video data found in response');
        if (!append) {
          setReels([]);
        }
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

  const onViewRef = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });

  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 50});

  const renderReel = ({item, index}) => (
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
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (reels.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No videos available</Text>
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
