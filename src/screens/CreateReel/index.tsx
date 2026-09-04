// CreateReel.tsx
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ArrowRight, Video as VideoIcon} from 'lucide-react-native';
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
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import Video from 'react-native-video';
import GlobalHeader from '../../components/GlobalHeader';
import {useAppDispatch} from '../../hooks/storeHooks';
import {videoCreate} from '../../store/slices/videoSlice'; // You'll create this
import {ensurePhotoPermission, getMessage, Toast, prepareVideoUriForUpload, createVideoFile} from '../../utils/helpers';
import styles from './styles';
import * as imageStyles from '../CreatePost/styles';
import {timeHelper} from '../../utils';
import useImagePicker from '../../hooks/useImagePicker-story';
import {images} from '../../utils/images';
import moment from 'moment';
import {createVideo, getVideoCategories} from '../../api/reels';
import RNFS from 'react-native-fs';
import {compressVideoIfNeeded} from '../../utils/directMediaUpload';

const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024; // 100MB (matches backend)

const PRIVACY_OPTIONS = [
  {label: 'Public', value: 'public'},
  {label: 'Children', value: 'children'},
  {label: 'Adult', value: 'adult'},
];

const CreateReel: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const [privacy, setPrivacy] = useState<string>('public');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<{id: number; title: string}[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedMusicLabel, setSelectedMusicLabel] = useState<string | null>(
    null,
  );

  const {imageData, chooseImageFromLibrary} = useImagePicker();

  useEffect(() => {
    const music = route.params?.selectedMusic;
    if (music) {
      setSelectedMusicLabel(
        music.title || music.fileName || music.name || 'Selected track',
      );
      navigation.setParams({selectedMusic: undefined} as never);
    }
  }, [route.params?.selectedMusic, navigation]);

  // console.log('=-=-=', selectedVideo);
  // console.log('=-=-=', imageData);
  useEffect(() => {
    if (imageData) {
      setSelectedVideo({
        id: 1, // Unique ID
        uri: imageData.uri,
        thumbnail: imageData.uri,
        // duration: timeHelper(
        //   new Date((imageData.bitrate || 0) * 1000),
        // ).toString(),
        filename: imageData.fileName || 'video.mp4',
      });
    }
  }, [imageData]);

  useEffect(() => {
    loadRecentVideos();
  }, []);

  useEffect(() => {
    getVideoCategories()
      .then(res => {
        const list = res?.data?.data ?? res?.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          setCategories(list);
          setCategoryId(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const loadRecentVideos = async () => {
    try {
      const granted = await ensurePhotoPermission();
      if (!granted) {
        console.log('Permission denied');
        setRecentVideos([]);
        return;
      }

      const videos = await CameraRoll.getPhotos({
        first: 6,
        assetType: 'Videos',
      });

      setRecentVideos(
        (videos?.edges || [])
          .map((edge, index) => {
            const uri = edge?.node?.image?.uri;
            if (!uri) {
              return null;
            }
            return {
              id: `${edge.node.timestamp || index}_${index}`,
              uri,
              thumbnail: uri,
              filename: edge.node.image.filename || 'video.mp4',
            };
          })
          .filter(Boolean) as any[],
      );
    } catch (error) {
      console.log('Error loading videos:', error);
      setRecentVideos([]);
      Toast.error('Unable to load recent videos. You can still pick from library.');
    }
  };

  const handleNext = () => {
    if (!selectedVideo) {
      Toast.error('Please select a video');
      return;
    }
    setStep('details');
  };

  const handleUpload = async () => {
    if (!selectedVideo) {
      Toast.error('Please select a video');
      return;
    }

    if (!title.trim()) {
      Toast.error('Please enter a title');
      return;
    }

    if (!categoryId) {
      Toast.error('Please select a category');
      return;
    }

    setIsLoading(true);

    try {
      let uploadUri = await prepareVideoUriForUpload(selectedVideo.uri);
      uploadUri = await compressVideoIfNeeded(uploadUri);

      const path = uploadUri.replace(/^file:\/\//, '');
      const stat = await RNFS.stat(path).catch(() => null);
      if (stat?.size && Number(stat.size) > MAX_VIDEO_UPLOAD_BYTES) {
        Toast.error(
          'Video must be smaller than 100 MB. Please compress or trim the video before uploading.',
        );
        setIsLoading(false);
        return;
      }

      const videoFile = createVideoFile(
        uploadUri,
        selectedVideo.filename || 'video.mp4',
        'video/mp4',
      );

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category_id', categoryId.toString());
      formData.append('content', (content || title).trim());
      formData.append('privacy', privacy);
      formData.append('video_file', videoFile as any);

      const res = await createVideo(formData);
      console.log('=-=-=>>>', JSON.stringify(res));
      Toast.success('Video uploaded successfully');
      navigation.goBack();
    } catch (err: any) {
      console.log('=-=-= error: ', err);
      const status = err?.response?.status;
      const errorBody = err?.response?.data ?? err?.message ?? err;
      if (status === 413 || errorBody?.exception?.includes?.('PostTooLarge')) {
        Toast.error(
          'Video is too large for the server. Please use a shorter or more compressed clip (under 100 MB).',
        );
      } else {
        Toast.error(getMessage(errorBody));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedVideo(null);
    if (step === 'details') {
      setStep('select');
    } else {
      navigation.goBack();
    }
  };

  const [durations, setDurations] = useState<any>({});

  const handleLoad = (id: any, data: any) => {
    setDurations((prev: any) => ({
      ...prev,
      [id]: data.duration, // duration in seconds
    }));
  };

  const formatDuration = (seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoItem = ({item}: {item: any}) => {
    const id = item.id;
    const duration = durations[id] || 0;
    if (!item?.uri) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={() => setSelectedVideo(item)}>
        <Video
          source={{uri: item.uri}}
          style={styles.videoThumbnail}
          paused={true}
          resizeMode="cover"
          onLoad={data => handleLoad(id, data)}
          onError={() => {}}
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
        </View>
        {selectedVideo?.id === item.id && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkmark} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Step 1: Video Selection
  const renderSelectStep = () => (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mainVideoContainer}>
          {selectedVideo ? (
            <View style={styles.videoPreviewWrapper}>
              <Video
                source={{uri: selectedVideo.uri}}
                style={styles.mainVideo}
                resizeMode="contain"
                paused={false}
                repeat
                muted
              />
              <TouchableOpacity
                style={imageStyles.default.removeImageButton}
                onPress={() => setSelectedVideo(null)}>
                <Image
                  source={images.cross}
                  style={imageStyles.default.removeIcon}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.placeholderContainer}
              onPress={() => chooseImageFromLibrary('video')}>
              <VideoIcon size={48} color="#999999" />
              <Text style={styles.placeholderText}>
                Select a video to upload
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.recentsSection}>
          <View style={styles.recentsHeader}>
            <Text style={styles.recentsTitle}>Recent Videos</Text>
          </View>

          <FlatList
            data={recentVideos}
            renderItem={renderVideoItem}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.videosList}
          />
        </View>
      </ScrollView>

      {selectedVideo && (
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
          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Give your video a title"
              placeholderTextColor="#999999"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Tell viewers about your video"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={4}
              value={content}
              onChangeText={setContent}
            />
          </View>

          {/* Category Selection */}
          <View style={[styles.inputSection, {zIndex: 1000}]}>
            <Text style={styles.label}>Category *</Text>
            <DropDownTextInput
              items={categories.map(c => ({label: c.title, value: c.id.toString()}))}
              placeholder="Select a category"
              defaultValue={categoryId?.toString()}
              onChangeValue={v => setCategoryId(v ? parseInt(v, 10) : null)}
              style={styles.textInput}
            />
          </View>

          {/* Privacy Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Privacy *</Text>
            <View style={styles.privacyContainer}>
              {PRIVACY_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.privacyOption,
                    privacy === option.value && styles.privacyOptionSelected,
                  ]}
                  onPress={() => setPrivacy(option.value)}>
                  <View
                    style={[
                      styles.radioCircle,
                      privacy === option.value && styles.radioCircleSelected,
                    ]}>
                    {privacy === option.value && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <Text style={styles.privacyText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Music (optional)</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() =>
                navigation.navigate('MusicPicker' as never, {
                  imageUris: selectedVideo?.uri ? [selectedVideo.uri] : [],
                  existingMusic: undefined,
                  returnTo: 'CreateReel',
                } as never)
              }>
              <Text style={{color: selectedMusicLabel ? '#111' : '#999'}}>
                {selectedMusicLabel || 'Select music after your video'}
              </Text>
            </TouchableOpacity>
            {selectedMusicLabel ? (
              <TouchableOpacity onPress={() => setSelectedMusicLabel(null)}>
                <Text style={{color: '#1877F2', marginTop: 8}}>Remove music</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Video Preview */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Preview</Text>
            <View style={styles.previewVideoContainer}>
              <Video
                source={{uri: selectedVideo.uri}}
                style={styles.previewVideo}
                resizeMode="cover"
                paused={false}
                repeat
                muted
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleUpload}
        style={[styles.fabButton, isLoading && styles.fabButtonDisabled]}
        disabled={isLoading}>
        {!isLoading ? (
          <ArrowRight color="white" size={24} />
        ) : (
          <ActivityIndicator size={24} color={'white'} />
        )}
      </TouchableOpacity>
    </>
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
          Upload a Reel
        </Text>
        <TouchableOpacity onPress={handleBack}>
          <Text style={{color: '#000000C7', fontSize: 16}}>Cancel</Text>
        </TouchableOpacity>
      </View>
      {step === 'select' ? renderSelectStep() : renderDetailsStep()}
    </View>
  );
};

export default CreateReel;
