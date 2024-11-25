// Home.tsx
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Button,
} from 'react-native';
import CardComponent from '../../components/CardComponent';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './styles';
import BottomModal from '../../components/BottomModel';
import useImagePicker from '../../hooks/useImagePicker';
import InterMedium from '../../components/Text/InterMedium';
import {postEdit, updatePost} from '../../store/slices/homeSlice';
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
  const [media, setMedia] = useState<string | null>(
    route?.params?.data?.media[0]?.path,
  );
  const [privacy, setPrivacy] = useState(`${route?.params?.data?.privacy}`);
  const [comment, setComment] = useState<string>(
    route?.params?.data?.description || '',
  );
  const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();

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

  useEffect(() => {
    if (imageData) {
      setMedia(imageData);
    }
  }, [imageData]);

  console.log('ITEMMMMMMMMMMMMMMMM', data);

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

    dispatch(
      updatePost({
        ...data,
        description: comment,
        privacy: privacy,
        ...( imageData ? {media: [{path: imageData?.uri, type: imageData?.type?.split('/')[0]}]} : {}),
      }),
    );
    // navigation.goBack();

    const id = data?.id;
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
          onImagePress={chooseImageFromLibrary}
          onVideoPress={() => captureImage('video')}
          onCameraPress={() => captureImage('photo')}
          value={comment}
          handleOnChangeText={setComment}
          ListOptions={ListOptions}
          privacy={privacy}
          image={media}
          removeMedia={() => setMedia(null)}
          setPrivacy={setPrivacy}
        />
        {/* <BottomModal
          visible={bottomVisible}
          closeModal={() => setbottomVisible(false)}
          onPressImage={() => captureImage('photo')}
          onPressGallery={() => chooseImageFromLibrary()}
          onPress={() => captureImage('video')}
        /> */}
        {/* {(image || route?.params?.data?.media[0]?.path) && (
          <Image
            source={{uri: image ? image : route?.params?.data?.media[0]?.path}}
            style={styles.imageStyle}
          />
        )} */}
      </View>
    </ScrollView>
  );
};

export default CreatePostEdit;
