import {
  Image,
  ImageSourcePropType,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {colors} from '../../utils/theme';

import styles from './styles';
import {BlurView} from '@react-native-community/blur';

import {useEffect, useState} from 'react';
import * as yup from 'yup';
import {Formik} from 'formik';
import {images} from '../../utils/images';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import RegularTextInput from '../TextInput/RegularTextInput';
import {commentPost, likeComment} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {capitalize} from '../../utils';
import {postComment} from '../../api/home';

interface Comment {
  id: number;
  userAvatar: string;
  userName: string;
  userImage: string;
  comment: string;
}

interface CommentsModalProps {
  visible: boolean;
  closeModal: () => void;
  icon: ImageSourcePropType;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
  comments: Comment[];
  postId: number;
}

const CommentsModal: React.FC<CommentsModalProps> = props => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);

  const {visible, closeModal, comments, postId} = props;
  const [newComment, setNewComment] = useState('');
  const [commentsData, setCommentsData] = useState(comments);
  const [likes, setLikes] = useState<object[]>();

  console.log('COMEENTTTTTTTTTTTTTTTTSSSSSSSS', comments);

  useEffect(() => {
    if (comments) {
      setCommentsData(comments);
      setLikes(
        comments.map(item => {
          return {id: item?.id, total_likes: item?.total_likes};
        }),
      );
    }
  }, [comments]);

  console.log('LIKESSSSSSSSSSSSSSSSSSSSS', postId);

  const handleCommentSubmit = async () => {
    if (newComment.length == 0) {
      return;
    }
    let form = new FormData();
    form.append('comment', newComment.trim());

    console.log(JSON.stringify(form, null, 4));

    const comment: Comment = {
      id: Date.now(), // Temporary ID until the backend responds
      avatar: user?.avatar, // Replace with actual user avatar
      full_name: user?.first_name, // Replace with actual user name
      comment: newComment.trim(),
      is_liked: false,
      total_likes: 0,
    };

    setCommentsData([...commentsData, comment]);
    setNewComment('');
    await postComment(form, postId)
      .then(res => console.log('RESSSSSSSSSSSSSS', res))
      .catch(err => console.log('ERROOOOOOOOOORRRRRRRRRRRR', err));

    // if (newComment.trim()) {
    //   // Create a new comment object
    //   const comment: Comment = {
    //     id: Date.now(), // Temporary ID until the backend responds
    //     avatar: user?.avatar, // Replace with actual user avatar
    //     fullname: user?.full_name, // Replace with actual user name
    //     comment: newComment,
    //   };

    //   // Update local comments immediately
    //   setCommentsData(prev => [comment, ...prev]);

    //   // Reset the input
    //   setNewComment('');
    //   const body = new FormData();
    //   body.append('comment', newComment);
    //   dispatch(commentPost({formData: body, id}))
    //     .unwrap()
    //     .then(res => {
    //       console.log('Reponse from post ==>', res);
    //       // setNewComment('');

    //       // setIsLoading(false);
    //       // Toast.success('Posted Successfully');
    //       // navigation.goBack();
    //     })
    //     .catch(err => {
    //       console.log(err, 'errorrrr fromm screen ');
    //       // setIsLoading(false);
    //       // Toast.error(getMessage(err?.message));
    //     });
    // }
  };

  const handleLikePress = (id: number) => {
    const arr = [...commentsData];
    let index = arr.findIndex(item => item?.id == id);
    if (arr[index].is_liked) {
      arr[index].total_likes = arr[index].total_likes - 1;
    } else {
      arr[index].total_likes = arr[index].total_likes + 1;
    }
    arr[index].is_liked = !arr[index].is_liked;
    setCommentsData(arr);
    dispatch(likeComment({id: postId, commentId: id}))
      .then(res => {
        // console.log('DATAAAAAAAAAAAAAAAAA', commentsData[0]?.is_liked);
        console.log('response from like post ---->', res);
      })
      .catch(err => {
        console.log('error from like post', err);
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
        <View style={styles.container}>
          <View style={styles.container}>
            {commentsData && commentsData?.length > 0 && (
              <>
                {commentsData.map((comment, index) => (
                  <View key={comment.id}>
                    <View style={styles.commentContainer}>
                      <View style={styles.avatarContainer}>
                        <Image
                          source={
                            comment?.avatar
                              ? {uri: comment?.avatar}
                              : images.user
                          }
                          style={styles.avatar}
                        />
                      </View>
                      <View style={styles.contentContainer}>
                        <InterMedium style={styles.userName}>
                          {comment.full_name ||
                            capitalize(commentsData[0]?.user?.first_name) +
                              ' ' +
                              capitalize(commentsData[0]?.user?.last_name)}
                        </InterMedium>
                        <InterRegular style={styles.comment}>
                          {comment.comment}
                        </InterRegular>
                      </View>
                      <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => handleLikePress(comment?.id)}>
                        <Image
                          source={
                            comment.is_liked ? images.likeFill : images.like
                          }
                          style={styles.likeIcon}
                          tintColor={colors.blue}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.postActions}>
                      <View style={styles.leftActions}>
                        <Image source={images.like} style={styles.icon} />
                        <InterRegular style={styles.actionText}>
                          {comment.total_likes}
                        </InterRegular>
                      </View>
                    </View>
                    <View style={styles.separator} />
                  </View>
                ))}
              </>
            )}
          </View>
          <View style={styles.inputConatiner}>
            <View style={styles.inputCon}>
              <TextInput
                placeholder="Write a comment "
                style={styles.input}
                placeholderTextColor={colors.inputText}
                value={newComment}
                onChangeText={setNewComment}
              />
            </View>
            <TouchableOpacity style={styles.send} onPress={handleCommentSubmit}>
              <Image source={images.send} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CommentsModal;
