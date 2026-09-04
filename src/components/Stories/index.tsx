import React, {useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  View,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import InstagramStories, {
  InstagramStoriesProps,
} from '@birdwingo/react-native-instagram-stories';
import {images} from '../../utils/images';
import {getAbsoluteAvatarUrl} from '../../utils/helpers';
import {
  AddStory,
  GetStories,
  DeleteStory,
  TrackStoryAnalytics,
  StoryAnalyticsEvent,
} from '../../api/stories';
import store from '../../store';
import * as DropdownMenu from 'zeego/dropdown-menu';
import Toast from 'react-native-toast-message';
import useImagePicker from '../../hooks/useImagePicker-story';
import {isAxiosError} from 'axios';
import Loader from '../Loader';
import {GradientBorderView} from '@good-react-native/gradient-border';
import Video from 'react-native-video';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Trash2} from 'lucide-react-native';

// Constants
const MAX_RETRY_COUNT = 3;
const MAX_STORY_VIDEO_DURATION = 30; // seconds
const STORY_IMAGE_DURATION_MS = 10000;
const STORY_COMPLETION_THRESHOLD = 0.85;
const STORY_AVATAR_OUTER_SIZE = 58;
const STORY_LIBRARY_AVATAR_SIZE = 52;
const STORY_AVATAR_SLOT_WIDTH = 78;

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v', '.avi', '.3gp'];

const getStoryMediaType = (story: any): 'image' | 'video' => {
  const type = story?.media_type || story?.type;
  if (type === 'video' || type === 'image') {
    return type;
  }
  const url = (story?.media_url || '').toLowerCase();
  return VIDEO_EXTENSIONS.some(ext => url.includes(ext)) ? 'video' : 'image';
};

export interface StoriesRef {
  refresh: () => Promise<void>;
}

