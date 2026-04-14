// CreatePost.tsx
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ArrowRight, Video as VideoIcon} from 'lucide-react-native';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import GlobalHeader from '../../components/GlobalHeader';
import {useAppDispatch} from '../../hooks/storeHooks';
import useImagePicker from '../../hooks/useImagePicker';
import {postCreate} from '../../store/slices/homeSlice';
import {createVideoFile, ensurePhotoPermission, getMessage, Toast} from '../../utils/helpers';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

type MediaKind = 'image' | 'video';

type SelectedMedia = {
  uri: string;
  name?: string;
  type?: string;
  kind: MediaKind;
};

type RecentItem = {
  id: string;
  uri: string;
  kind: MediaKind;
  name?: string;
  type?: string;
};

const CreatePost: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialMediaType = (route.params as {mediaType?: 'photo' | 'video'} | undefined)
    ?.mediaType;
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {imageData, chooseImageFromLibrary} = useImagePicker();
  const openedInitialPicker = useRef(false);

  const loadRecentMedia = async () => {
    const granted = await ensurePhotoPermission();
    if (!granted) {
      console.log('Permission denied');
      return;
    }

    try {
      const [photos, videos] = await Promise.all([
        CameraRoll.getPhotos({first: 4, assetType: 'Photos'}),
        CameraRoll.getPhotos({first: 4, assetType: 'Videos'}),
      ]);

      const photoItems: RecentItem[] = photos.edges.map((edge, i) => ({
        id: `p-${i}-${edge.node.image.uri}`,
        uri: edge.node.image.uri,
        kind: 'image',
      }));

      const videoItems: RecentItem[] = videos.edges.map((edge, i) => ({
        id: `v-${i}-${edge.node.image.uri}`,
        uri: edge.node.image.uri,
        kind: 'video',
        name: edge.node.image.filename || 'video.mp4',
        type: 'video/mp4',
      }));

      setRecentItems([...photoItems, ...videoItems]);
    } catch (e) {
      console.log('Error loading recents:', e);
    }
  };

  useEffect(() => {
    loadRecentMedia();
  }, []);

  useEffect(() => {
    if (!initialMediaType || openedInitialPicker.current) {
      return;
    }
    openedInitialPicker.current = true;
    if (initialMediaType === 'video') {
      chooseImageFromLibrary('video');
    } else if (initialMediaType === 'photo') {
      chooseImageFromLibrary('photo');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chooseImageFromLibrary identity changes each render
  }, [initialMediaType]);

  useEffect(() => {
    if (!imageData?.uri) {
      return;
    }
    const assetType = imageData.type ?? '';
    const kind: MediaKind =
      assetType.startsWith('video') || imageData.duration != null
        ? 'video'
        : 'image';
    setSelectedMedia({
      uri: imageData.uri,
      name: imageData.fileName,
      type: imageData.type,
      kind,
    });
  }, [imageData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const appendMediaToForm = (body: FormData, media: SelectedMedia) => {
    if (media.kind === 'video') {
      const file = createVideoFile(media.uri);
      body.append('file[0]', file as any);
      return;
    }
    body.append('file[0]', {
      uri: media.uri,
      name: media.name || 'image.jpg',
      type: media.type || 'image/jpeg',
    } as any);
  };

  const handleNext = () => {
    setStep('details');
  };

  const handlePost = async () => {
    const body = new FormData();
    const text = description.trim();
    body.append('content', text);
    body.append('description', text);
    body.append('privacy', '2');

    if (selectedMedia?.uri) {
      appendMediaToForm(body, selectedMedia);
    }

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
        const message =
          err?.message === 'Network Error'
            ? 'Please check your internet connection and try again.'
            : getMessage(err);
        Toast.error(message);
      });
  };

  const handleBack = () => {
    setSelectedMedia(null);
    if (step === 'details') {
      setStep('select');
    } else {
      navigation.goBack();
    }
  };

  const renderSelectedPreview = (opts: {showRemove: boolean; videoPaused: boolean}) => {
    if (!selectedMedia?.uri) {
      return null;
    }
    const {showRemove, videoPaused} = opts;
    return (
      <View style={styles.imageWrapper}>
        {selectedMedia.kind === 'video' ? (
          <Video
            source={{uri: selectedMedia.uri}}
            style={styles.selectedImage}
            resizeMode="cover"
            repeat
            muted
            paused={videoPaused}
          />
        ) : (
          <Image
            source={{uri: selectedMedia.uri}}
            style={styles.selectedImage}
            resizeMode="cover"
          />
        )}
        {showRemove && (
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setSelectedMedia(null)}>
            <Image source={images.cross} style={styles.removeIcon} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRecentItem = ({item}: {item: RecentItem}) => (
    <TouchableOpacity
      style={styles.recentImageContainer}
      onPress={() =>
        setSelectedMedia({
          uri: item.uri,
          kind: item.kind,
          name: item.name,
          type: item.type,
        })
      }>
      {item.kind === 'video' ? (
        <Video
          source={{uri: item.uri}}
          style={styles.recentVideoThumb}
          resizeMode="cover"
          paused
          muted
        />
      ) : (
        <Image source={{uri: item.uri}} style={styles.recentImage} />
      )}
    </TouchableOpacity>
  );

  // Step 1: Media selection
  const renderSelectStep = () => (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          {selectedMedia ? (
            renderSelectedPreview({showRemove: true, videoPaused: false})
          ) : (
            <View style={styles.mediaPickRow}>
              <TouchableOpacity
                style={styles.mediaPickHalf}
                onPress={() => chooseImageFromLibrary('photo')}>
                <Image
                  source={images.media}
                  style={styles.addImageIcon}
                  resizeMode="contain"
                />
                <Text style={styles.mediaPickLabel}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaPickHalf}
                onPress={() => chooseImageFromLibrary('video')}>
                <VideoIcon size={50} color="#CCCCCC" />
                <Text style={styles.mediaPickLabel}>Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.recentsSection}>
          <View style={styles.recentsHeader}>
            <Text style={styles.recentsTitle}>Recents</Text>
          </View>

          <FlatList
            data={recentItems}
            renderItem={renderRecentItem}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.recentRow}
            contentContainerStyle={styles.recentsList}
          />
        </View>
      </ScrollView>

      <TouchableOpacity onPress={handleNext} style={styles.fabButton}>
        {!isLoading ? (
          <ArrowRight color="white" size={24} />
        ) : (
          <ActivityIndicator size={24} color={'white'} />
        )}
      </TouchableOpacity>
    </>
  );

  // Step 2: Add details
  const renderDetailsStep = () => (
    <KeyboardAwareScrollView
      style={styles.scrollContainer}
      enableOnAndroid={true}
      extraScrollHeight={20}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {selectedMedia?.uri && (
          <View style={styles.imageSection}>
            {renderSelectedPreview({showRemove: false, videoPaused: true})}
          </View>
        )}

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
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.loaderText}>Creating post...</Text>
          </View>
        </View>
      </Modal>
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
