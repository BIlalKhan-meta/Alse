import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import {Bookmark} from 'lucide-react-native';
import {createPost, reportPost} from '../../api/home';
import {getSavedItems, removeSavedItem} from '../../api/menu';
import CommentsModal from '../../components/CommentsModal';
import GeneralModal from '../../components/GeneralModal';
import LikesModal from '../../components/LikesModal';
import Loader from '../../components/Loader';
import PostComponent from '../../components/PostComponent';
import ReactModal from '../../components/ReactModal';
import InterRegular from '../../components/Text/InterRegular';
import {reactions} from '../../dummyData';
import {useAppDispatch} from '../../hooks/storeHooks';
import {selectUserProfile} from '../../store/slices/authSlice';
import {likePost, PostDelete} from '../../store/slices/homeSlice';
import {timeFormat} from '../../utils';
import {getMessage, parseSharedFrom} from '../../utils/helpers';
import {useTranslation} from 'react-i18next';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import styles from './styles';
import {usePostComments} from '../../hooks/usePostComments';

const Saved: React.FC = () => {
  const navigation = useNavigation<any>();
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);

  const [reactVisible, setReactVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [pause, setPause] = useState(false);
  const [currentId, setCurrentId] = useState(0);
  const [shareLoader, setShareLoader] = useState(false);
  const [reportLoader, setReportLoader] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState({
    visibility: false,
    id: null as number | null,
  });
  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null as number | null,
  });
  const [likesVisible, setLikesVisible] = useState({
    visibility: false,
    likes: [] as any[],
    id: null as number | null,
  });
  const [reportSuccess, setReportSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const {
    commentsVisible,
    isLoadingComments,
    isLoadingMore: isLoadingMoreComments,
    commentsError,
    hasMoreComments,
    openComments,
    closeComments,
    retryComments,
    loadMoreComments,
  } = usePostComments();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await getSavedItems({type: 'post'});
      const rows = res?.data?.data?.data ?? res?.data?.data ?? [];
      const savedPosts = (Array.isArray(rows) ? rows : [])
        .map((item: any) => item?.savable_item)
        .filter(Boolean);
      setPosts(savedPosts);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: getMessage((err as any)?.message) || 'Failed to load saved posts',
      });
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleVideoPause = (id: number) => {
    setPause(prev => !prev);
    setCurrentId(id);
  };

  const handleCommentPress = (id: number) => {
    openComments(id);
  };

  const handleLikePress = (id: number) => {
    const temp = [...posts];
    const index = temp.findIndex(item => item?.id === id);
    if (index < 0) return;

    const postFound = temp[index];
    const tempData = {
      id: Math.random(),
      user: {
        id: user?.id,
        avatar: user?.avatar ? user.avatar : images.profile,
        full_name: user?.full_name ? user.full_name : '',
      },
    };
    const clone = JSON.parse(JSON.stringify(postFound?.likes ?? []));
    const find = clone.findIndex((val: any) => val?.user?.id === user?.id);

    if (find > -1) {
      clone.splice(find, 1);
    } else {
      clone.push(tempData);
    }
    postFound.is_liked = !postFound?.is_liked;
    postFound.likes = clone;
    setPosts(temp);
    dispatch(likePost(id));
  };

  const handleSave = async (id: number) => {
    setPosts(prev => prev.filter(item => item?.id !== id));
    await removeSavedItem({item_id: id, item_type: 'post'}).catch(err =>
      console.log('Error removing saved post', err),
    );
  };

  const handleDotPress = (postId: number | null) => {
    setActivePostId(postId);
  };

  const handleDelete = () => {
    if (!deleteVisible.id) return;
    setReportLoader(true);
    dispatch(PostDelete(deleteVisible.id))
      .unwrap()
      .then(() => {
        setDeleteVisible({visibility: false, id: null});
        setReportLoader(false);
        fetchData();
        setDeleteSuccess(true);
        handleDotPress(null);
      })
      .catch(err => {
        setReportLoader(false);
        setDeleteVisible({visibility: false, id: null});
        handleDotPress(null);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: getMessage(err?.message),
        });
      });
  };

  const handleReport = async () => {
    if (!reportVisible.id) return;
    setReportLoader(true);
    const data = {
      reportable_type: 'Post',
      reportable_id: reportVisible.id,
      reason: 'testingg',
    };
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await reportPost(formData)
      .then(() => {
        setReportVisible({visibility: false, id: null});
        setReportLoader(false);
        fetchData();
        setReportSuccess(true);
        handleDotPress(null);
      })
      .catch(err => {
        setReportLoader(false);
        setReportVisible({visibility: false, id: null});
        handleDotPress(null);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: getMessage(err?.message),
        });
      });
  };

  const sharePost = async (form: FormData) => {
    setShareLoader(true);
    await createPost(form)
      .then(res => {
        if (res?.data) {
          Toast.show({
            type: 'success',
            text1: 'Post shared successfully',
          });
        }
      })
      .catch(err => console.log('Share error', err))
      .finally(() => setShareLoader(false));
  };

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    setFocusedIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const viewabilityConfig = useRef({
    waitForInteraction: true,
    itemVisiblePercentThreshold: 75,
  }).current;

  const countLabel = useMemo(() => {
    const n = posts.length;
    return n === 1 ? '1 post' : `${n} posts`;
  }, [posts.length]);

  const renderHeader = () => (
    <View style={styles.introCard}>
      <View style={styles.introIconWrap}>
        <Bookmark size={22} color={colors.themeColor} strokeWidth={2.2} />
      </View>
      <View style={styles.introTextWrap}>
        <Text style={styles.introTitle}>Saved Posts</Text>
        <InterRegular style={styles.introSubtitle}>
          Posts you bookmarked from the feed appear here.
        </InterRegular>
      </View>
      {posts.length > 0 ? (
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{countLabel}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Bookmark size={32} color={colors.themeColor} strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>No saved posts yet</Text>
      <InterRegular style={styles.emptySubtitle}>
        Tap the save icon on any post in your feed and it will show up here.
      </InterRegular>
    </View>
  );

  const renderPost = ({item, index}: {item: any; index: number}) => {
    const isFocused = focusedIndex === index;
    const postDescriptionRaw = item?.description ?? item?.content ?? '';
    const {caption, sharedFromName} = parseSharedFrom(postDescriptionRaw);

    return (
      <View style={styles.postCard}>
        <PostComponent
          id={item?.user_id}
          isFocused={isFocused}
          isPaused={pause && currentId === item?.id}
          handleVideoPause={() => handleVideoPause(item?.id)}
          avatar={item?.avatar}
          name={item?.fullname}
          country={item?.country ? item.country : ''}
          time={timeFormat(item?.date, true)}
          postText={caption}
          sharedFromName={sharedFromName}
          postImage={item?.media?.[0]?.path}
          mediaType={
            String(item?.media?.[0]?.type ?? 'image').toLowerCase() === 'video'
              ? 'video'
              : 'image'
          }
          likes={item?.total_likes}
          comments={item?.total_comments}
          share={item?.share}
          account={item?.privacy}
          sharePost={sharePost}
          onCommnetPress={() => handleCommentPress(item?.id)}
          onLikePress={() => handleLikePress(item?.id)}
          onLikesModal={() =>
            setLikesVisible({
              visibility: true,
              likes: item?.likes,
              id: item?.id,
            })
          }
          onSavePress={() => handleSave(item?.id)}
          onDotPress={() => handleDotPress(item?.id)}
          modalVisible={activePostId === item?.id}
          onCardPress={() => setActivePostId(null)}
          handleBlockPress={() =>
            setDeleteVisible({visibility: true, id: item?.id})
          }
          handleReportPost={() =>
            setReportVisible({visibility: true, id: item?.id})
          }
          handleReportPress={() => {
            const {caption: editCaption} = parseSharedFrom(postDescriptionRaw);
            navigation.navigate('CreatePostEdit', {
              title: 'Edit Post',
              data: {...item, description: editCaption},
            });
          }}
          isLiked={item?.is_liked}
          isSaved={item?.is_saved}
        />
      </View>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Modal visible={shareLoader} transparent animationType="fade">
        <View style={styles.shareLoaderOverlay}>
          <View style={styles.shareLoaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.shareLoaderText}>{t('sharingPost')}</Text>
          </View>
        </View>
      </Modal>

      <FlatList
        style={styles.container}
        data={posts}
        keyExtractor={item => String(item?.id)}
        renderItem={renderPost}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyList : styles.list
        }
        ListHeaderComponent={posts.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={() => fetchData(true)}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      />

      <CommentsModal
        visible={commentsVisible.visible}
        closeModal={closeComments}
        title="Successfully"
        message="Password has been updated successfully"
        buttonText="Apply"
        comments={commentsVisible?.comments}
        postId={commentsVisible?.id || 0}
        isLoadingComments={isLoadingComments}
        isLoadingMore={isLoadingMoreComments}
        commentsError={commentsError}
        onRetryComments={retryComments}
        onLoadMoreComments={loadMoreComments}
        hasMoreComments={hasMoreComments}
      />

      <ReactModal
        visible={reactVisible}
        closeModal={() => setReactVisible(false)}
        reactions={reactions}
      />

      <LikesModal
        visible={likesVisible.visibility}
        likes={likesVisible.likes}
        closeModal={() =>
          setLikesVisible({visibility: false, likes: [], id: null})
        }
      />

      <GeneralModal
        visible={deleteVisible.visibility}
        closeModal={() => setDeleteVisible({visibility: false, id: null})}
        icon={images.qmark}
        title="Delete Post"
        message="Are you sure you want to delete this Post?"
        SecondaryText1="Yes"
        SecondaryText2="No"
        onPress={handleDelete}
        secondaryBtn
        loading={reportLoader}
      />

      <GeneralModal
        visible={deleteSuccess}
        closeModal={() => setDeleteSuccess(false)}
        icon={images.checkedIcon}
        title="Delete Post"
        message="Post has been deleted successfully."
        buttonText="Ok"
        onPress={() => setDeleteSuccess(false)}
        primaryBtn
      />

      <GeneralModal
        visible={reportVisible.visibility}
        closeModal={() => setReportVisible({visibility: false, id: null})}
        icon={images.qmark}
        title="Report Post"
        message="Are you sure you want to report this post?"
        SecondaryText1="Yes"
        SecondaryText2="No"
        onPress={handleReport}
        secondaryBtn
        loading={reportLoader}
      />

      <GeneralModal
        visible={reportSuccess}
        closeModal={() => setReportSuccess(false)}
        icon={images.checkedIcon}
        title="Report Post"
        message="Post has been reported successfully!"
        buttonText="Ok"
        onPress={() => setReportSuccess(false)}
        primaryBtn
      />
    </>
  );
};

export default Saved;
