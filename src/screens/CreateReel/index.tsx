// CreateReel.tsx
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useNavigation} from '@react-navigation/native';
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
import Video from 'react-native-video';
import GlobalHeader from '../../components/GlobalHeader';
import {useAppDispatch} from '../../hooks/storeHooks';
import {videoCreate} from '../../store/slices/videoSlice'; // You'll create this
import {ensurePhotoPermission, getMessage, Toast} from '../../utils/helpers';
import styles from './styles';
import * as imageStyles from '../CreatePost/styles';
import {timeHelper} from '../../utils';
import useImagePicker from '../../hooks/useImagePicker-story';
import {images} from '../../utils/images';
import moment from 'moment';
import {createVideo} from '../../api/reels';

const PRIVACY_OPTIONS = [
  {label: 'Public', value: 'public'},
  {label: 'Friends', value: 'friends'},
  {label: 'Private', value: 'private'},
];

const CreateReel: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const [privacy, setPrivacy] = useState<string>('public');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {imageData, chooseImageFromLibrary} = useImagePicker();

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const loadRecentVideos = async () => {
    const granted = await ensurePhotoPermission();
    if (!granted) {
      console.log('Permission denied');
      return;
    }

    try {
      const videos = await CameraRoll.getPhotos({
        first: 6,
        assetType: 'Videos',
      });
      // console.log('Videos loaded:', JSON.stringify(videos.edges));

      setRecentVideos(
        videos.edges.map((edge, index) => ({
          id: edge.node.timestamp + '_' + index, // Unique ID
          uri: edge.node.image.uri,
          thumbnail: edge.node.image.uri,
          // duration: '00000',
          // duration: timeHelper(
          //   moment(edge.node.timestamp || 0).format('YYYY-MM-DD HH:mm:ss'),
          // ).toString(),
          filename: edge.node.image.filename || 'video.mp4',
        })),
      );
    } catch (error) {
      console.log('Error loading videos:', error);
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

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category_id', 6); // Fixed category ID for reels
    formData.append('content', content);
    formData.append('privacy', privacy);
    formData.append('video_file', {
      uri: selectedVideo.uri,
      type: 'video/mp4',
      name: selectedVideo.filename || 'video.mp4',
    });

    setIsLoading(true);

    createVideo(formData)
      .then(res => {
        console.log('=-=-=>>>', JSON.stringify(res));
        setIsLoading(false);
        Toast.success('Video uploaded successfully');
        navigation.goBack();
      })
      .catch(err => {
        console.log('=-=-= error: ', err);
        setIsLoading(false);
        Toast.error(getMessage(err?.message));
      });

    // dispatch(videoCreate({formData, categoryId: 1}))
    //   .unwrap()
    //   .then(res => {
    //     setIsLoading(false);
    //     Toast.success('Video uploaded successfully');
    //     navigation.goBack();
    //   })
    //   .catch(err => {
    //     console.log('=-=-=', err);
    //     setIsLoading(false);
    //     Toast.error(getMessage(err?.message));
    //   });
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

    return (
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={() => setSelectedVideo(item)}>
        {/* Using Video component for thumbnail preview */}
        <Video
          source={{uri: item.uri}}
          style={styles.videoThumbnail}
          paused={true}
          resizeMode="cover"
          onLoad={data => handleLoad(id, data)}
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
          {/* <View style={styles.inputSection}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextSelected,
                    ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View> */}

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
