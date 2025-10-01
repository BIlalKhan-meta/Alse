// CreatePost.tsx
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './styles';
import useImagePicker from '../../hooks/useImagePicker';
import {ensurePhotoPermission, getMessage, Toast} from '../../utils/helpers';
import {useAppDispatch} from '../../hooks/storeHooks';
import {postCreate} from '../../store/slices/homeSlice';
import CustomButton from '../../components/CustomButton';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const CreatePost: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();

  const title = (route?.params as any)?.title || 'Create Post';
  const [privacy, setPrivacy] = useState(
    (route?.params as any)?.data?.privacy || ListOptions[0].value,
  );
  const [comment, setComment] = useState<string>(
    (route?.params as any)?.data?.content || '',
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {image, imageData, captureImage, chooseImageFromLibrary} =
    useImagePicker();
  const [media, setMedia] = useState<any>(null);

  useEffect(() => {
    if (imageData) {
      setMedia({
        uri: (imageData as any)?.uri,
        name: (imageData as any)?.fileName,
        type: (imageData as any)?.type,
      });
    }
  }, [imageData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const loadRecentImages = async () => {
    const granted = await ensurePhotoPermission();
    if (!granted) {
      console.log('Permission denied');
      return;
    }

    const photos = await CameraRoll.getPhotos({first: 4, assetType: 'Photos'});
    setRecentImages(
      photos.edges.map(edge => ({
        id: edge.node.image.uri,
        uri: edge.node.image.uri,
      })),
    );
  };

  const handleNext = () => {
    if (!selectedImage) {
      Toast.error('Please select an image');
      return;
    }
    setStep('details');
  };

  const handlePost = async () => {
    if (!comment || comment.trim() === '') {
      Toast.error('Please enter content');
      return;
    }

    const body = new FormData();
    body.append('description', description);
    body.append('privacy', 2);
    body.append('file[0]', selectedImage);

    setIsLoading(true);

    dispatch(postCreate(body))
      .unwrap()
      .then(res => {
        setIsLoading(false);
        Toast.success('Posted Successfully');
        navigation.goBack();
      })
      .catch(err => {
        setIsLoading(false);
        Toast.error(getMessage(err?.message));
      });
  };

  return (
    <KeyboardAwareScrollView
      style={styles.scrollContainer}
      enableOnAndroid={true}
      extraScrollHeight={20}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          {media ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{uri: media?.uri}}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setMedia(null)}>
                <Image source={images.cross} style={styles.removeIcon} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={chooseImageFromLibrary}>
              <Image
                source={images.media}
                style={styles.addImageIcon}
                resizeMode="contain"
              />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add a description..."
            placeholderTextColor="#999999"
            multiline
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default CreatePost;
