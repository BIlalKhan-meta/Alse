// Home.tsx
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import CardComponent from '../../components/CardComponent';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './styles';
import useImagePicker from '../../hooks/useImagePicker';
import {getMessage, Toast} from '../../utils/helpers';
import {useAppDispatch} from '../../hooks/storeHooks';
import {postCreate} from '../../store/slices/homeSlice';
import CustomButton from '../../components/CustomButton';

const ListOptions = [
  {label: 'Public', value: '2'},
  {label: 'Friends', value: '1'},
  {label: 'Only Me', value: '0'},
];
const CreatePost: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();

  const title = route?.params?.title || 'Create Post';
  const [bottomVisible, setbottomVisible] = useState<boolean>(true);
  const [privacy, setPrivacy] = useState(
    route?.params?.data?.privacy || ListOptions[0].value,
  );
  const [comment, setComment] = useState<string>(
    route?.params?.data?.content || '',
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {image, imageData, captureImage, chooseImageFromLibrary} =
    useImagePicker();
  const [media, setMedia] = useState<object | null>(null);

  useEffect(() => {
    if (imageData) {
      setMedia({
        uri: imageData?.uri,
        name: imageData?.fileName,
        type: imageData?.type,
      });
    }
  }, [imageData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerRight: () => (
        <CustomButton
          onPress={handlePost}
          loading={isLoading}
          style={styles.postButton}>
          Post
        </CustomButton>
      ),
    });
  }, [navigation, isLoading, comment, privacy, imageData,media]);

  const handlePost = async () => {
    // try {
    if (!comment || comment.trim() === '') {
      Toast.error('Please enter content');
      return;
    }

    const body = new FormData();
    body.append('description', comment);
    body.append('privacy', privacy);
    if (media) {
      body.append('file[0]', media);
    }
    console.log('body ==========>', body);

    setIsLoading(true);

    dispatch(postCreate(body))
      .unwrap()
      .then(res => {
        console.log('Reponse from post ==>', res);
        setIsLoading(false);
        Toast.success('Posted Successfully');
        navigation.goBack();
      })
      .catch(err => {
        setIsLoading(false);
        console.log(err, 'errorrrr fromm screen ');
        Toast.error(getMessage(err?.message));
      });
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <View>
        <CardComponent
          onImagePress={chooseImageFromLibrary}
          onVideoPress={() => captureImage('video')}
          onCameraPress={() => captureImage('photo')}
          value={comment}
          handleOnChangeText={setComment}
          ListOptions={ListOptions}
          privacy={privacy}
          setPrivacy={setPrivacy}
          removeMedia={() => setMedia(null)}
          image={media}
        />
        {/* <BottomModal
          visible={bottomVisible}
          closeModal={() => setbottomVisible(false)}
          // onPressCamera={() => captureImage('photo')}
          onPressImage={() => captureImage('photo')}
          onPress={() => captureImage('video')}
        /> */}
      </View>
    </ScrollView>
  );
};

export default CreatePost;
