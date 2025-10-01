// CreatePost.tsx
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './styles';
import useImagePicker from '../../hooks/useImagePicker';
import {ensurePhotoPermission, getMessage, Toast} from '../../utils/helpers';
import {useAppDispatch} from '../../hooks/storeHooks';
import {postCreate} from '../../store/slices/homeSlice';
import GlobalHeader from '../../components/GlobalHeader';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {ArrowRight, ChevronRight, MapPin, UserPlus} from 'lucide-react-native';

const CreatePost: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {imageData, chooseImageFromLibrary} = useImagePicker();

  useEffect(() => {
    loadRecentImages();
  }, []);

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
        <View style={styles.mainImageContainer}>
          {selectedImage ? (
            <Image
              resizeMode="contain"
              source={{uri: selectedImage.uri}}
              style={styles.mainImage}
            />
          ) : (
            <TouchableOpacity
              style={styles.placeholderContainer}
              onPress={chooseImageFromLibrary}>
              <Text style={styles.placeholderText}>Tap to select image</Text>
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
          <ArrowRight color="white" size={24} />
        </TouchableOpacity>
      )}
    </>
  );

  // Step 2: Add Details
  const renderDetailsStep = () => (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.detailsContainer}>
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{uri: selectedImage.uri}}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <View style={styles.descriptionInputContainer}>
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

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <UserPlus color="#666666" size={20} />
                <Text style={styles.optionText}>Tag People</Text>
              </View>
              <ChevronRight color="#CCCCCC" size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <MapPin color="#666666" size={20} />
                <Text style={styles.optionText}>Add Location</Text>
              </View>
              <ChevronRight color="#CCCCCC" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handlePost}
        style={[styles.fabButton, isLoading && styles.fabButtonDisabled]}
        disabled={isLoading}>
        <ArrowRight color="white" size={24} />
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <GlobalHeader />
      {step === 'select' ? renderSelectStep() : renderDetailsStep()}
    </View>
  );
};

export default CreatePost;
