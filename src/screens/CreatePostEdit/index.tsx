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


const ListOptions = [
  { label: 'Public', value: 'public' },
  { label: 'Friends', value: 'friends' },
  { label: 'Only Me', value: 'only_me' },
];
const CreatePostEdit: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const title = route?.params?.title || "Create Post";
  const [bottomVisible, setbottomVisible] = useState<boolean>(true)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState(
    route?.params?.data?.privacy || ListOptions[0].value,
  );
  const [comment, setComment] = useState<string>(
    route?.params?.data?.content || '',
  );
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const { image, captureImage, chooseImageFromLibrary } = useImagePicker();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerRight: () => (
        <TouchableOpacity style={styles.postButton} onPress={() => { }}>
          <InterMedium style={styles.postTxt}>{title == "Edit Post" ? "Edit" : "Post"}</InterMedium>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSelectMedia = (mediaUri: string) => {
    setSelectedMedia(mediaUri);
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
          ListOptions={ListOptions}
          privacy={privacy}
          setPrivacy={setPrivacy}

        />
        <BottomModal
          visible={bottomVisible}
          closeModal={() => setbottomVisible(false)}
          onPressCamera={() => captureImage('photo')}
          onPressImage={() => chooseImageFromLibrary()}
          onPress={() => captureImage('video')}


        />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
    </ScrollView>
  );
};



export default CreatePostEdit;
