import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChevronLeft} from 'lucide-react-native';
import PostComponent from '../../components/PostComponent';
import CommentsModal from '../../components/CommentsModal';
import LikesModal from '../../components/LikesModal';
import MediaModal from '../../components/MediaModal';
import {createPost, getPost, postLike} from '../../api/home';
import {removeSavedItem, saveItem} from '../../api/menu';
import {usePostComments} from '../../hooks/usePostComments';
import {
  getMessage,
  getNewsfeedMediaList,
  parseSharedFrom,
  Toast,
} from '../../utils/helpers';
import {timeFormat} from '../../utils';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';

type RouteParams = {
  postId: number;
  prefetchedPost?: any;
};

const PostDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {postId, prefetchedPost} = (route.params ?? {}) as RouteParams;
  const [post, setPost] = useState<any>(prefetchedPost ?? null);
  const [loading, setLoading] = useState(!prefetchedPost);
  const [error, setError] = useState<string | null>(null);
  const [likesVisible, setLikesVisible] = useState(false);
  const [media, setMedia] = useState<{
    visible: boolean;
    mediaUrl: string;
    previewUrl?: string;
    mediaType: 'image' | 'video';
  }>({visible: false, mediaUrl: '', mediaType: 'image'});

  const {
    commentsVisible,
    isLoadingComments,
    isLoadingMore,
    commentsError,
    hasMoreComments,
    openComments,
    closeComments,
    retryComments,
    loadMoreComments,
  } = usePostComments('post');

  const loadPost = useCallback(async () => {
    if (!postId) {
      setError('Post not found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response: any = await getPost(postId);
      const nextPost = response?.data?.data ?? response?.data;
      if (!nextPost?.id) {
        throw new Error('Post not found');
      }
      setPost(nextPost);
    } catch (err: any) {
      setError(getMessage(err) || 'Could not load this post');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!prefetchedPost) {
      void loadPost();
    }
  }, [loadPost, prefetchedPost]);

  const mediaList = useMemo(
    () => getNewsfeedMediaList(post?.media),
    [post?.media],
  );
  const primaryMedia = mediaList[0];
  const {caption, sharedFromName} = parseSharedFrom(post?.description ?? '');

  const handleLike = async () => {
    if (!post?.id) {
      return;
    }
    const previous = post;
    const wasLiked = Boolean(post.is_liked);
    setPost((current: any) => ({
      ...current,
      is_liked: !wasLiked,
      total_likes: Math.max(0, Number(current.total_likes ?? 0) + (wasLiked ? -1 : 1)),
    }));
    try {
      await postLike(post.id);
    } catch (err: any) {
      setPost(previous);
      Toast.error(getMessage(err) || 'Could not update like');
    }
  };

  const handleSave = async () => {
    if (!post?.id) {
      return;
    }
    const wasSaved = Boolean(post.is_saved);
    setPost((current: any) => ({...current, is_saved: !wasSaved}));
    const payload = {item_id: post.id, item_type: 'post'};
    try {
      if (wasSaved) {
        await removeSavedItem(payload);
      } else {
        await saveItem(payload);
      }
    } catch (err: any) {
      setPost((current: any) => ({...current, is_saved: wasSaved}));
      Toast.error(getMessage(err) || 'Could not update saved post');
    }
  };

  const handleShareToFeed = async (form: FormData) => {
    try {
      await createPost(form);
      Toast.success('Post shared successfully');
    } catch (err: any) {
      Toast.error(getMessage(err) || 'Could not share post');
    }
  };

  const handleMediaPress = (item: any) => {
    const mediaUrl = item?.full_path || item?.path || item?.medium_path || '';
    if (!mediaUrl) {
      return;
    }
    const mediaType =
      String(item?.type ?? '').toLowerCase() === 'video' ? 'video' : 'image';
    setMedia({
      visible: true,
      mediaUrl,
      previewUrl: item?.thumbnail_path || item?.medium_path,
      mediaType,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft color={colors.black} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.themeColor} />
        </View>
      ) : error || !post ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Post not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPost}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <PostComponent
            id={post.user_id}
            mediaId={post.id}
            avatar={post.avatar ?? ''}
            name={post.fullname || post.name || ''}
            country={post.country ?? ''}
            time={timeFormat(post.date, true)}
            postText={caption}
            sharedFromName={sharedFromName}
            mediaList={mediaList.map(item => ({
              id: item.id,
              path: item.path ?? '',
              type: item.type ?? 'image',
              thumbnail_path: item.thumbnail_path,
              medium_path: item.medium_path,
              full_path: item.full_path,
            }))}
            postImage={primaryMedia?.path ?? ''}
            mediaType={
              String(primaryMedia?.type ?? '').toLowerCase() === 'video'
                ? 'video'
                : 'image'
            }
            likes={Number(post.total_likes ?? post.likes?.length ?? 0)}
            comments={Number(post.total_comments ?? 0)}
            share={Number(post.share ?? 0)}
            account={post.privacy ?? ''}
            onCommnetPress={() => openComments(post.id)}
            onLikesModal={() => setLikesVisible(true)}
            onLikePress={handleLike}
            onSavePress={handleSave}
            onDotPress={() => {}}
            modalVisible={false}
            onCardPress={() => {}}
            handleBlockPress={() => {}}
            handleReportPost={() => {}}
            handleReportPress={() => {}}
            isLiked={Boolean(post.is_liked)}
            isSaved={Boolean(post.is_saved)}
            isFocused
            showMenuButton={false}
            sharePost={handleShareToFeed}
            onMediaPress={handleMediaPress}
          />
        </ScrollView>
      )}

      <CommentsModal
        visible={commentsVisible.visible}
        closeModal={() => {
          closeComments();
          void loadPost();
        }}
        icon={images.checkedIcon}
        title=""
        message=""
        buttonText=""
        comments={commentsVisible.comments}
        postId={commentsVisible.id || postId || 0}
        isLoadingComments={isLoadingComments}
        isLoadingMore={isLoadingMore}
        commentsError={commentsError}
        onRetryComments={retryComments}
        onLoadMoreComments={loadMoreComments}
        hasMoreComments={hasMoreComments}
        onCommentCreated={() =>
          setPost((current: any) => ({
            ...current,
            total_comments: Number(current?.total_comments ?? 0) + 1,
          }))
        }
      />
      <LikesModal
        visible={likesVisible}
        likes={(post?.likes ?? []) as []}
        closeModal={() => setLikesVisible(false)}
      />
      <MediaModal
        visible={media.visible}
        onClose={() => setMedia(current => ({...current, visible: false}))}
        mediaUrl={media.mediaUrl}
        previewUrl={media.previewUrl}
        mediaType={media.mediaType}
        userName={post?.fullname || post?.name || ''}
        postTime={post?.date ? timeFormat(post.date, true) : ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E6EB',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingVertical: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: colors.black,
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.themeColor,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default PostDetail;
