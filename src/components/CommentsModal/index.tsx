import { Image, ImageSourcePropType, Modal, StyleProp, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { colors } from '../../utils/theme';



import styles from './styles';
import { BlurView } from '@react-native-community/blur';

import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { images } from '../../utils/images';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import RegularTextInput from '../TextInput/RegularTextInput';
import { commentPost, likeComment } from '../../store/slices/homeSlice';
import { useAppDispatch } from '../../hooks/storeHooks';
import { selectUserProfile } from '../../store/slices/authSlice';
import { useSelector } from 'react-redux';


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
  postId: number
}




const CommentsModal: React.FC<CommentsModalProps> = props => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);

  const { visible, closeModal, icon, title, message, buttonText, onPress, comments, postId } = props;
  const [newComment, setNewComment] = useState('');
  const [commentsData, setCommentsData] = useState(comments);

  useEffect(() => {
    setCommentsData(comments)
  }, [comments])

  const handleCommentSubmit = async () => {


    const id = postId;
    if (newComment.trim()) {
      // Create a new comment object
      const comment: Comment = {
        id: Date.now(), // Temporary ID until the backend responds
        avatar: user?.avatar, // Replace with actual user avatar
        fullname: user?.full_name, // Replace with actual user name
        comment: newComment,
      };

      // Update local comments immediately
      setCommentsData(prev => [comment, ...prev]);

      // Reset the input
      setNewComment('');
      const body = new FormData();
      body.append('comment', newComment);
      dispatch(commentPost({ formData: body, id }))
        .unwrap()
        .then(res => {
          console.log('Reponse from post ==>', res);
          // setNewComment('');

          // setIsLoading(false);
          // Toast.success('Posted Successfully');
          // navigation.goBack();
        })
        .catch(err => {
          console.log(err, "errorrrr fromm screen ")
          // setIsLoading(false);
          // Toast.error(getMessage(err?.message));
        });
    }
  };




  console.log('====================================');
  console.log(comments, "commentsssssssss");
  console.log('====================================');


  const handleLikePress = (id: number) => {
    dispatch(likeComment({ id: postId, commentId: id }))
      .then(res => {
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
        animationType='slide'
        transparent>
        <BlurView
          style={styles.absolute}
          blurType="dark"
          blurAmount={1}
          reducedTransparencyFallbackColor="white"
        />
        <TouchableOpacity
          style={styles.blurcontainer}
          onPress={closeModal} />
        <View style={styles.container}>
          <View style={styles.container}>
            {commentsData && commentsData?.length > 0 && (
              <>
                {commentsData.map((comment) => (
                  <View key={comment.id} >
                    <View style={styles.commentContainer}>
                      <View style={styles.avatarContainer}>
                        <Image source={comment?.avatar ? { uri: comment?.avatar } : images.user} style={styles.avatar} />
                      </View>
                      <View style={styles.contentContainer}>
                        <InterMedium style={styles.userName}>{comment?.fullname}</InterMedium>
                        <InterRegular style={styles.comment}>{comment.comment}</InterRegular>
                      </View>
                      <TouchableOpacity style={styles.likeButton} onPress={() => handleLikePress(comment?.id)}>
                        <Image source={images.like} style={styles.likeIcon} tintColor={colors.blue} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.postActions}>
                      <View style={styles.leftActions}>
                        <Image
                          source={images.heartIcon}
                          style={styles.icon}
                        />
                        <InterRegular style={styles.actionText}>{comment?.likes?.length}</InterRegular>
                        <Image
                          source={images.comment}
                          style={styles.icon}
                        />
                        <InterRegular style={styles.actionText}>{comments.length} </InterRegular>
                        {/* <Image
                      source={images.share}
                      style={styles.icon}
                    /> */}
                        {/* <InterRegular style={styles.actionText}>{share}</InterRegular> */}
                      </View>
                      {/* <TouchableOpacity>
          <Image
            source={images.save}
            style={styles.icon}
          />
        </TouchableOpacity> */}
                    </View>
                    <View style={styles.separator} />
                  </View>
                ))}
              </>
            )}

          </View>
          <View style={styles.inputConatiner}>
            <View style={styles.inputCon}>

              <TextInput placeholder='Write a comment ' style={styles.input}
                placeholderTextColor={colors.inputText}
                value={newComment}
                onChangeText={setNewComment}
              />
            </View>
            <TouchableOpacity style={styles.send}
              onPress={handleCommentSubmit}
            >
              <Image
                source={images.send}
                style={styles.icon}
              />
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </>
  );
};


export default CommentsModal;