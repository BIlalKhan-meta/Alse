import { Image, ImageSourcePropType, Modal, StyleProp, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { colors } from '../../utils/theme';



import styles from './styles';
import { BlurView } from '@react-native-community/blur';

import { useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { images } from '../../utils/images';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import RegularTextInput from '../TextInput/RegularTextInput';


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
}




const CommentsModal: React.FC<CommentsModalProps> = props => {
  const { visible, closeModal, icon, title, message, buttonText, onPress, comments } = props;

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
            {comments.map((comment) => (
              <View key={comment.id} >
                <View style={styles.commentContainer}>
                  <View style={styles.avatarContainer}>
                    <Image source={images.user} style={styles.avatar} />
                  </View>
                  <View style={styles.contentContainer}>
                    <InterMedium style={styles.userName}>{comment.userName}</InterMedium>
                    <InterRegular style={styles.comment}>{comment.comment}</InterRegular>
                  </View>
                  <TouchableOpacity style={styles.likeButton}>
                    <Image source={images.like} style={styles.likeIcon} tintColor={colors.blue} />
                  </TouchableOpacity>
                </View>

                <View style={styles.postActions}>
                  <View style={styles.leftActions}>
                    <Image
                      source={images.heartIcon}
                      style={styles.icon}
                    />
                    <InterRegular style={styles.actionText}>{"44K"}</InterRegular>
                    <Image
                      source={images.comment}
                      style={styles.icon}
                    />
                    <InterRegular style={styles.actionText}>{"22"} </InterRegular>
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
          </View>
          <View style={styles.inputConatiner}>
            <View style={styles.inputCon}>

              <TextInput placeholder='Write a comment ' style={styles.input}
                placeholderTextColor={colors.inputText}
              />
            </View>
            <View style={styles.send}>
              <Image
                source={images.send}
                style={styles.icon}
              />
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
};


export default CommentsModal;