import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeft, Camera, Video as VideoIcon, Music, Check, X} from 'lucide-react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '../../hooks/storeHooks';
import useImagePicker, {
  mergeMediaList,
  PickedMedia,
} from '../../hooks/useImagePicker';
import useMediaEditorFlow from '../../hooks/useMediaEditorFlow';
import {EditedMedia} from '../../types/mediaEditor';
import {postCreate} from '../../store/slices/homeSlice';
import {selectUserProfile} from '../../store/slices/authSlice';
import {createVideoFile, getMessage, Toast, getAbsoluteAvatarUrl} from '../../utils/helpers';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';
import styles from './styles';
import {useTranslation} from 'react-i18next';

type SelectedMedia = PickedMedia;

const MAX_MEDIA = 10;

const CreatePost: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);

  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMediaList, setSelectedMediaList] = useState<SelectedMedia[]>([]);
  const [privacy, setPrivacy] = useState<'friends' | 'public' | 'only_me'>('friends');

  const {t} = useTranslation();

  const {
    imageData,
    imagesData,
    chooseImageFromLibrary,
    showImageSourcePicker,
    setImagesData,
    setImageData,
  } = useImagePicker();

  const {startImageEditFlow, startVideoEditFlow} = useMediaEditorFlow('create');
  const remainingMediaSlots = MAX_MEDIA - selectedMediaList.length;

  useFocusEffect(
    React.useCallback(() => {
      const batch = route.params?.editedMediaBatch as EditedMedia[] | undefined;
      if (batch?.length) {
        if (batch.some(item => item.kind === 'video')) {
          setSelectedMediaList(batch);
        } else {
          setSelectedMediaList(prev => mergeMediaList(prev, batch, MAX_MEDIA));
        }
        navigation.setParams({editedMediaBatch: undefined});
      }
    }, [navigation, route.params?.editedMediaBatch]),
  );

  useEffect(() => {
    if (!imagesData?.length) {
      return;
    }
    startImageEditFlow(imagesData, remainingMediaSlots);
    setImagesData([]);
  }, [imagesData, setImagesData, startImageEditFlow, remainingMediaSlots]);

  useEffect(() => {
    if (!imageData?.uri) {
      return;
    }
    const assetType = imageData.type ?? '';
    const isVideo =
      assetType.startsWith('video') || imageData.duration != null;
    if (!isVideo) {
      return;
    }
    startVideoEditFlow({
      uri: imageData.uri,
      name: imageData.fileName,
      type: imageData.type,
      kind: 'video',
    });
    setImageData(null);
    setImagesData([]);
  }, [imageData, setImageData, setImagesData, startVideoEditFlow]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handlePost = async () => {
    if (!description.trim() && selectedMediaList.length === 0) {
      Toast.error('Please add some text or media to post');
      return;
    }

    const body = new FormData();
    const text = description.trim();
    body.append('content', text);
    body.append('description', text);

    // Map privacy state to API values (assuming 1=public, 2=friends, 3=only_me based on previous code)
    let privacyValue = '2';
    if (privacy === 'public') {
      privacyValue = '1';
    }
    if (privacy === 'only_me') {
      privacyValue = '3';
    }
    body.append('privacy', privacyValue);

    if (selectedMediaList.length > 0) {
      selectedMediaList.forEach((media, index) => {
        if (media.kind === 'video') {
          const file = createVideoFile(media.uri);
          body.append(`file[${index}]`, file as any);
        } else {
          body.append(`file[${index}]`, {
            uri: media.uri,
            name: media.name || `image_${index}.jpg`,
            type: media.type || 'image/jpeg',
          } as any);
        }
      });
    }

    setIsLoading(true);

    dispatch(postCreate(body))
      .unwrap()
      .then(_res => {
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

  const removeMedia = (indexToRemove: number) => {
    setSelectedMediaList(prev =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const hasVideoSelected = selectedMediaList.some(media => media.kind === 'video');

  const handlePickImages = () => {
    if (hasVideoSelected) {
      Toast.error('Remove the video before adding images');
      return;
    }
    if (remainingMediaSlots <= 0) {
      Toast.error(`You can add up to ${MAX_MEDIA} images`);
      return;
    }
    showImageSourcePicker('photo', remainingMediaSlots, {
      title: t('uploadImage'),
      message: t('chooseImageSource'),
      camera: t('cameraUpload'),
      gallery: t('galleryUpload'),
      cancel: t('cancel'),
    });
  };

  const handlePickVideo = () => {
    if (selectedMediaList.length > 0) {
      Toast.error('Remove existing media before adding a video');
      return;
    }
    chooseImageFromLibrary('video', 1);
  };

  const renderPrivacyOption = (value: 'friends' | 'public' | 'only_me', label: string) => {
    const isSelected = privacy === value;
    return (
      <TouchableOpacity
        style={styles.privacyOption}
        onPress={() => setPrivacy(value)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
        ]}>
          {isSelected && <Check color="white" size={12} strokeWidth={3} />}
        </View>
        <Text style={styles.privacyText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const avatarUrl = user?.avatar ? {uri: getAbsoluteAvatarUrl(user.avatar)} : images.profile;
  const userName = user?.full_name || user?.first_name + ' ' + user?.last_name || 'User';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.loaderText}>Creating post...</Text>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
        </View>
        <TouchableOpacity
          style={[styles.postButton, (!description.trim() && selectedMediaList.length === 0) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={(!description.trim() && selectedMediaList.length === 0) || isLoading}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image source={avatarUrl} style={styles.avatar} />
          <View style={styles.inputContainer}>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="What's on your mind?"
                placeholderTextColor="#999"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
            <View style={styles.musicRow}>
              <Text style={styles.musicText}>ABC Music</Text>
              <TouchableOpacity style={styles.musicRemoveButton}>
                <View style={styles.musicRemoveIconContainer}>
                  <X color="#333" size={10} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Selected Media Preview */}
        {selectedMediaList.length > 0 ? (
          <View style={styles.multiMediaContainer}>
            {/* Main Image */}
            <View style={styles.mainMediaWrapper}>
              {selectedMediaList[0].kind === 'video' ? (
                <Video
                  source={{uri: selectedMediaList[0].uri}}
                  style={styles.mainMediaImage}
                  resizeMode="cover"
                  repeat
                  muted
                />
              ) : (
                <Image
                  source={{uri: selectedMediaList[0].uri}}
                  style={styles.mainMediaImage}
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => removeMedia(0)}>
                <X color="#fff" size={14} />
              </TouchableOpacity>
            </View>

            {/* Thumbnail Images */}
            {selectedMediaList.length > 1 && (
              <View style={styles.thumbnailRow}>
                {selectedMediaList.slice(1).map((media, index) => (
                  <View key={`${media.uri}-${index + 1}`} style={[styles.thumbnailWrapper, (index + 1) % 3 === 0 && styles.thumbnailWrapperLast]}>
                    {media.kind === 'video' ? (
                      <Video
                        source={{uri: media.uri}}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                        repeat
                        muted
                      />
                    ) : (
                      <Image
                        source={{uri: media.uri}}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    )}
                    <TouchableOpacity
                      style={styles.removeThumbnailButton}
                      onPress={() => removeMedia(index + 1)}>
                      <X color="#fff" size={10} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Bottom Sheet Options */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.optionItem}
          onPress={handlePickImages}
        >
          <View style={[styles.optionIconContainer, styles.optionIconContainerImage]}>
            <Camera color="#169BD5" size={20} />
          </View>
          <Text style={styles.optionText}>
            Upload Image{remainingMediaSlots > 0 ? ` (${selectedMediaList.length}/${MAX_MEDIA})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={handlePickVideo}
        >
          <View style={[styles.optionIconContainer, styles.optionIconContainerVideo]}>
            <VideoIcon color="#FF3B30" size={20} />
          </View>
          <Text style={styles.optionText}>Upload Video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionItem, styles.optionItemLast]}
          onPress={() => {
            Toast.show('Music upload coming soon!');
          }}
        >
          <View style={[styles.optionIconContainer, styles.optionIconContainerMusic]}>
            <Music color="#4CD964" size={20} />
          </View>
          <Text style={styles.optionText}>Add Music</Text>
        </TouchableOpacity>

        <View style={styles.privacyContainer}>
          {renderPrivacyOption('friends', 'Only Friends')}
          {renderPrivacyOption('public', 'Public')}
          {renderPrivacyOption('only_me', 'Only Me')}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreatePost;
