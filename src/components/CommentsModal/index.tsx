import {
  FlatList,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import {vh, vw} from '../../constant';
import {EmptyComponent} from '../EmptyComponent';

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

  useEffect(() => {
    if (comments) {
      setCommentsData(comments);
    }
  }, [comments]);

  const handleCommentSubmit = async () => {
    if (newComment.length == 0) {
      return;
    }
    let form = new FormData();
    form.append('comment', newComment.trim());

    console.log(JSON.stringify(form, null, 4));

    const comment: Comment = {
      id: Date.now(),
      user: {
        avatar: user?.avatar,
        full_name: user?.full_name || user?.first_name + ' ' + user?.last_name,
      },
      comment: newComment.trim(),
      is_liked: false,
      total_likes: 0,
    };

    setCommentsData([...commentsData, comment]);
    setNewComment('');
    await postComment(form, postId)
      .then(res => console.log('RESSSSSSSSSSSSSS', res))
      .catch(err => console.log('ERROOOOOOOOOORRRRRRRRRRRR', err));
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
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? vh : vh * 0.2} // Adjust offset as needed
        >
        {/* <View style={styles.container}> */}
          <FlatList
            style={{flex: 1, width: '90%'}}
            showsVerticalScrollIndicator={false}
            data={commentsData}
            keyExtractor={item => item?.id.toString()}
            ListEmptyComponent={() => <EmptyComponent text={'No Comments'} />}
            renderItem={({item}) => {
              return (
                <View key={item.id} style={{width: vw * 85}}>
                  <View style={styles.commentContainer}>
                    <View style={styles.avatarContainer}>
                      <Image
                        source={
                          item?.user?.avatar
                            ? {uri: item?.user?.avatar}
                            : images.user
                        }
                        style={styles.avatar}
                      />
                    </View>
                    <View style={styles.contentContainer}>
                      <InterMedium style={styles.userName}>
                        {item?.user?.full_name ||
                          capitalize(item?.user?.first_name) +
                            ' ' +
                            capitalize(item?.user?.last_name)}
                      </InterMedium>
                      <InterRegular style={styles.comment}>
                        {item?.comment}
                      </InterRegular>
                    </View>
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => handleLikePress(item?.id)}>
                      <Image
                        source={item?.is_liked ? images.likeFill : images.like}
                        style={styles.likeIcon}
                        tintColor={colors.blue}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.postActions}>
                    <View style={styles.leftActions}>
                      <Image source={images.like} style={styles.icon} />
                      <InterRegular style={styles.actionText}>
                        {item?.total_likes}
                      </InterRegular>
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
        {/* </View> */}
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default CommentsModal;
