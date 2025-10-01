// CreateReel.tsx
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './styles';
import {ensurePhotoPermission, getMessage, Toast} from '../../utils/helpers';
import {useAppDispatch} from '../../hooks/storeHooks';
import {videoCreate} from '../../store/slices/videoSlice'; // You'll create this
import GlobalHeader from '../../components/GlobalHeader';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  ArrowRight,
  ChevronRight,
  Video as VideoIcon,
} from 'lucide-react-native';
import Video from 'react-native-video';

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
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [privacy, setPrivacy] = useState<string>('public');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        first: 20,
        assetType: 'Videos',
      });
      console.log('Videos loaded:', videos.edges.length);

      setRecentVideos(
        videos.edges.map((edge, index) => ({
          id: edge.node.timestamp + '_' + index, // Unique ID
          uri: edge.node.image.uri,
          thumbnail: edge.node.image.uri,
          duration: edge.node.image.playableDuration || 0,
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
    formData.append('category_id', 1); // Fixed category ID for reels
    formData.append('content', content);
    formData.append('privacy', privacy);
    formData.append('video_file', {
      uri: selectedVideo.uri,
      type: 'video/mp4',
      name: selectedVideo.filename || 'video.mp4',
    });

    setIsLoading(true);

    dispatch(videoCreate({formData, categoryId: 1}))
      .unwrap()
      .then(res => {
        setIsLoading(false);
        Toast.success('Video uploaded successfully');
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.videoContainer}
      onPress={() => setSelectedVideo(item)}>
      {/* Using Video component for thumbnail preview */}
      <Video
        source={{uri: item.uri}}
        style={styles.videoThumbnail}
        paused={true}
        resizeMode="cover"
      />
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
      </View>
      {selectedVideo?.id === item.id && (
        <View style={styles.selectedOverlay}>
          <View style={styles.checkmark} />
        </View>
      )}
    </TouchableOpacity>
  );

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
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <VideoIcon size={48} color="#999999" />
              <Text style={styles.placeholderText}>
                Select a video to upload
              </Text>
            </View>
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
        <ArrowRight color="white" size={24} />
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <GlobalHeader showBack={step === 'details'} onBackPress={handleBack} />
      {step === 'select' ? renderSelectStep() : renderDetailsStep()}
    </View>
  );
};

export default CreateReel;
