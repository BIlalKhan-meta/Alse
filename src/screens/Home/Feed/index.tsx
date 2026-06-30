import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Modal,
  ActivityIndicator,
  Text,
  Image,
  RefreshControl,
} from 'react-native';
import {images} from '../../../utils/images';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from './styles';
import PostComponent from '../../../components/PostComponent';
import CommentsModal from '../../../components/CommentsModal';
import ReactModal from '../../../components/ReactModal';
import GeneralModal from '../../../components/GeneralModal';
import {reactions} from '../../../dummyData';
import {useAppDispatch, useAppSelector} from '../../../hooks/storeHooks';
import {
  getCommentPost,
  GetNewsFeed,
  FEED_PAGE_SIZE,
  likePost,
  PostDelete,
  postSave,
  updateLike,
} from '../../../store/slices/homeSlice';
import InterRegular from '../../../components/Text/InterRegular';
import {
  getMessage,
  Toast,
  getAbsoluteAvatarUrl,
  getNewsfeedMediaList,
  parseSharedFrom,
} from '../../../utils/helpers';
import {colors} from '../../../utils/theme';
import {createPost, getCountriesList, reportPost} from '../../../api/home';
import {removeSavedItem, saveItem} from '../../../api/menu';
import {checkIsSeller} from '../../../api/shop';
import {vh, vw} from '../../../constant';
import {getCountries} from '../../../store/slices/generalSlice';
import {timeFormat} from '../../../utils';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {notificationListenerInstance} from '../../../utils/NotificationServices';
import {useSelector} from 'react-redux';
import {
  GetUserProfile,
  selectUserProfile,
} from '../../../store/slices/authSlice';
import eventEmitter, {EVENT_TYPES} from '../../../utils/EventEmitter';
import LikesModal from '../../../components/LikesModal';
import Stories, {StoriesRef} from '../../../components/Stories';
import {Plus, Video, Image as ImageIcon} from 'lucide-react-native';
import PostSkeleton from '../../../components/SkeletonLoaders';
import {useTranslation} from 'react-i18next';
import MediaModal from '../../../components/MediaModal';
import FeedWellnessModal from '../../../components/FeedWellnessModal';
import FeedFilterTabs from '../../../components/FeedFilterTabs';
import {useFeedSessionTracking} from '../../../hooks/useFeedSessionTracking';
import {resolveFeedLabel} from '../../../utils/feedLabels';
import {
  FeedFilterTab,
  filterFeedPosts,
  getFeedFilterApiParam,
} from '../../../utils/feedFilters';

