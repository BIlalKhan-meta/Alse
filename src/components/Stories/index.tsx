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
import {AddStory, GetStories, DeleteStory} from '../../api/stories';
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
import MediaModal from '../MediaModal';

// Constants
const MAX_RETRY_COUNT = 3;

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v', '.avi', '.3gp'];

const getStoryMediaType = (story: any): 'image' | 'video' => {
  const type = story?.media_type || story?.type;
  if (type === 'video' || type === 'image') return type;
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
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [storyMediaModal, setStoryMediaModal] = useState<{
    visible: boolean;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    userName: string;
  }>({
    visible: false,
    mediaUrl: '',
    mediaType: 'image',
    userName: '',
  });

  const retryCountRef = useRef<number>(0);

  // Add current user info (ref ensures renderAvatar always reads latest avatar after profile update)
  const currentUser = useSelector(selectUserProfile);
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const {t} = useTranslation();

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
  }, []);

  const uploadFile = async (file: any) => {
    setIsUploading(true);
    Toast.show({
      type: 'info',
      text1: t('toast.uploadingStory'),
      text2: t('loadingText'),
    });

    const formData = new FormData();

    formData.append('file', file);

    try {
      await AddStory(formData);

      Toast.show({
        type: 'success',
        text1: t('toast.storyUploadSuccess'),
      });

      // Refresh stories after successful upload
      await getStories(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      const serverMessage = err?.response?.data?.message;
      const isNetworkError =
        err?.code === 'ECONNABORTED' ||
        err?.message === 'Network request timeout' ||
        (isAxiosError(err) && err?.message === 'Network Error');
      const message =
        serverMessage ||
        (isNetworkError ? t('checkInternet') : t('toast.storyUploadFailed'));
      Toast.show({
        type: 'error',
        text1: message,
      });
    } finally {
      setIsUploading(false);
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

  const MAX_STORY_VIDEO_DURATION = 15; // seconds

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
    // First group stories by user ID
    const groupedStories = stories.reduce((acc, story) => {
      const userId = String(story.user.id);
      const isCurrentUserStory = userId === String(currentUser.id);
      const avatarUri =
        story?.user?.avatar && story.user.avatar !== 'null'
          ? getAbsoluteAvatarUrl(story.user.avatar)
          : '';
      const avatarSource = avatarUri ? {uri: avatarUri} : images.profile;

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
        id: String(story.id),
        source: {uri: story.media_url},
        mediaType: getStoryMediaType(story),
        mediaUrl: getAbsoluteAvatarUrl(story.media_url) || story.media_url,
        // Use renderFooter instead of renderStoryHeader
        renderFooter: isCurrentUserStory
          ? () => (
              <SafeAreaView style={styles.footerContainer}>
                <TouchableOpacity
                  onPress={() => deleteStory(story.id)}
                  style={styles.deleteButton}
                  disabled={isDeleting}>
                  <Text style={styles.deleteButtonText}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </SafeAreaView>
            )
          : undefined,
      };

      acc[userId].stories.push(storyItem);
      return acc;
    }, {});

    // Convert to array and add custom renderAvatar for current user (opens MediaModal on tap)
    const result = Object.values(
      groupedStories,
    ) as InstagramStoriesProps['stories'];
    return result.map(group => {
      if (group.id === String(currentUser.id) && group.stories.length > 0) {
        const firstStory = group.stories[0] as any;
        const mediaUrl = firstStory.mediaUrl || firstStory.source?.uri || '';
        const mediaType =
          (firstStory.mediaType as 'image' | 'video') ||
          getStoryMediaType({media_url: mediaUrl});
        return {
          ...group,
          // Pass empty stories so library doesn't open its viewer; we use MediaModal instead
          stories: [],
          renderAvatar: () => (
            <TouchableOpacity
              style={styles.avatarCenter}
              activeOpacity={0.8}
              onPress={() =>
                setStoryMediaModal({
                  visible: true,
                  mediaUrl,
                  mediaType,
                  userName: group.name || '',
                })
              }>
              <GradientBorderView
                gradientProps={{
                  colors: ['#FF7A51', '#FFDB5C'],
                }}
                style={styles.addStoryAvatarContainer}>
                <Image
                  source={
                    (group.avatarSource as {uri?: string})?.uri
                      ? {
                          uri: getAbsoluteAvatarUrl(
                            (group.avatarSource as {uri: string}).uri,
                          ),
                        }
                      : images.profile
                  }
                  style={styles.addStoryAvatar}
                />
              </GradientBorderView>
              <Text style={styles.storyName}>{group.name}</Text>
            </TouchableOpacity>
          ),
        };
      }
      return group;
    });
  };

  // Render the media preview UI
  const renderMediaPreview = () => {
    if (!pendingMedia) return null;

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

  if (!stories || !stories.length || isInitialLoading) {
    return <Loader />;
  }

  return (
    <View>
      {isRefreshing && (
        <View style={{position: 'absolute', top: 0, right: 10, zIndex: 10}}>
          <Loader size="small" />
        </View>
      )}

      {/* Media Preview Modal */}
      {renderMediaPreview()}

      <InstagramStories
        key={currentUser?.avatar || 'stories'}
        stories={stories}
        avatarBorderColors={['#FF7A51', '#FFDB5C']}
        saveProgress
        avatarListContainerStyle={{
          paddingHorizontal: 5,
          paddingVertical: 5,
        }}
        avatarListContainerProps={{estimatedItemSize: 84}}
        avatarSize={65}
        showName={true}
        nameTextStyle={{
          fontSize: 12,
          marginTop: 4,
          marginLeft: 13,
          textAlign: 'center',
        }}
      />

      <MediaModal
        visible={storyMediaModal.visible}
        onClose={() =>
          setStoryMediaModal({
            visible: false,
            mediaUrl: '',
            mediaType: 'image',
            userName: '',
          })
        }
        mediaUrl={storyMediaModal.mediaUrl}
        mediaType={storyMediaModal.mediaType}
        userName={storyMediaModal.userName}
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
    borderRadius: 35,
    height: 65,
    width: 65,
    overflow: 'hidden',
  },
  addStoryAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
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
    marginHorizontal: 4,
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
    marginBottom: 2,
    color: '#333',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0.5, height: 0.5},
    textShadowRadius: 1,
  },
});

export default Stories;
