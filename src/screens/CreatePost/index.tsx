// Home.tsx
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Button, } from 'react-native';
import { images } from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderComponent from '../../components/HeaderComponent';
import styles from './styles';
import BottomModal from '../../components/BottomModel';
import ImagePickerComponent from '../../components/ImagePickerComponent';
import useImagePicker from '../../hooks/useImagePicker';
import InterMedium from '../../components/Text/InterMedium';
import { getMessage, Toast } from '../../utils/helpers';
import { useAppDispatch } from '../../hooks/storeHooks';
import { postCreate } from '../../store/slices/homeSlice';


const ListOptions = [
  { label: 'Public', value: '2' },
  { label: 'Friends', value: '1' },
  { label: 'Only Me', value: '0' },
];
const CreatePost: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();

  const title = route?.params?.title || "Create Post";
  const [bottomVisible, setbottomVisible] = useState<boolean>(true)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState(
    route?.params?.data?.privacy || ListOptions[0].value,
  );
  const [comment, setComment] = useState<string>(
    route?.params?.data?.content || '',
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const { image, imageData, captureImage, chooseImageFromLibrary } = useImagePicker();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerRight: () => (
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <InterMedium style={styles.postTxt}>{"Post"}</InterMedium>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isLoading, comment, privacy, imageData]);


  const handleSelectMedia = (mediaUri: string) => {
    setSelectedMedia(mediaUri);
  };


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
        console.log(err, "errorrrr fromm screen ")
        Toast.error(getMessage(err?.message));
      });

  };


  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
    >
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
          // onPressCamera={() => captureImage('photo')}
          onPressImage={() => captureImage('photo')}
          onPress={() => captureImage('video')}


        />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 10, }} />}
      </View>
    </ScrollView>
  );
};



export default CreatePost;
