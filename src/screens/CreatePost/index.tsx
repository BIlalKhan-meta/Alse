// CreatePost.tsx
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useNavigation} from '@react-navigation/native';
import {ArrowRight, ChevronRight, MapPin, UserPlus} from 'lucide-react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GlobalHeader from '../../components/GlobalHeader';
import {useAppDispatch} from '../../hooks/storeHooks';
import useImagePicker from '../../hooks/useImagePicker';
import {postCreate} from '../../store/slices/homeSlice';
import {ensurePhotoPermission, getMessage, Toast} from '../../utils/helpers';
import {images} from '../../utils/images';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const CreatePost: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {imageData, chooseImageFromLibrary} = useImagePicker();

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

  useEffect(() => {
    loadRecentImages();
  }, []);

  // console.log('=-=-=-=>>', imageData);
  // console.log('=-=-=-=>>', selectedImage);

  useEffect(() => {
    if (imageData) {
      setSelectedImage({
        uri: imageData?.uri,
        name: imageData?.fileName,
        type: imageData?.type,
      });
    }
  }, [imageData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleNext = () => {
    if (!selectedImage) {
      Toast.error('Please select an image');
      return;
    }
    setStep('details');
  };

  const handlePost = async () => {
    if (!selectedImage) {
      Toast.error('Please select an image');
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

  const handleBack = () => {
    setSelectedImage(null);
    if (step === 'details') {
      setStep('select');
    } else {
      navigation.goBack();
    }
  };

  const renderRecentItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.recentImageContainer}
      onPress={() => setSelectedImage(item)}>
      <Image source={{uri: item.uri}} style={styles.recentImage} />
    </TouchableOpacity>
  );

  // Step 1: Image Selection
  const renderSelectStep = () => (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          {selectedImage ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{uri: selectedImage.uri}}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}>
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

        <View style={styles.recentsSection}>
          <View style={styles.recentsHeader}>
            <Text style={styles.recentsTitle}>Recents</Text>
          </View>

          <FlatList
            data={recentImages}
            renderItem={renderRecentItem}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.recentRow}
            contentContainerStyle={styles.recentsList}
          />
        </View>
      </ScrollView>

      {selectedImage && (
        <TouchableOpacity onPress={handleNext} style={styles.fabButton}>
          {!isLoading ? (
            <ArrowRight color="white" size={24} />
          ) : (
            <ActivityIndicator size={24} color={'white'} />
          )}
        </TouchableOpacity>
      )}
    </>
  );

  // Step 2: Add Details
  const renderDetailsStep = () => (
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
          <View style={styles.imageWrapper}>
            <Image
              source={{uri: selectedImage?.uri}}
              style={styles.selectedImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add a description..."
            placeholderTextColor="#999999"
            multiline
            value={description}
            onChangeText={setDescription}
            autoFocus
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={handlePost}
        style={[styles.fabButton, isLoading && styles.fabButtonDisabled]}
        disabled={isLoading}>
        <ArrowRight color="white" size={24} />
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );

  return (
    <View style={styles.container}>
      <GlobalHeader />
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
        }}>
        <Text style={{color: '#000000C7', fontWeight: 'bold', fontSize: 16}}>
          Upload a Post
        </Text>
        <TouchableOpacity onPress={handleBack}>
          <Text style={{color: '#000000C7', fontSize: 16}}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: '95%',
          backgroundColor: '#8E8E8EB0',
          height: 1,
          marginVertical: 10,
          alignSelf: 'center',
        }}
      />
      {step === 'select' ? renderSelectStep() : renderDetailsStep()}
    </View>
  );
};

export default CreatePost;
