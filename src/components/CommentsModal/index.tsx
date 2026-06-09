import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {colors} from '../../utils/theme';

import styles from './styles';
import {BlurView} from '@react-native-community/blur';

import {useEffect, useState} from 'react';
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
import {postComment} from '../../api/home';
import {getMessage, Toast} from '../../utils/helpers';
import {vh} from '../../constant';
import {EmptyComponent} from '../EmptyComponent';
import LikesModal from '../LikesModal';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {ThumbsUp, Heart, MessageCircle, Send} from 'lucide-react-native';

interface Comment {
  id: number;
  user: {};
  comment: string;
  is_liked: boolean;
  total_likes: number;
}

interface CommentsModalProps {
  visible: boolean;
  closeModal: () => void;
  icon: ImageSourcePropType;
  title: string;
  message: string;
  buttonText: string;
  comments: Comment[];
  postId: number;
}

const CommentsModal: React.FC<CommentsModalProps> = props => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);

  const {visible, closeModal, comments, postId} = props;
  const [newComment, setNewComment] = useState('');
  const [commentsData, setCommentsData] = useState(comments);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentLikesVisible, setCommentLikesVisible] = useState<{
    visible: boolean;
    likes: any[];
  }>({visible: false, likes: []});
  const [isFetchingCommentLikes, setIsFetchingCommentLikes] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (comments) {
      setCommentsData(comments);
    }
  }, [comments]);

  const handleCommentSubmit = async () => {
    if (newComment.length === 0) {
      return;
    }
    const commentText = newComment.trim();
    const form = new FormData();
    form.append('comment', commentText);

    const optimisticComment: Comment = {
      id: Date.now(),
      user: {
        avatar: user?.avatar,
        full_name: user?.full_name || user?.first_name + ' ' + user?.last_name,
      },
      comment: commentText,
      is_liked: false,
      total_likes: 0,
    };

    const previousComments = commentsData;
    setCommentsData([...commentsData, optimisticComment]);
    setNewComment('');
    setIsSubmittingComment(true);

    try {
      await postComment(form, postId);
    } catch (err: any) {
      setCommentsData(previousComments);
      const message =
        err?.message === 'Network Error'
          ? 'Please check your internet connection and try again.'
          : getMessage(err);
      Toast.error(message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikePress = (id: number) => {
    const arr = [...commentsData];
    let index = arr.findIndex(item => item?.id === id);
    if (arr[index].is_liked) {
      arr[index].total_likes = arr[index].total_likes - 1;
    } else {
      arr[index].total_likes = arr[index].total_likes + 1;
    }
    arr[index].is_liked = !arr[index].is_liked;
    setCommentsData(arr);
    dispatch(likeComment({id: postId, commentId: id}))
      .then(res => {
        console.log('response from like post ---->', res);
      })
      .catch(err => {
        console.log('error from like post', err);
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
    dispatch(getCommentLikesThunk({postId, commentId}))
      .unwrap()
      .then((res: any) => {
        const likes =
          res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
        setCommentLikesVisible({visible: true, likes});
      })
      .catch(err => {
        console.log('error fetching comment likes', err);
        Toast.error(getMessage(err?.message));
      })
      .finally(() => {
        setIsFetchingCommentLikes(false);
      });
  };

  return (
    <>
      <Modal
        visible={visible}
        onRequestClose={closeModal}
        animationType="slide"
        transparent>
        <BlurView
          style={styles.absolute}
          blurType="dark"
          blurAmount={1}
          reducedTransparencyFallbackColor="white"
        />
        <TouchableOpacity style={styles.blurcontainer} onPress={closeModal} />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? vh : vh * 0.2} // Adjust offset as needed
        >
          {/* <View style={styles.container}> */}
          <FlatList
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
            data={commentsData}
            keyExtractor={item => item?.id.toString()}
            ListEmptyComponent={<EmptyComponent text={'No Comments'} />}
            renderItem={({item, index}) => {
              const badges = [
                {text: 'Question', color: '#20B2AA'},
                {text: 'Experience', color: '#169BD5'},
                {text: 'Answer', color: '#4CD964'},
                {text: 'Answer', color: '#4CD964'},
              ];
              const badge = badges[index % badges.length];

              return (
                <View key={item.id} style={styles.commentItem}>
                  <View style={styles.commentContainer}>
                    <TouchableOpacity
                      disabled={user.id === item?.user?.id}
                      onPress={() =>
                        handleAccount(item?.user?.is_private, item?.user?.id)
                      }
                      style={styles.avatarContainer}>
                      <Image
                        source={
                          item?.user?.avatar
                            ? {uri: item?.user?.avatar}
                            : images.user
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
                            {item?.user?.full_name ||
                              capitalize(item?.user?.first_name) +
                                ' ' +
                                capitalize(item?.user?.last_name)}
                          </InterMedium>
                        </TouchableOpacity>
                        
                        <View style={styles.badgeRow}>
                          <View style={[styles.badge, {backgroundColor: badge.color}]}>
                            <Text style={styles.badgeText}>{badge.text}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.likeButton}
                            onPress={() => handleLikePress(item?.id)}>
                            <ThumbsUp color={item?.is_liked ? colors.blue : '#169BD5'} size={18} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <InterRegular style={styles.comment}>
                        {item?.comment}
                      </InterRegular>

                      <TouchableOpacity
                        style={styles.postActions}
                        onPress={() =>
                          handleCommentLikesPress(item?.id, item?.total_likes ?? 0)
                        }>
                        <View style={styles.leftActions}>
                          <Heart color="#FF3B30" size={14} fill="#FF3B30" />
                          <InterRegular style={styles.actionText}>
                            {item?.total_likes || 0}
                          </InterRegular>
                          
                          <MessageCircle color="#65676B" size={14} />
                          <InterRegular style={styles.actionText}>
                            {/* @ts-ignore */}
                            {item?.total_replies || 0}
                          </InterRegular>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.separator} />
                </View>
              );
            }}
          />
          <View style={styles.inputConatiner}>
            <View style={styles.inputCon}>
              <TextInput
                placeholder="Write a comment"
                style={styles.input}
                placeholderTextColor={colors.inputText}
                value={newComment}
                onChangeText={setNewComment}
              />
            </View>
            <TouchableOpacity
              style={styles.send}
              onPress={handleCommentSubmit}
              disabled={isSubmittingComment}>
              <Send color="#169BD5" size={20} fill="#169BD5" />
            </TouchableOpacity>
          </View>
          {/* </View> */}
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={isSubmittingComment || isFetchingCommentLikes}
        transparent
        animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.loaderText}>
              {isSubmittingComment ? 'Posting comment...' : 'Loading likes...'}
            </Text>
          </View>
        </View>
      </Modal>
      <LikesModal
        visible={commentLikesVisible.visible}
        closeModal={() =>
          setCommentLikesVisible({visible: false, likes: []})
        }
        likes={commentLikesVisible.likes}
      />
    </>
  );
};

export default CommentsModal;