const Home: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const storiesRef = useRef<StoriesRef>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [feedVideoMuted, setFeedVideoMuted] = useState(true);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);

  const {t} = useTranslation();

  const {
    activeThreshold,
    dismissWarning,
    closeFeed,
    isWarningVisible,
  } = useFeedSessionTracking(navigation);

  const {posts, loadingMore, hasMore, currentPage} = useAppSelector(
    state => state.home,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FeedFilterTab>('all');

  const [commentsVisible, setCommentsVisible] = useState<{
    visiblity: boolean;
    comments: any[];
    id: number | null;
  }>({
    visiblity: false,
    comments: [],
    id: null,
  });
  const [likesVisible, setLikesVisible] = useState<{
    visiblity: boolean;
    likes: any[];
    id: number | null;
  }>({
    visiblity: false,
    likes: [],
    id: null,
  });
  const [reactVisible, setrRactVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [deleteVisible, setDeleteVisible] = useState<{
    visibility: boolean;
    id: number | null;
  }>({
    visibility: false,
    id: null,
  });
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [reportLoader, setReportLoader] = useState(false);

  const [reportVisible, setReportVisible] = useState<{
    visibility: boolean;
    id: number | null;
  }>({
    visibility: false,
    id: null,
  });
  const [_pause, _setPause] = useState(false);
  const [_currendId, _setCurrentID] = useState(0);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [shareLoader, setShareLoader] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [isFabOpen, setIsFabOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const [mediaModalVisible, setMediaModalVisible] = useState<{
    visible: boolean;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    userName: string;
    postTime: string;
  }>({
    visible: false,
    mediaUrl: '',
    mediaType: 'image',
    userName: '',
    postTime: '',
  });

  const closePaymentProcess = async (remoteMessage: any) => {
    console.log('remoteMesssaadssage ==>', remoteMessage);
    await InAppBrowser.isAvailable();
    InAppBrowser.close();
    if (remoteMessage?.notification?.title === 'Payment Successful') {
      eventEmitter.emit(EVENT_TYPES.CHECKOUT_TRIGGER, remoteMessage);
    }
  };

  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();

    setIsFabOpen(!isFabOpen);
  };

  // Fetch all home data: feed, profile, countries, user/shops, stories, live-streams
  const fetchAllData = useCallback(
    async (showInitialLoading = false, filter: FeedFilterTab = activeFilter) => {
      try {
        if (showInitialLoading) {
          setInitialLoading(true);
        }
        const apiFilter = getFeedFilterApiParam(filter);
        await dispatch(
          GetNewsFeed({
            page: 1,
            per_page: FEED_PAGE_SIZE,
            ...(apiFilter ? {filter: apiFilter} : {}),
          }),
        );
        await dispatch(GetUserProfile());
        await getCountriesList().then(res => {
          if (res?.data) {
            dispatch(getCountries(res?.data?.data));
          }
        });
        await checkIsSeller();
        void storiesRef.current?.refresh();
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [dispatch, activeFilter],
  );

  const filteredPosts = useMemo(
    () => filterFeedPosts(posts as Record<string, unknown>[], activeFilter),
    [posts, activeFilter],
  );

  const handleFilterChange = useCallback((filter: FeedFilterTab) => {
    setActiveFilter(filter);
    setFocusedIndex(null);
    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData(false);
  }, [fetchAllData]);

  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore) {
      const apiFilter = getFeedFilterApiParam(activeFilter);
      dispatch(
        GetNewsFeed({
          page: currentPage + 1,
          per_page: FEED_PAGE_SIZE,
          ...(apiFilter ? {filter: apiFilter} : {}),
        }),
      );
    }
  }, [dispatch, loadingMore, hasMore, currentPage, activeFilter]);

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.loadMoreFooter}>
        <ActivityIndicator size="small" color={colors.themeColor} />
      </View>
    );
  };

  useEffect(() => {
    notificationListenerInstance.init(closePaymentProcess);
  }, []);

  useEffect(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  useEffect(() => {
    if (!user) {
      return;
    }
    if (!user.has_subscription && !user.is_child) {
      navigation.navigate('SubscriptionPlan');
    }
  }, [navigation, user]);

  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({animated: true, offset: 0});
    }
  };

  const handleCommentPress = (id: any) => {
    setCommentsLoading(true);
    dispatch(getCommentPost(id))
      .then((res: any) => {
        setCommentsVisible({
          visiblity: true,
          comments: res?.payload?.data?.data?.data ?? [],
          id: id,
        });
      })
      .catch(err => {
        console.log('error from fetch comments', err);
        Toast.error(getMessage(err?.message));
      })
      .finally(() => {
        setCommentsLoading(false);
      });
  };

  const handleLikePress = (id: number) => {
    const avatarUrl = getAbsoluteAvatarUrl(user?.avatar);
    const tempData = {
      id: Math.random(),
      user: {
        id: user?.id,
        avatar: avatarUrl || images.profile,
        full_name: user?.full_name ? user?.full_name : '',
      },
    };
    const data = {
      postid: id,
      tempData,
    };
    dispatch(updateLike(data));
    dispatch(likePost(id));
  };

  const handleDotPress = (postId: number | null) => {
    setActivePostId(activePostId === null ? postId : null);
  };

  const handleDelete = () => {
    setReportLoader(true);
    dispatch(PostDelete(deleteVisible?.id || 0))
      .unwrap()
      .then(_res => {
        setDeleteVisible({
          visibility: false,
          id: null,
        });
        setReportLoader(false);
        fetchAllData(false);
        setDeleteSuccess(true);
        handleDotPress(null);
      })
      .catch(err => {
        setReportLoader(false);
        setDeleteVisible({
          visibility: false,
          id: null,
        });
        handleDotPress(null);
        Toast.error(getMessage(err?.message));
        console.log('Errorr  errerrerrerrerrerrerrerrerrfrom ', err);
      });
  };

  const handleReport = async () => {
    console.log(reportVisible.id, 'Reportttt idddddd');
    setReportLoader(true);
    const data = {
      reportable_type: 'Post',
      reportable_id: reportVisible?.id,
      reason: 'testingg',
    };

    let formData = new FormData();
    Object.entries(data).forEach(item => {
      formData.append(item[0], item[1]);
    });
    await reportPost(formData)
      .then(_res => {
        setReportVisible({
          visibility: false,
          id: null,
        });
        setReportLoader(false);
        fetchAllData(false);
        setReportSuccess(true);
        handleDotPress(null);
      })
      .catch(err => {
        setReportLoader(false);
        setReportVisible({
          visibility: false,
          id: null,
        });
        handleDotPress(null);
        Toast.error(getMessage(err?.message));
        console.log('Errorr  errerrerrerrerrerrerrerrerrfrom ', err);
      });
  };

  const sharePost = useCallback(
    async (form: FormData) => {
      setShareLoader(true);
      try {
        await createPost(form);
        Toast.success('Post shared successfully');
        await dispatch(GetNewsFeed({page: 1, per_page: FEED_PAGE_SIZE}));
      } catch (err: any) {
        Toast.error(
          getMessage(err?.response?.data ?? err?.message ?? err ?? ''),
        );
      } finally {
        setShareLoader(false);
      }
    },
    [dispatch],
  );

  const handleSave = async (id: number, isSaved: boolean) => {
    dispatch(postSave(id));
    const data = {
      item_id: id,
      item_type: 'post',
    };
    if (isSaved) {
      await removeSavedItem(data)
        .then(res => console.log('SAVEDDD POSTTTTT REMOOVEEEDDDD', res))
        .catch(err => console.log('ERRRORRRRRRRRR SAVEDDDDDDDDDDD', err));
    } else {
      await saveItem(data)
        .then(res => console.log('POSTTTT SAVEEEDDDDDDD', res))
        .catch(err => console.log('SAVEEEEDDDDDD POSTTTTT ERRORRRRRR', err));
    }
  };

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: Array<{index?: number | null; isViewable?: boolean}>}) => {
      const visibleItems = viewableItems.filter(
        item => item.isViewable !== false && typeof item.index === 'number',
      );

      if (visibleItems.length === 0) {
        setFocusedIndex(null);
        return;
      }

      const sorted = [...visibleItems].sort(
        (a, b) => (a.index ?? 0) - (b.index ?? 0),
      );
      const primaryItem = sorted[Math.floor(sorted.length / 2)];
      setFocusedIndex(primaryItem.index ?? null);
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 250,
  }).current;

  const viewabilityConfigCallbackPairs = useRef([
    {viewabilityConfig, onViewableItemsChanged},
  ]).current;

  const handleMediaPress = (item: any, mediaIndex = 0) => {
    const mediaList = getNewsfeedMediaList(item?.media);
    const selected = mediaList[mediaIndex] ?? mediaList[0];
    if (selected?.path) {
      setMediaModalVisible({
        visible: true,
        mediaUrl: selected.path,
        mediaType:
          String(selected.type ?? 'image').toLowerCase() === 'video'
            ? 'video'
            : 'image',
        userName: item.fullname || '',
        postTime: timeFormat(item.date, true),
      });
    }
  };

  const renderPost = ({item, index}: any) => {
    const isFocused =
      isScreenFocused &&
      !mediaModalVisible.visible &&
      focusedIndex === index;
    const mediaList = getNewsfeedMediaList(item?.media);
    const primaryMedia = mediaList[0];
    const postDescriptionRaw = item?.description ?? item?.content ?? '';
    const {caption, sharedFromName} = parseSharedFrom(postDescriptionRaw);
    const feedLabel = resolveFeedLabel(item);

    return (
      <PostComponent
        feedLabel={feedLabel}
        isFocused={isFocused}
        id={item?.user_id}
        mediaId={item?.id}
        avatar={item?.avatar}
        name={item?.fullname}
        country={item?.country ? item?.country : ''}
        time={timeFormat(item?.date, true)}
        postText={caption}
        sharedFromName={sharedFromName}
        mediaList={mediaList.map(media => ({
          id: media.id,
          path: media.path ?? '',
          type: media.type ?? 'image',
        }))}
        postImage={primaryMedia?.path ?? ''}
        mediaType={
          String(primaryMedia?.type ?? 'image').toLowerCase() === 'video'
            ? 'video'
            : 'image'
        }
        likes={item?.likes?.length}
        comments={item?.total_comments}
        share={item?.share}
        account={item?.privacy}
        sharePost={sharePost}
        onCommnetPress={() => handleCommentPress(item?.id)}
        onLikesModal={() =>
          setLikesVisible({visiblity: true, likes: item?.likes, id: item?.id})
        }
        onLikePress={() => handleLikePress(item?.id)}
        onSavePress={() => handleSave(item?.id, item?.is_saved)}
        onDotPress={() => handleDotPress(item?.id)}
        modalVisible={activePostId === item?.id}
        onCardPress={() => setActivePostId(null)}
        handleBlockPress={() => {
          setDeleteVisible({visibility: true, id: item?.id});
        }}
        handleReportPost={() => {
          setReportVisible({visibility: true, id: item?.id});
          handleDotPress(null);
        }}
        handleReportPress={() => {
          setActivePostId(null);
          const {caption} = parseSharedFrom(postDescriptionRaw);
          navigation.navigate('CreatePostEdit', {
            title: 'Edit Post',
            data: {...item, description: caption},
          });
        }}
        isLiked={item?.is_liked}
        isSaved={item?.is_saved}
        onMediaPress={(media, mediaIndex) => {
          handleMediaPress(item, mediaIndex);
          handleDotPress(null);
        }}
        isPaused={!isFocused}
        muteInlineVideo={feedVideoMuted}
        onToggleVideoMute={() => setFeedVideoMuted(muted => !muted)}
      />
    );
  };

  const renderCreatePostSection = () => (
    <View style={styles.whatsOnYourMindContainer}>
      <View style={styles.whatsOnYourMindTop}>
        <Image
          source={
            user?.avatar
              ? {uri: getAbsoluteAvatarUrl(user?.avatar)}
              : images.profile
          }
          style={styles.profilePic}
        />
        <TouchableOpacity
          testID="feed-create-post"
          style={styles.whatsOnYourMindInput}
          onPress={() => navigation.navigate('CreatePost')}>
          <InterRegular style={styles.whatsOnYourMindText}>
            What's on your mind?
          </InterRegular>
        </TouchableOpacity>
      </View>
      <View style={styles.whatsOnYourMindBottom}>
        <TouchableOpacity
          style={styles.whatsOnYourMindButton}
          onPress={() => navigation.navigate('CreatePost')}>
          <Video color="#FF3B30" size={20} />
          <InterRegular style={styles.whatsOnYourMindButtonText}>
            Video
          </InterRegular>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.whatsOnYourMindButton}
          onPress={() => navigation.navigate('CreatePost')}>
          <ImageIcon color="#4CD964" size={20} />
          <InterRegular style={styles.whatsOnYourMindButtonText}>
            Photo
          </InterRegular>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeedTopSection = () => (
    <View style={styles.feedTopSection} collapsable={false}>
      {renderCreatePostSection()}
      <FeedFilterTabs
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />
    </View>
  );

  const getEmptyMessageKey = (): string => {
    switch (activeFilter) {
      case 'following':
        return 'feed.empty.following';
      case 'videos':
        return 'feed.empty.videos';
      case 'images':
        return 'feed.empty.images';
      case 'stories':
        return 'feed.empty.stories';
      default:
        return 'feed.empty.all';
    }
  };

  const renderEmpty = () => {
    // Don't show empty state when initially loading
    if (initialLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <InterRegular style={styles.emptyTitle}>
          {t(getEmptyMessageKey())}
        </InterRegular>
        {activeFilter === 'following' ? (
          <InterRegular style={styles.emptySubtext}>
            {t('feed.empty.followingHint')}
          </InterRegular>
        ) : null}
        {activeFilter === 'all' && posts.length === 0 ? (
          <InterRegular style={styles.emptySubtext}>
            {t('feed.empty.allHint')}
          </InterRegular>
        ) : null}
        {activeFilter === 'stories' ? (
          <InterRegular style={styles.emptySubtext}>
            {t('feed.empty.storiesHint')}
          </InterRegular>
        ) : null}
      </View>
    );
  };

  // Render skeleton loaders during initial loading
  const renderSkeletonLoaders = () => {
    if (!initialLoading) {
      return null;
    }

    return (
      <View>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </View>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
        setFocusedIndex(null);
      };
    }, []),
  );

  return (
    <View style={styles.mainContainer}>
      <Modal visible={commentsLoading} transparent animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.loaderText}>Loading comments...</Text>
          </View>
        </View>
      </Modal>
      <Modal visible={shareLoader} transparent animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.loaderText}>{t('sharingPost')}</Text>
          </View>
        </View>
      </Modal>
      <View style={styles.contentContainer}>
        <View style={styles.storiesWrap} collapsable={false}>
          <Stories ref={storiesRef} />
        </View>

        {renderFeedTopSection()}

        <View style={styles.feedContainer}>
          {initialLoading ? (
            <View style={styles.feedList}>{renderSkeletonLoaders()}</View>
          ) : (
            <FlatList
              key={activeFilter}
              ref={flatListRef}
              style={styles.feedList}
              viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
              data={filteredPosts}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.themeColor]}
                  tintColor={colors.themeColor}
                />
              }
              renderItem={renderPost}
              contentContainerStyle={styles.feedListContent}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={renderFooter}
              onEndReached={loadMorePosts}
              onEndReachedThreshold={0.5}
              removeClippedSubviews={false}
            />
          )}

          {/* FAB Container */}
          <View style={styles.fabMenuContainer}>
            {/* Menu options */}
            {isFabOpen && (
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    toggleFab();
                    navigation.navigate('ChatScreen');
                  }}>
                  <InterRegular style={styles.menuItemText}>Chat</InterRegular>
                </TouchableOpacity>

                {/* <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    toggleFab();
                    // Add story functionality
                  }}>
                  <InterRegular style={styles.menuItemText}>Story</InterRegular>
                </TouchableOpacity> */}

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    toggleFab();
                    navigation.navigate('CreatePost');
                  }}>
                  <InterRegular style={styles.menuItemText}>Post</InterRegular>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    toggleFab();
                    // TODO
                    // Add reel functionality
                    navigation.navigate('CreateReel');
                  }}>
                  <InterRegular style={styles.menuItemText}>Reel</InterRegular>
                </TouchableOpacity>
              </View>
            )}

            {/* Main FAB Button */}
            <TouchableOpacity
              style={styles.fabButton}
              activeOpacity={0.8}
              onPress={toggleFab}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <CommentsModal
            visible={commentsVisible.visiblity}
            closeModal={() => {
              setCommentsVisible({visiblity: false, comments: [], id: null});
              fetchAllData(false);
            }}
            icon={images.checkedIcon}
            title="Successfully"
            message="Password has been updated successfully"
            buttonText="Apply"
            comments={commentsVisible?.comments}
            postId={commentsVisible?.id || 0}
          />

          <LikesModal
            visible={likesVisible.visiblity}
            likes={likesVisible.likes as any}
            closeModal={() => {
              setLikesVisible({visiblity: false, likes: [], id: null});
              fetchAllData(false);
            }}
          />

          <ReactModal
            visible={reactVisible}
            closeModal={() => setrRactVisible(false)}
            reactions={reactions as any}
          />

          <GeneralModal
            visible={deleteVisible.visibility}
            closeModal={() =>
              setDeleteVisible({
                visibility: false,
                id: null,
              })
            }
            icon={images.qmark}
            title="Delete Post"
            message="Are you sure you want to delete this Post?"
            SecondaryText1="Yes"
            SecondaryText2="No"
            onPress={handleDelete}
            secondaryBtn={true}
            loading={reportLoader}
            buttonText={''}
            primaryBtn={false}
          />

          <GeneralModal
            visible={deleteSuccess}
            closeModal={() => setDeleteSuccess(false)}
            icon={images.checkedIcon}
            title="Delete Post"
            message="Post has been deleted successfully."
            buttonText="Ok"
            onPress={() => {
              setDeleteSuccess(false);
            }}
            primaryBtn={true}
          />

          <GeneralModal
            visible={reportVisible.visibility}
            closeModal={() =>
              setReportVisible({
                visibility: false,
                id: null,
              })
            }
            icon={images.qmark}
            title="Report Post"
            message="Are you sure you want to report this post?"
            SecondaryText1="Yes"
            SecondaryText2="No"
            onPress={handleReport}
            secondaryBtn={true}
            loading={reportLoader}
            buttonText={''}
            primaryBtn={false}
          />

          <GeneralModal
            visible={reportSuccess}
            closeModal={() => setReportSuccess(false)}
            icon={images.checkedIcon}
            title="Report Post"
            message="Post has been reported successfully!"
            buttonText="Ok"
            onPress={() => {
              setReportSuccess(false);
            }}
            primaryBtn={true}
          />

          <MediaModal
            visible={mediaModalVisible.visible}
            onClose={() =>
              setMediaModalVisible({
                visible: false,
                mediaUrl: '',
                mediaType: 'image',
                userName: '',
                postTime: '',
              })
            }
            mediaUrl={mediaModalVisible.mediaUrl}
            mediaType={mediaModalVisible.mediaType}
            userName={mediaModalVisible.userName}
            postTime={mediaModalVisible.postTime}
          />

          <FeedWellnessModal
            visible={isWarningVisible}
            minutes={activeThreshold ?? 15}
            onClose={dismissWarning}
            onCloseFeed={closeFeed}
          />
        </View>
      </View>
    </View>
  );
};

export default Home;
