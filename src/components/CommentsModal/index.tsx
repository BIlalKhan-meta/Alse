import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageSourcePropType,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {colors} from '../../utils/theme';

import styles from './styles';
import {BlurView} from '@react-native-community/blur';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {images} from '../../utils/images';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import {
  getCommentLikesThunk,
  likeComment,
} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {capitalize} from '../../utils';
import {
  getVideoCommentLikes,
  postComment,
  postCommentReply,
  postVideoComment,
  postVideoCommentReply,
  reportPost,
  videoCommentLike,
} from '../../api/home';
import {getMessage, Toast} from '../../utils/helpers';
import ToastMessage from 'react-native-toast-message';
import {vh} from '../../constant';
import {EmptyComponent} from '../EmptyComponent';
import LikesModal from '../LikesModal';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  ThumbsUp,
  Heart,
  MessageCircle,
  Send,
  MoreVertical,
  X,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import {
  COMMENT_TAG_CONFIG,
  COMMENT_TAGS,
  CommentTag,
  commentTagToApiValue,
  resolveCommentTag,
} from '../../utils/commentTags';
import {
  appendReplyToComment,
  canReplyTo,
  Comment,
  getCommentDepth,
  normalizeCommentTree,
  replaceCommentInTree,
  updateCommentInTree,
} from '../../utils/commentTree';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import ReportBlockModal from '../ReportBlockModal';
import GeneralModal from '../GeneralModal';
import Clipboard from '@react-native-clipboard/clipboard';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const DISMISS_DRAG_THRESHOLD = 120;
const DISMISS_VELOCITY = 800;

interface CommentsModalProps {
  visible: boolean;
  closeModal: () => void;
  icon: ImageSourcePropType;
  title: string;
  message: string;
  buttonText: string;
  comments: Comment[];
  postId: number;
  target?: 'post' | 'video';
  onCommentCreated?: () => void;
  isLoadingComments?: boolean;
  isLoadingMore?: boolean;
  commentsError?: string | null;
  onRetryComments?: () => void;
  onLoadMoreComments?: () => void;
  hasMoreComments?: boolean;
}

const getDisplayName = (commentUser: Comment['user']) =>
  commentUser?.full_name ||
  `${capitalize(commentUser?.first_name ?? '')} ${capitalize(
    commentUser?.last_name ?? '',
  )}`.trim();

