import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Reels from 'react-native-instagram-reels';
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

const REEL_VIDEO_MAX_HEIGHT = Dimensions.get('window').height * 0.86;

type OverlayCtx = {
  _id: string | number;
  liked: boolean;
  disliked: boolean;
  index: number;
  overlayData?: VideoItem;
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

function processVideoUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${BASE_URL.replace(/\/api\/?$/, '')}${url}`;
  }
  const base = BASE_URL.replace(/\/api\/?$/, '');
  const path = url.startsWith('storage/') ? `/${url}` : `/storage/videos/${url}`;
  return `${base}${path}`;
}

/** Same chrome as before (header, actions, caption) — video is driven by react-native-instagram-reels. */
const VideosReelOverlay: React.FC<{
  ctx: OverlayCtx;
  onLike: (id: number) => void;
  onComment: (id: number) => void;
  onShare: (id: number) => void;
}> = ({ctx, onLike, onComment, onShare}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const item = ctx.overlayData;
  const {t} = useTranslation();
  const [showFullText, setShowFullText] = useState(false);
  const maxTextLength = 100;

  useEffect(() => {
    setShowFullText(false);
  }, [item?.id]);

  if (!item) return null;

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

  const handleReadMoreToggle = () => setShowFullText(!showFullText);

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
            {t('more')}
          </Text>
        )}
      </Text>
    );
  };

  return (
    <>
      <View style={styles.headerOverlay} pointerEvents="box-none">
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

      <View style={styles.sideInteractions} pointerEvents="box-none">
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

      {item.content ? (
        <View style={styles.bottomContent} pointerEvents="box-none">
          <View style={styles.postContent}>{renderPostText()}</View>
        </View>
      ) : null}
    </>
  );
};

const VideosTab = () => {
  const [reels, setReels] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {t} = useTranslation();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      let response;

      try {
        response = await getVideos(page);
      } catch (_error) {
        response = await axiosInstance.get(
          `${endpoints.home.videos}?page=${page}&limit=10`,
        );
      }

      let apiData;
      if (response?.data?.data?.data) {
        apiData = response.data.data;
      } else if (response?.data?.data) {
        apiData = response.data;
      } else if (response?.data) {
        apiData = response;
      } else {
        apiData = {data: [], total: 0};
      }

      const videoData = apiData.data || [];

      if (videoData.length > 0) {
        const transformedReels = videoData.map((video: any) => {
          const videoUrl =
            video.video ||
            video.video_url ||
            video.url ||
            video.media_url ||
            video.file;
          const finalVideoUrl =
            videoUrl ||
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

          return {
            ...video,
            id: video.id,
            video: finalVideoUrl,
            isLiked: video.is_liked ?? false,
            likes: video.likes ?? 0,
            comments: video.comments ?? 0,
            user: video.user || {
              id: video.user_id,
              name: video.user_name || `User ${video.user_id}`,
              avatar: video.user_avatar || null,
            },
          } as VideoItem;
        });

        if (append) {
          setReels(prevReels => [...prevReels, ...transformedReels]);
        } else {
          setReels(transformedReels);
        }

        const itemsPerPage = 10;
        const totalItems = apiData.total || videoData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        setHasMore(page < totalPages);
        setCurrentPage(page);
      } else {
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
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
      void fetchVideos(currentPage + 1, true);
    }
  }, [hasMore, loading, loadingMore, currentPage]);

  const handleLike = useCallback((videoId: number) => {
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
  }, []);

  const handleComment = useCallback((_videoId: number) => {}, []);

  const handleShare = useCallback((_videoId: number) => {}, []);

  const token = store.getState().auth.token;
  const videoHeaders = useMemo(
    () =>
      token
        ? {Authorization: `Bearer ${token}`, Accept: 'video/*'}
        : {Accept: 'video/*'},
    [token],
  );

  const reelsPayload = useMemo(() => {
    return reels.map(r => {
      const uri = processVideoUrl(r.video);
      return {
        _id: r.id,
        uri,
        liked: r.isLiked,
        disliked: false,
        videoHeaders,
        overlayData: r,
      };
    });
  }, [reels, videoHeaders]);

  const renderPersistentOverlay = useCallback(
    (ctx: Record<string, unknown>) => (
      <VideosReelOverlay
        ctx={ctx as unknown as OverlayCtx}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
      />
    ),
    [handleLike, handleComment, handleShare],
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
      <Reels
        videos={reelsPayload}
        backgroundColor="#000"
        videoDisplayMaxHeight={REEL_VIDEO_MAX_HEIGHT}
        tapToToggleControls={false}
        showPlayPauseOnTap
        enableSeekZones={false}
        pauseOnOptionsShow={false}
        renderPersistentOverlay={renderPersistentOverlay}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null
        }
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
  footerLoader: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
