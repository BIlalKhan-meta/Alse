// Home.tsx
import React, {useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Button,
} from 'react-native';
import {images} from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import {useNavigation, useRoute} from '@react-navigation/native';
import HeaderComponent from '../../components/HeaderComponent';
import styles from './styles';
import BottomModal from '../../components/BottomModel';
import ImagePickerComponent from '../../components/ImagePickerComponent';
import useImagePicker from '../../hooks/useImagePicker';
import InterMedium from '../../components/Text/InterMedium';
import {postEdit} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import {getMessage, Toast} from '../../utils/helpers';
import Loader from '../../components/Loader';

const ListOptions = [
  {label: 'Public', value: '2'},
  {label: 'Friends', value: '1'},
  {label: 'Only Me', value: '0'},
];
const CreatePostEdit: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const title = route?.params?.title || 'Create Post';
  const data = route?.params?.data || 'Create Post';
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bottomVisible, setbottomVisible] = useState<boolean>(true);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState(`${route?.params?.data?.privacy}`);
  const [comment, setComment] = useState<string>(
    route?.params?.data?.description || '',
  );
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const {image, imageData, captureImage, chooseImageFromLibrary} =
    useImagePicker();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerRight: () => (
        <TouchableOpacity
          disabled={isLoading}
          style={styles.postButton}
          onPress={handlePost}>
          <InterMedium style={styles.postTxt}>
            {title == 'Edit Post' ? 'Update' : 'Post'}
          </InterMedium>
        </TouchableOpacity>
      ),
    });
  }, [navigation, , isLoading, comment, privacy, imageData]);

  const handlePost = async () => {
    // try {
    if (!comment || comment.trim() === '') {
      Toast.error('Please enter content');
      return;
    }

    // if (image == null) {
    //   Toast.error('Please Upload image');
    //   return;
    // }
    // setIsLoading(true);

    const body = new FormData();
    body.append('description', comment);
    body.append('privacy', privacy);
    if (imageData) {
      await body.append('file[0]', {
        name: imageData?.fileName,
        uri: imageData?.uri,
        type: imageData?.type,
      });
    }
    console.log('body ==========>', body);

    setIsLoading(true);

    const id = route?.params?.data?.media[0]?.post_id;
    dispatch(postEdit({formData: body, id}))
      .unwrap()
      .then(res => {
        console.log('Reponse from postEdit ==>', res);
        setIsLoading(false);
        Toast.success('Posted Edit Successfully');
        navigation.goBack();
      })
      .catch(err => {
        setIsLoading(false);
        console.log('Reponse from postEdit ==>', err);

        Toast.error(getMessage(err?.message));
      });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <CardComponent
          onImagePress={() => setbottomVisible(true)}
          onVideoPress={() => setbottomVisible(true)}
          onCameraPress={() => setbottomVisible(true)}
          value={comment}
          handleOnChangeText={setComment}
          ListOptions={ListOptions}
          privacy={privacy}
          setPrivacy={setPrivacy}
        />
        <BottomModal
          visible={bottomVisible}
          closeModal={() => setbottomVisible(false)}
          onPressImage={() => captureImage('photo')}
          onPressGallery={() => chooseImageFromLibrary()}
          onPress={() => captureImage('video')}
        />
        {(image || route?.params?.data?.media[0]?.path) && (
          <Image
            source={{uri: image ? image : route?.params?.data?.media[0]?.path}}
            style={styles.imageStyle}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default CreatePostEdit;