const CommentsModal: React.FC<CommentsModalProps> = props => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  const {
    visible,
    closeModal,
    comments,
    postId,
    target = 'post',
    onCommentCreated,
    isLoadingComments = false,
    isLoadingMore = false,
    commentsError = null,
    onRetryComments,
    onLoadMoreComments,
    hasMoreComments = false,
  } = props;
  const commentDraftRef = useRef('');
  const commentInputRef = useRef<TextInput>(null);
  const replyDraftRef = useRef('');
  const replyInputRef = useRef<TextInput>(null);
  const [commentsData, setCommentsData] = useState<Comment[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedTag, setSelectedTag] = useState<CommentTag | null>(null);
  const [hasCommentText, setHasCommentText] = useState(false);
  const [commentLikesVisible, setCommentLikesVisible] = useState<{
    visible: boolean;
    likes: any[];
  }>({visible: false, likes: []});
  const [isFetchingCommentLikes, setIsFetchingCommentLikes] = useState(false);
  const [likingCommentIds, setLikingCommentIds] = useState<Set<number>>(
    new Set(),
  );
  const [activeMenuCommentId, setActiveMenuCommentId] = useState<number | null>(
    null,
  );
  const [reportVisible, setReportVisible] = useState<{
    visibility: boolean;
    id: number | null;
  }>({visibility: false, id: null});
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyTag, setReplyTag] = useState<CommentTag | null>(null);
  const [hasReplyText, setHasReplyText] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [rootHeight, setRootHeight] = useState(0);
  const navigation = useNavigation();
  const sheetTranslateY = useSharedValue(0);
  const isClosingRef = useRef(false);
  const {height: windowHeight} = useWindowDimensions();

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // The sheet lives in a Modal, whose window does not always resize for the
  // keyboard, so KeyboardAvoidingView cannot lift the composer. Shrink and
  // offset the sheet manually, and skip it when the window did resize on its
  // own. The tallest height seen is the no-keyboard baseline to compare against.
  const baseRootHeightRef = useRef(0);
  if (rootHeight > baseRootHeightRef.current) {
    baseRootHeightRef.current = rootHeight;
  }
  useEffect(() => {
    baseRootHeightRef.current = 0;
  }, [windowHeight]);

  const modalWindowResized =
    rootHeight > 0 &&
    baseRootHeightRef.current - rootHeight > keyboardHeight / 2;
  const keyboardOffset =
    keyboardHeight > 0 && !modalWindowResized ? keyboardHeight : 0;
  const sheetMaxHeight = Math.max(
    vh * 40,
    (rootHeight || windowHeight) - keyboardOffset,
  );

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      sheetTranslateY.value = vh * 85;
      sheetTranslateY.value = withSpring(0, {damping: 22, stiffness: 220});
    }
  }, [visible, sheetTranslateY]);

  const dismissSheet = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;
    closeModal();
  }, [closeModal]);

  const animateDismiss = useCallback(() => {
    sheetTranslateY.value = withSpring(
      vh * 85,
      {damping: 22, stiffness: 220},
      finished => {
        if (finished) {
          runOnJS(dismissSheet)();
        }
      },
    );
  }, [dismissSheet, sheetTranslateY]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(8)
        .failOffsetX([-24, 24])
        .onUpdate(event => {
          if (event.translationY > 0) {
            sheetTranslateY.value = event.translationY;
          }
        })
        .onEnd(event => {
          if (
            event.translationY > DISMISS_DRAG_THRESHOLD ||
            event.velocityY > DISMISS_VELOCITY
          ) {
            runOnJS(animateDismiss)();
            return;
          }
          sheetTranslateY.value = withSpring(0, {damping: 22, stiffness: 220});
        }),
    [animateDismiss, sheetTranslateY],
  );

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: sheetTranslateY.value}],
  }));

  const canSend = hasCommentText && !isSubmittingComment;
  const canSendReply =
    hasReplyText && !isSubmittingReply && Boolean(replyingTo);

  useEffect(() => {
    if (comments) {
      setCommentsData(normalizeCommentTree(comments));
    }
  }, [comments]);

  useEffect(() => {
    if (!visible) {
      setSelectedTag(null);
      setHasCommentText(false);
      setReplyingTo(null);
      setReplyTag(null);
      setHasReplyText(false);
      setActiveMenuCommentId(null);
      setReportVisible({visibility: false, id: null});
      setReportSuccess(false);
      setKeyboardHeight(0);
      commentDraftRef.current = '';
      replyDraftRef.current = '';
      commentInputRef.current?.clear();
    }
  }, [visible]);

  const syncCommentDraft = (text: string) => {
    commentDraftRef.current = text;
    setHasCommentText(text.trim().length > 0);
  };

  const syncReplyDraft = (text: string) => {
    replyDraftRef.current = text;
    setHasReplyText(text.trim().length > 0);
  };

  const handleCommentSubmit = async () => {
    const commentText = commentDraftRef.current.trim();
    if (!commentText) {
      return;
    }

    const form = new FormData();
    form.append('comment', commentText);
    if (selectedTag) {
      form.append('tag', commentTagToApiValue(selectedTag));
    }

    const optimisticComment: Comment = {
      id: Date.now(),
      user: {
        id: user?.id,
        avatar: user?.avatar,
        full_name:
          user?.full_name || user?.first_name + ' ' + user?.last_name,
      },
      comment: commentText,
      tag: selectedTag,
      is_liked: false,
      total_likes: 0,
      depth: 0,
      total_replies: 0,
      replies: [],
    };

    const previousComments = commentsData;
    const previousTag = selectedTag;
    const previousText = commentText;
    const submittedTag = selectedTag;
    setCommentsData([...commentsData, optimisticComment]);
    commentDraftRef.current = '';
    commentInputRef.current?.clear();
    setHasCommentText(false);
    setSelectedTag(null);
    setIsSubmittingComment(true);

    try {
      const response =
        target === 'video'
          ? await postVideoComment(form, postId)
          : await postComment(form, postId);
      const createdComment =
        response?.data?.data ?? response?.data ?? response ?? null;

      if (createdComment?.id) {
        setCommentsData(current =>
          replaceCommentInTree(current, optimisticComment.id, {
            ...optimisticComment,
            ...createdComment,
            comment: createdComment.comment ?? optimisticComment.comment,
            tag:
              resolveCommentTag(createdComment) ??
              optimisticComment.tag ??
              submittedTag,
            replies: optimisticComment.replies,
          }),
        );
      }
      onCommentCreated?.();
    } catch (err: any) {
      setCommentsData(previousComments);
      setSelectedTag(previousTag);
      commentDraftRef.current = previousText;
      commentInputRef.current?.setNativeProps({text: previousText});
      setHasCommentText(previousText.length > 0);
      const message =
        err?.message === 'Network Error'
          ? 'Please check your internet connection and try again.'
          : getMessage(err);
      Toast.error(message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyingTo) {
      return;
    }
    const replyText = replyDraftRef.current.trim();
    if (!replyText) {
      return;
    }

    const parentId = replyingTo.id;
    const parentDepth = getCommentDepth(replyingTo);
    const form = new FormData();
    form.append('comment', replyText);
    if (replyTag) {
      form.append('tag', commentTagToApiValue(replyTag));
    }

    const optimisticReply: Comment = {
      id: Date.now(),
      user: {
        id: user?.id,
        avatar: user?.avatar,
        full_name:
          user?.full_name || user?.first_name + ' ' + user?.last_name,
      },
      comment: replyText,
      tag: replyTag,
      parent_id: parentId,
      depth: Math.min(parentDepth + 1, 2) as 1 | 2,
      is_liked: false,
      total_likes: 0,
      total_replies: 0,
      replies: [],
    };

    const previousComments = commentsData;
    const previousReplyingTo = replyingTo;
    const previousReplyTag = replyTag;
    const previousReplyText = replyText;
    const submittedTag = replyTag;

    setCommentsData(current => appendReplyToComment(current, parentId, optimisticReply));
    replyDraftRef.current = '';
    replyInputRef.current?.clear();
    setHasReplyText(false);
    setReplyTag(null);
    setReplyingTo(null);
    setIsSubmittingReply(true);

    try {
      const response =
        target === 'video'
          ? await postVideoCommentReply(form, postId, parentId)
          : await postCommentReply(form, postId, parentId);
      const createdReply =
        response?.data?.data ?? response?.data ?? response ?? null;

      if (createdReply?.id) {
        setCommentsData(current =>
          replaceCommentInTree(current, optimisticReply.id, {
            ...optimisticReply,
            ...createdReply,
            comment: createdReply.comment ?? optimisticReply.comment,
            tag:
              resolveCommentTag(createdReply) ??
              optimisticReply.tag ??
              submittedTag,
            depth: optimisticReply.depth,
            parent_id: parentId,
            replies: [],
          }),
        );
      }
      onCommentCreated?.();
    } catch (err: any) {
      setCommentsData(previousComments);
      setReplyingTo(previousReplyingTo);
      setReplyTag(previousReplyTag);
      replyDraftRef.current = previousReplyText;
      replyInputRef.current?.setNativeProps({text: previousReplyText});
      setHasReplyText(previousReplyText.length > 0);
      const message =
        err?.message === 'Network Error'
          ? 'Please check your internet connection and try again.'
          : getMessage(err);
      Toast.error(message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleSendPress = () => {
    if (!canSend) {
      return;
    }
    Keyboard.dismiss();
    setTimeout(() => {
      void handleCommentSubmit();
    }, 100);
  };

  const handleLikePress = (id: number) => {
    if (likingCommentIds.has(id)) {
      return;
    }

    const previousComments = JSON.parse(JSON.stringify(commentsData)) as Comment[];
    setLikingCommentIds(prev => new Set(prev).add(id));
    setCommentsData(current =>
      updateCommentInTree(current, id, comment => ({
        ...comment,
        is_liked: !comment.is_liked,
        total_likes: comment.is_liked
          ? Math.max(0, comment.total_likes - 1)
          : comment.total_likes + 1,
      })),
    );

    const likePromise =
      target === 'video'
        ? videoCommentLike(postId, id)
        : dispatch(likeComment({id: postId, commentId: id})).unwrap();

    Promise.resolve(likePromise)
      .catch(err => {
        setCommentsData(previousComments);
        Toast.error(getMessage(err));
      })
      .finally(() => {
        setLikingCommentIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
  };

  const handleAccount = (privacy: number, id: number) => {
    closeModal();
    if (user.id !== id) {
      navigation.navigate('Profile', {privacy, id});
    }
  };

  const handleCommentLikesPress = (commentId: number, totalLikes: number) => {
    if (totalLikes === 0) {
      setCommentLikesVisible({visible: true, likes: []});
      return;
    }
    setIsFetchingCommentLikes(true);
    const likesPromise =
      target === 'video'
        ? getVideoCommentLikes(postId, commentId)
        : dispatch(getCommentLikesThunk({postId, commentId})).unwrap();

    Promise.resolve(likesPromise)
      .then((res: any) => {
        const likes =
          res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
        setCommentLikesVisible({visible: true, likes});
      })
      .catch(err => {
        Toast.error(getMessage(err?.message));
      })
      .finally(() => {
        setIsFetchingCommentLikes(false);
      });
  };

  const closeCommentMenu = () => setActiveMenuCommentId(null);

  const openCommentMenu = (commentId: number) => {
    setActiveMenuCommentId(prev => (prev === commentId ? null : commentId));
  };

  const handleCopyComment = (text: string) => {
    closeCommentMenu();
    Clipboard.setString(text);
    Toast.success(t('comments.copied'));
  };

  const handleShareComment = async (text: string) => {
    closeCommentMenu();
    try {
      await Share.share({message: text});
    } catch (err: any) {
      Toast.error(getMessage(err));
    }
  };

  const handleReportCommentPress = (commentId: number) => {
    closeCommentMenu();
    setReportVisible({visibility: true, id: commentId});
  };

  const handleReportConfirm = async () => {
    if (!reportVisible.id) {
      return;
    }
    setReportLoading(true);
    const formData = new FormData();
    formData.append('reportable_type', 'Comment');
    formData.append('reportable_id', String(reportVisible.id));
    formData.append('reason', 'Report');

    try {
      await reportPost(formData);
      setReportVisible({visibility: false, id: null});
      setReportSuccess(true);
    } catch (err: any) {
      Toast.error(getMessage(err));
    } finally {
      setReportLoading(false);
    }
  };

  const handleReplyPress = (item: Comment) => {
    closeCommentMenu();
    setReplyingTo(item);
    const parentTag = resolveCommentTag(item);
    setReplyTag(parentTag ?? 'answer');
    replyDraftRef.current = '';
    setHasReplyText(false);
    setTimeout(() => replyInputRef.current?.focus(), 100);
  };

  const handleReplySendPress = () => {
    if (!hasReplyText) {
      return;
    }
    void handleReplySubmit();
  };

  const renderComment = (item: Comment) => {
    const depth = getCommentDepth(item);
    const tag = resolveCommentTag(item);
    const badgeConfig = tag ? COMMENT_TAG_CONFIG[tag] : null;
    const isLiking = likingCommentIds.has(item.id);
    const depthStyle =
      depth === 2
        ? styles.commentItemDepth2
        : depth === 1
          ? styles.commentItemDepth1
          : null;

    return (
      <View
        key={item.id}
        style={[styles.commentItem, depthStyle]}
        testID={`comment-item-${item.id}`}>
        <Pressable
          onLongPress={() => openCommentMenu(item.id)}
          delayLongPress={300}>
          <View style={styles.commentContainer}>
            <TouchableOpacity
              disabled={user.id === item?.user?.id}
              onPress={() =>
                handleAccount(item?.user?.is_private, item?.user?.id)
              }
              style={styles.avatarContainer}>
              <Image
                source={
                  item?.user?.avatar ? {uri: item?.user?.avatar} : images.user
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View style={styles.contentContainer}>
              <View style={styles.nameRow}>
                <TouchableOpacity
                  style={styles.userNameContainer}
                  disabled={user.id === item?.user?.id}
                  onPress={() =>
                    handleAccount(item?.user?.is_private, item?.user?.id)
                  }>
                  <InterMedium style={styles.userName} numberOfLines={1}>
                    {getDisplayName(item.user)}
                  </InterMedium>
                </TouchableOpacity>

                <View style={styles.badgeRow}>
                  {badgeConfig ? (
                    <View
                      style={[
                        styles.badge,
                        {backgroundColor: badgeConfig.color},
                      ]}>
                      <Text style={styles.badgeText}>{badgeConfig.label}</Text>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.likeButton,
                      isLiking && styles.likeButtonDisabled,
                    ]}
                    onPress={() => handleLikePress(item.id)}
                    disabled={isLiking}>
                    <ThumbsUp
                      color={item.is_liked ? colors.blue : '#169BD5'}
                      size={18}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => openCommentMenu(item.id)}
                    testID={`comment-menu-${item.id}`}>
                    <MoreVertical color="#65676B" size={18} />
                  </TouchableOpacity>
                </View>
              </View>

              <InterRegular style={styles.comment}>{item.comment}</InterRegular>

              <View style={styles.postActions}>
                <TouchableOpacity
                  onPress={() =>
                    handleCommentLikesPress(item.id, item.total_likes ?? 0)
                  }>
                  <View style={styles.leftActions}>
                    <Heart color="#FF3B30" size={14} fill="#FF3B30" />
                    <InterRegular style={styles.actionText}>
                      {item.total_likes || 0}
                    </InterRegular>
                    <MessageCircle color="#65676B" size={14} />
                    <InterRegular style={styles.actionText}>
                      {item.total_replies || 0}
                    </InterRegular>
                  </View>
                </TouchableOpacity>
                {canReplyTo(item) ? (
                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => handleReplyPress(item)}
                    testID={`comment-reply-${item.id}`}>
                    <InterRegular style={styles.replyButtonText}>
                      {t('comments.reply')}
                    </InterRegular>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </Pressable>

        <ReportBlockModal
          isVisible={activeMenuCommentId === item.id}
          onClose={closeCommentMenu}
          style={{top: 40, right: 0}}
          options={[
            {
              text: t('comments.report'),
              onPress: () => handleReportCommentPress(item.id),
            },
            {
              text: t('comments.copy'),
              onPress: () => handleCopyComment(item.comment),
            },
            {
              text: t('comments.share'),
              onPress: () => void handleShareComment(item.comment),
            },
          ]}
        />

        {item.replies?.map(reply => renderComment(reply))}

        {depth === 0 ? <View style={styles.separator} /> : null}
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        onRequestClose={dismissSheet}
        animationType="fade"
        transparent>
        <ToastMessage topOffset={Platform.OS === 'ios' ? 54 : 24} />
        <View
          style={styles.modalRoot}
          onLayout={event => setRootHeight(event.nativeEvent.layout.height)}>
          <Pressable
            style={styles.backdrop}
            onPress={animateDismiss}
            accessibilityRole="button"
            accessibilityLabel="Close comments">
            {Platform.OS === 'ios' ? (
              <BlurView
                style={StyleSheet.absoluteFillObject}
                blurType="dark"
                blurAmount={1}
                reducedTransparencyFallbackColor="rgba(0,0,0,0.55)"
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {backgroundColor: 'rgba(0,0,0,0.55)'},
                ]}
              />
            )}
          </Pressable>
          <Animated.View
            style={[
              styles.container,
              {maxHeight: sheetMaxHeight, marginBottom: keyboardOffset},
              sheetAnimatedStyle,
            ]}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.dragHandleArea}>
                <View style={styles.dragHandle} />
              </View>
            </GestureDetector>
            <View style={styles.sheetContent}>
              {isLoadingComments ? (
                <View style={styles.commentsLoader}>
                  <ActivityIndicator size="large" color={colors.themeColor} />
                  <Text style={styles.commentsLoaderText}>
                    {t('comments.loading')}
                  </Text>
                </View>
              ) : commentsError && commentsData.length === 0 ? (
                <View style={styles.commentsLoader}>
                  <Text style={styles.commentsLoaderText}>{commentsError}</Text>
                  {onRetryComments ? (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={onRetryComments}
                      accessibilityRole="button">
                      <Text style={styles.retryButtonText}>
                        {t('comments.retry', {defaultValue: 'Retry'})}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                <FlatList
                  style={styles.flatList}
                  showsVerticalScrollIndicator={false}
                  data={commentsData}
                  keyExtractor={item => item.id.toString()}
                  ListEmptyComponent={<EmptyComponent text={'No Comments'} />}
                  renderItem={({item}) => renderComment(item)}
                  onScrollBeginDrag={closeCommentMenu}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  onEndReached={() => {
                    if (hasMoreComments && onLoadMoreComments) {
                      onLoadMoreComments();
                    }
                  }}
                  onEndReachedThreshold={0.4}
                  ListFooterComponent={
                    isLoadingMore ? (
                      <View style={styles.commentsFooterLoader}>
                        <ActivityIndicator
                          size="small"
                          color={colors.themeColor}
                        />
                      </View>
                    ) : null
                  }
                />
              )}
              {!isLoadingComments && !commentsError ? (
                <View
                  style={[
                    styles.inputConatiner,
                    {
                      paddingBottom:
                        keyboardOffset > 0 ? 10 : Math.max(insets.bottom, 12),
                    },
                  ]}>
                  {replyingTo ? (
                    <View style={styles.replyingHeader}>
                      <Text style={styles.inlineReplyLabel} numberOfLines={1}>
                        {t('comments.replyingTo', {
                          name: getDisplayName(replyingTo.user),
                        })}
                      </Text>
                      <TouchableOpacity
                        style={styles.cancelReplyButton}
                        onPress={() => {
                          Keyboard.dismiss();
                          setReplyingTo(null);
                          setReplyTag(null);
                          replyDraftRef.current = '';
                          replyInputRef.current?.clear();
                          setHasReplyText(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={t('cancel')}>
                        <X color="#65676B" size={18} />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  <View style={styles.tagSelectorRow}>
                    {COMMENT_TAGS.map(tag => {
                      const activeTag = replyingTo ? replyTag : selectedTag;
                      const isActive = activeTag === tag;
                      const tagColor = COMMENT_TAG_CONFIG[tag].color;
                      return (
                        <TouchableOpacity
                          key={tag}
                          testID={`${replyingTo ? 'reply' : 'comment'}-tag-${tag}`}
                          accessibilityRole="button"
                          accessibilityState={{selected: isActive}}
                          activeOpacity={0.7}
                          onPress={() =>
                            replyingTo ? setReplyTag(tag) : setSelectedTag(tag)
                          }
                          style={[
                            styles.tagPill,
                            isActive && {
                              backgroundColor: tagColor,
                              borderColor: tagColor,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.tagPillText,
                              isActive && styles.tagPillTextActive,
                            ]}>
                            {t(`comments.tags.${tag}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.inputRow}>
                    <View style={styles.inputCon}>
                      {replyingTo ? (
                        <TextInput
                          ref={replyInputRef}
                          testID={`reply-input-${replyingTo.id}`}
                          placeholder={t('writeComment')}
                          style={styles.input}
                          placeholderTextColor={colors.inputText}
                          onChangeText={syncReplyDraft}
                          onSubmitEditing={handleReplySendPress}
                          autoFocus
                        />
                      ) : (
                        <TextInput
                          ref={commentInputRef}
                          testID="comment-input"
                          placeholder={t('writeComment')}
                          style={styles.input}
                          placeholderTextColor={colors.inputText}
                          onChangeText={syncCommentDraft}
                          onEndEditing={e =>
                            syncCommentDraft(e.nativeEvent.text || '')
                          }
                          onSubmitEditing={handleCommentSubmit}
                        />
                      )}
                    </View>
                    <TouchableOpacity
                      testID={replyingTo ? `reply-send-${replyingTo.id}` : 'comment-send'}
                      style={[
                        styles.send,
                        !(replyingTo ? canSendReply : canSend) &&
                          styles.sendDisabled,
                      ]}
                      onPress={
                        replyingTo ? handleReplySendPress : handleSendPress
                      }
                      disabled={
                        replyingTo ? isSubmittingReply : isSubmittingComment
                      }>
                      <Send
                        color={
                          replyingTo
                            ? canSendReply
                              ? '#169BD5'
                              : '#B0B3B8'
                            : canSend
                              ? '#169BD5'
                              : '#B0B3B8'
                        }
                        size={20}
                        fill={
                          replyingTo
                            ? canSendReply
                              ? '#169BD5'
                              : '#B0B3B8'
                            : canSend
                              ? '#169BD5'
                              : '#B0B3B8'
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          </Animated.View>
        </View>
      </Modal>
      <Modal
        visible={isSubmittingComment || isSubmittingReply || isFetchingCommentLikes}
        transparent
        animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.loaderText}>
              {isSubmittingComment || isSubmittingReply
                ? 'Posting comment...'
                : 'Loading likes...'}
            </Text>
          </View>
        </View>
      </Modal>
      <LikesModal
        visible={commentLikesVisible.visible}
        closeModal={() => setCommentLikesVisible({visible: false, likes: []})}
        likes={commentLikesVisible.likes}
      />
      <GeneralModal
        visible={reportVisible.visibility}
        closeModal={() => setReportVisible({visibility: false, id: null})}
        icon={images.qmark}
        title={t('comments.reportConfirmTitle')}
        message={t('comments.reportConfirmMessage')}
        buttonText=""
        onPress={handleReportConfirm}
        primaryBtn={false}
        secondaryBtn
        SecondaryText1={t('comments.report')}
        SecondaryText2={t('close')}
        loading={reportLoading}
      />
      <GeneralModal
        visible={reportSuccess}
        closeModal={() => setReportSuccess(false)}
        icon={images.checkedIcon}
        title={t('comments.reportSuccess')}
        message=""
        buttonText={t('close')}
        onPress={() => setReportSuccess(false)}
        primaryBtn
      />
    </>
  );
};

export default CommentsModal;