const Stories = forwardRef<StoriesRef>((_, ref) => {
  // State management
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [stories, setStories] = useState<InstagramStoriesProps['stories']>([]);
  const {
    imageData,
    captureImage,
    chooseImageFromLibrary,
    previewMode,
    pendingMedia,
    confirmMedia,
    cancelMedia,
  } = useImagePicker();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const retryCountRef = useRef<number>(0);
  const storyMetadataRef = useRef<
    Record<
      string,
      {
        expectedDurationMs: number;
        hasExplicitDuration: boolean;
        mediaType: 'image' | 'video';
      }
    >
  >({});
  const activeStoryRef = useRef<{
    userId?: string;
    storyId: string;
    startedAt: number;
    completed: boolean;
  } | null>(null);

  // Add current user info (ref ensures renderAvatar always reads latest avatar after profile update)
  const currentUser = useSelector(selectUserProfile);
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const {t} = useTranslation();

  const getStoryExpiration = (story: any) => story?.expires_at ?? story?.expiresAt;

  const isStoryExpired = (story: any) => {
    const expiresAt = getStoryExpiration(story);
    if (!expiresAt) {
      return false;
    }

    const expiryTime = new Date(expiresAt).getTime();
    return Number.isFinite(expiryTime) && expiryTime <= Date.now();
  };

  const getStoryDurationMetadata = (story: any) => {
    const rawDuration =
      story?.duration_ms ?? story?.durationMs ?? story?.duration;
    const duration = Number(rawDuration);
    const hasExplicitDuration = Number.isFinite(duration) && duration > 0;
    const mediaType = getStoryMediaType(story);

    if (hasExplicitDuration) {
      return {
        expectedDurationMs: duration > 1000 ? duration : duration * 1000,
        hasExplicitDuration,
        mediaType,
      };
    }

    return {
      expectedDurationMs:
        mediaType === 'video'
          ? MAX_STORY_VIDEO_DURATION * 1000
          : STORY_IMAGE_DURATION_MS,
      hasExplicitDuration,
      mediaType,
    };
  };

  const sendStoryAnalytics = useCallback(
    (storyId: string | number | undefined, event: StoryAnalyticsEvent) => {
      if (!storyId) {
        return;
      }

      TrackStoryAnalytics(storyId, event).catch(error => {
        console.warn('Story analytics failed:', error);
      });
    },
    [],
  );

  const markActiveStorySkipped = useCallback(
    (storyId?: string) => {
      const activeStory = activeStoryRef.current;
      if (
        !activeStory ||
        activeStory.completed ||
        (storyId && activeStory.storyId !== storyId)
      ) {
        return;
      }

      activeStory.completed = true;
      sendStoryAnalytics(activeStory.storyId, 'skipped');
    },
    [sendStoryAnalytics],
  );

  // Fetch stories with ability to control loading indicator
  const getStories = useCallback(async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Get stories first before clearing state
      const {data} = await GetStories();

      if (data?.data?.stories) {
        // Only reset and update stories after we have the new data
        const {stories} = data.data;
        // console.log('---->>>>>', JSON.stringify(stories));
        const formattedStories = formatStories(stories);

        // Now reset and update with the new data
        resetStories();
        setStories(prevStories => [...prevStories, ...formattedStories]);
      } else {
        // If no stories returned, just reset
        resetStories();
      }

      // Reset retry count on success
      retryCountRef.current = 0;
    } catch (err) {
      console.log('ERROR:: STORIES', err);
      retryCountRef.current += 1;

      // Show error toast on excessive retries
      if (retryCountRef.current >= MAX_RETRY_COUNT) {
        Toast.show({
          type: 'error',
          text1: t('toast.storyRefreshFailed'),
          text2: t('checkInternet'),
        });
      }
    } finally {
      if (showLoadingIndicator) {
        setIsInitialLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Combined data fetching function
  const fetchData = useCallback(
    async (showLoadingIndicator = true) => {
      try {
        await getStories(showLoadingIndicator);
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    },
    [getStories],
  );

  // Expose refresh to parent (e.g. for pull-to-refresh)
  useImperativeHandle(ref, () => ({
    refresh: () => fetchData(false),
  }), [fetchData]);

  // Initial data fetch only (no polling)
  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = async (file: any, attempt = 1) => {
    setIsUploading(true);
    setUploadProgress(0);
    Toast.show({
      type: 'info',
      text1: t('toast.uploadingStory'),
      text2: t('loadingText'),
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = store.getState().auth.token;
      if (!token) {
        throw new Error('Not authenticated');
      }
      await AddStory(formData, setUploadProgress);

      Toast.show({
        type: 'success',
        text1: t('toast.storyUploadSuccess'),
      });

      await getStories(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      const isNetworkError =
        err?.code === 'ECONNABORTED' ||
        err?.message === 'Network request timeout' ||
        err?.message === 'Network request failed' ||
        (isAxiosError(err) && err?.message === 'Network Error');

      if (attempt < 2 && isNetworkError) {
        await new Promise(r => setTimeout(r, 600));
        return uploadFile(file, attempt + 1);
      }

      const serverMessage = err?.response?.data?.message;
      const message =
        serverMessage ||
        (isNetworkError ? t('checkInternet') : t('toast.storyUploadFailed'));
      Toast.show({
        type: 'error',
        text1: message,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    if (imageData) {
      const file = {
        uri: imageData?.uri,
        name: imageData?.fileName || (imageData?.type?.startsWith('video/') ? 'video.mp4' : 'image.jpg'),
        type: imageData?.type || 'image/jpeg',
      };
      uploadFile(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData]);

  const requestCameraAndAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !==
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.warn('Camera or Microphone permission denied');
          return;
        }

        console.log('Permissions granted');
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const onPressNewStory = async (event: 'upload' | 'camera') => {
    if (event === 'upload') {
      return chooseImageFromLibrary('mixed', true); // Enable preview
    }

    await requestCameraAndAudioPermission();

    return captureImage('mixed', true); // Enable preview
  };

  // Handle confirmation of media after preview
  const handleConfirmMedia = () => {
    if (pendingMedia) {
      const isVideo = pendingMedia.type?.startsWith('video/');
      const duration = pendingMedia.duration ?? 0;
      if (isVideo && duration > MAX_STORY_VIDEO_DURATION) {
        Toast.show({
          type: 'error',
          text1: t('toast.storyVideoTooLong'),
        });
        cancelMedia();
        return;
      }
    }
    confirmMedia(); // This will trigger the useEffect with imageData
  };

  const resetStories = () => {
    setStories([
      {
        id: '0',
        name: 'Add Story',
        avatarSource: {uri: ''},
        stories: [],
        renderAvatar: () => {
          const avatarUri = getAbsoluteAvatarUrl(currentUserRef.current?.avatar);
          const avatarSource = avatarUri ? {uri: avatarUri} : images.profile;

          return (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <View style={styles.avatarCenter}>
                  <GradientBorderView
                    gradientProps={{
                      colors: ['#FF7A51', '#FFDB5C'],
                    }}
                    style={styles.addStoryAvatarContainer}>
                    <Image
                      source={avatarSource}
                      style={styles.addStoryAvatar}
                    />
                  </GradientBorderView>
                </View>
                <Text style={styles.storyName}>{t('stories.addStory')}</Text>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item
                  key="upload"
                  onSelect={() => onPressNewStory('upload')}>
                  <DropdownMenu.ItemTitle>
                    {t('galleryUpload')}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  key="camera"
                  onSelect={() => onPressNewStory('camera')}>
                  <DropdownMenu.ItemTitle>
                    {t('cameraUpload')}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          );
        },
      },
    ]);
  };

  const deleteStory = async (storyId: string | number) => {
    try {
      // Show confirmation alert
      Alert.alert(t('stories.deleteStory'), t('stories.confirmMsg'), [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              Toast.show({
                type: 'info',
                text1: t('toast.deletingStory'),
                text2: t('loadingText'),
              });

              await DeleteStory(storyId);

              Toast.show({
                type: 'success',
                text1: t('toast.storyDeleted'),
              });

              setStories(prevStories =>
                prevStories.filter(story => story.id !== String(storyId)),
              );

              // Refresh stories after successful deletion
              await getStories(false);
            } catch (err) {
              console.error('Delete error:', err);
              if (isAxiosError(err)) {
                Toast.show({
                  type: 'error',
                  text1: err.response?.data.message || 'Failed to delete story',
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: t('toast.storyDelNetworkFailed'),
                });
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]);
    } catch (err) {
      console.error('Delete error:', err);
      Toast.show({
        type: 'error',
        text1: t('toast.storyDelFailed'),
      });
    }
  };

  const formatStories = (stories: any[]): InstagramStoriesProps['stories'] => {
    storyMetadataRef.current = {};
    const activeStories = stories.filter(story => !isStoryExpired(story));

    // First group stories by user ID
    const groupedStories = activeStories.reduce((acc, story) => {
      const userId = String(story.user.id);
      const isCurrentUserStory = userId === String(currentUser.id);
      const avatarUri =
        story?.user?.avatar && story.user.avatar !== 'null'
          ? getAbsoluteAvatarUrl(story.user.avatar)
          : '';
      const storyId = String(story.id);
      const mediaType = getStoryMediaType(story);
      const mediaUrl = getAbsoluteAvatarUrl(story.media_url) || story.media_url;
      storyMetadataRef.current[storyId] = getStoryDurationMetadata(story);

      if (!acc[userId]) {
        acc[userId] = {
          id: userId,
          name: story.user.full_name || 'Unknown User',
          avatarSource: {
            uri: avatarUri || '',
          },
          stories: [],
        };
      }

      const storyItem = {
        id: storyId,
        source: {uri: mediaUrl},
        mediaType,
        mediaUrl,
        // Use renderFooter instead of renderStoryHeader
        renderFooter: isCurrentUserStory
          ? () => (
              <SafeAreaView style={styles.footerContainer}>
                <TouchableOpacity
                  onPress={() => deleteStory(story.id)}
                  style={styles.deleteButton}
                  disabled={isDeleting}
                  accessibilityRole="button"
                  accessibilityLabel={t('stories.deleteStory')}>
                  <Trash2 size={20} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
              </SafeAreaView>
            )
          : undefined,
      };

      acc[userId].stories.push(storyItem);
      return acc;
    }, {});

    return Object.values(
      groupedStories,
    ) as InstagramStoriesProps['stories'];
  };

  // Render the media preview UI
  const renderMediaPreview = () => {
    if (!pendingMedia) {
      return null;
    }

    const isVideo = pendingMedia.type?.startsWith('video/');

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={previewMode}
        onRequestClose={cancelMedia}>
        <View style={styles.modalContainer}>
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>

            {isVideo ? (
              <Video
                source={{uri: pendingMedia.uri}}
                style={styles.mediaPreview}
                resizeMode="contain"
                controls={true}
              />
            ) : (
              <Image
                source={{uri: pendingMedia.uri}}
                style={styles.mediaPreview}
                resizeMode="contain"
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelMedia}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirmMedia}>
                <Text style={[styles.buttonText, styles.confirmText]}>
                  Upload
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderUploadProgress = () => {
    const progress = Math.max(0, Math.min(100, uploadProgress));

    return (
      <View style={styles.uploadProgressContainer}>
        <Text style={styles.uploadProgressText}>
          {t('toast.uploadingStory')} {progress}%
        </Text>
        <View style={styles.uploadProgressTrack}>
          <View style={[styles.uploadProgressFill, {width: `${progress}%`}]} />
        </View>
      </View>
    );
  };

  const handleStoryStart = useCallback(
    (userId?: string, storyId?: string) => {
      markActiveStorySkipped();

      if (!storyId) {
        return;
      }

      activeStoryRef.current = {
        userId,
        storyId,
        startedAt: Date.now(),
        completed: false,
      };
      sendStoryAnalytics(storyId, 'opened');
    },
    [markActiveStorySkipped, sendStoryAnalytics],
  );

  const handleStoryEnd = useCallback(
    (_userId?: string, storyId?: string) => {
      if (!storyId) {
        return;
      }

      const activeStory = activeStoryRef.current;
      if (
        !activeStory ||
        activeStory.storyId !== storyId ||
        activeStory.completed
      ) {
        return;
      }

      const metadata = storyMetadataRef.current[storyId];
      const elapsedMs = Date.now() - activeStory.startedAt;
      const event: StoryAnalyticsEvent =
        !metadata ||
        (metadata.mediaType === 'video' && !metadata.hasExplicitDuration) ||
        elapsedMs >= metadata.expectedDurationMs * STORY_COMPLETION_THRESHOLD
          ? 'completed'
          : 'skipped';

      activeStory.completed = true;
      sendStoryAnalytics(storyId, event);
    },
    [sendStoryAnalytics],
  );

  const handleStoryHide = useCallback(
    (storyId: string) => {
      markActiveStorySkipped(storyId);
    },
    [markActiveStorySkipped],
  );

  if (!stories || !stories.length || isInitialLoading) {
    return (
      <View style={styles.initialLoaderWrap}>
        <Loader size="small" style={styles.initialLoader} />
      </View>
    );
  }

  return (
    <View>
      {isRefreshing && (
        <View style={{position: 'absolute', top: 0, right: 10, zIndex: 10}}>
          <Loader size="small" />
        </View>
      )}

      {isUploading && renderUploadProgress()}

      {/* Media Preview Modal */}
      {renderMediaPreview()}

      <InstagramStories
        key="stories-tray"
        stories={stories}
        avatarBorderColors={['#FF7A51', '#FFDB5C']}
        saveProgress
        avatarListContainerStyle={styles.avatarListContainer}
        avatarListContainerProps={{estimatedItemSize: STORY_AVATAR_SLOT_WIDTH}}
        avatarSize={STORY_LIBRARY_AVATAR_SIZE}
        showName={true}
        nameTextStyle={styles.viewerStoryName}
        onStoryStart={handleStoryStart}
        onStoryEnd={handleStoryEnd}
        onHide={handleStoryHide}
      />
    </View>
  );
});

// Styles for the preview modal
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareAvatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 8, // Much less rounded, more square-like
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  squareAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 6, // More square-like corners
    padding: 2, // This creates space between border and image
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4, // Even smaller radius for the actual image
  },
  squareAvatar: {
    borderRadius: 20, // Match the container
  },
  // Update in the styles
  squareGradientContainer: {
    borderWidth: 3,
    borderRadius: 8, // Much less rounded corners
    height: 60,
    width: 60,
    overflow: 'hidden',
  },
  addStoryAvatarContainer: {
    borderWidth: 3,
    borderRadius: STORY_AVATAR_OUTER_SIZE / 2,
    height: STORY_AVATAR_OUTER_SIZE,
    width: STORY_AVATAR_OUTER_SIZE,
    overflow: 'hidden',
  },
  addStoryAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: STORY_AVATAR_OUTER_SIZE / 2,
  },
  squareImage: {
    width: 64,
    height: 64,
    borderRadius: 6, // Smaller radius for more square-like appearance
  },
  avatarCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: STORY_AVATAR_SLOT_WIDTH,
  },
  liveLabelContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  userName: {
    fontSize: 12,
  },
  liveText: {
    color: '#FF5125',
    fontSize: 12,
  },
  storyName: {
    textAlign: 'center',
    fontSize: 12,
    height: 22,
    lineHeight: 18,
    marginTop: 4,
    width: STORY_AVATAR_SLOT_WIDTH,
    color: '#333',
  },
  avatarListContainer: {
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 18,
  },
  viewerStoryName: {
    color: '#333',
    fontSize: 12,
    height: 22,
    lineHeight: 18,
    marginTop: 4,
    marginLeft: 0,
    textAlign: 'center',
    width: STORY_AVATAR_SLOT_WIDTH,
  },
  previewContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  mediaPreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  videoPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaPath: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#FF7A51',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmText: {
    color: 'white',
  },
  uploadProgressContainer: {
    marginHorizontal: 12,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF4EE',
  },
  uploadProgressText: {
    color: '#333',
    fontSize: 12,
    marginBottom: 6,
  },
  uploadProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFD8C8',
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FF7A51',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialLoaderWrap: {
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialLoader: {
    flex: 0,
    backgroundColor: 'transparent',
  },
});

export default Stories;
