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
import useImagePicker, {
  isVideoAsset,
  mergeMediaList,
  PickedMedia,
} from '../../hooks/useImagePicker';
import useMediaEditorFlow from '../../hooks/useMediaEditorFlow';
import {SelectedMusic} from '../../types/backgroundMusic';
import {EditedMedia} from '../../types/mediaEditor';
import {selectUserProfile} from '../../store/slices/authSlice';
import {formatMusicLabel} from '../../utils/backgroundMusic';
import {Toast, getAbsoluteAvatarUrl} from '../../utils/helpers';
import {
  draftMediaToPickedMedia,
  loadPostDraft,
  savePostDraft,
} from '../../utils/postDrafts';
import {enqueuePostUpload} from '../../services/postUploadQueue';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';
import styles from './styles';
import {useTranslation} from 'react-i18next';

type SelectedMedia = PickedMedia;

const MAX_MEDIA = 10;

const CreatePost: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useSelector(selectUserProfile);

  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMediaList, setSelectedMediaList] = useState<SelectedMedia[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<SelectedMusic | null>(null);
  const [privacy, setPrivacy] = useState<'friends' | 'public' | 'only_me'>('friends');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeDraftId, setActiveDraftId] = useState<string | undefined>(
    route.params?.draftId,
  );
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {t} = useTranslation();

  const {
    imageData,
    imagesData,
    showImageSourcePicker,
    setImagesData,
    setImageData,
  } = useImagePicker();

  const {startImageEditFlow, startVideoEditFlow, startReEditFlow} =
    useMediaEditorFlow('create');
  const remainingMediaSlots = MAX_MEDIA - selectedMediaList.length;

  useFocusEffect(
    React.useCallback(() => {
      const batch = route.params?.editedMediaBatch as EditedMedia[] | undefined;
      const editIndex = route.params?.reEditIndex as number | undefined;
      if (batch?.length) {
        if (editIndex !== undefined && editIndex >= 0) {
          setSelectedMediaList(prev => {
            const next = [...prev];
            next[editIndex] = {
              ...batch[0],
              sourceUri: batch[0].sourceUri ?? next[editIndex]?.sourceUri,
            };
            return next;
          });
        } else if (batch.some(item => item.kind === 'video')) {
          setSelectedMediaList(batch);
        } else {
          setSelectedMediaList(prev => mergeMediaList(prev, batch, MAX_MEDIA));
        }
        navigation.setParams({editedMediaBatch: undefined, reEditIndex: undefined});
      }

      const music = route.params?.selectedMusic as SelectedMusic | undefined;
      if (music) {
        setSelectedMusic(music);
        navigation.setParams({selectedMusic: undefined});
      }
    }, [
      navigation,
      route.params?.editedMediaBatch,
      route.params?.reEditIndex,
      route.params?.selectedMusic,
    ]),
  );

  useEffect(() => {
    const draftId = route.params?.draftId as string | undefined;
    if (!draftId || !user?.id) {
      return;
    }

    let cancelled = false;

    (async () => {
      const draft = await loadPostDraft(user.id, draftId);
      if (cancelled) {
        return;
      }
      if (!draft || draft.kind !== 'create') {
        Toast.error(t('draftLoadFailed'));
        return;
      }

      setDescription(draft.description);
      setSelectedMediaList(draftMediaToPickedMedia(draft.media));
      if (draft.music) {
        setSelectedMusic(draft.music);
      }
      if (
        draft.privacy === 'friends' ||
        draft.privacy === 'public' ||
        draft.privacy === 'only_me'
      ) {
        setPrivacy(draft.privacy);
      }
      setActiveDraftId(draft.id);
    })();

    return () => {
      cancelled = true;
    };
  }, [route.params?.draftId, t, user?.id]);

  useEffect(() => {
    const hasVideo = selectedMediaList.some(media => media?.kind === 'video');

    if (hasVideo && selectedMusic) {
      setSelectedMusic(null);
    }
  }, [selectedMediaList, selectedMusic]);

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
    if (!isVideoAsset(imageData)) {
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

    let privacyValue = '2';
    if (privacy === 'public') {
      privacyValue = '1';
    }
    if (privacy === 'only_me') {
      privacyValue = '0';
    }

    const mediaSnapshot = selectedMediaList.filter(media => media?.uri);
    const musicSnapshot = selectedMusic;
    const text = description.trim();
    const draftId = activeDraftId;
    const userId = user?.id;

    Toast.success(t('uploadStarted', {defaultValue: 'Upload started'}));
    navigation.goBack();

    void enqueuePostUpload({
      description: text,
      privacy: privacyValue,
      mediaList: mediaSnapshot,
      music: musicSnapshot,
      draftId,
      userId,
    });
  };

  const hasDraftContent =
    !!description.trim() || selectedMediaList.length > 0 || !!selectedMusic;

  const handleSaveDraft = async () => {
    if (!user?.id) {
      return;
    }
    if (!hasDraftContent) {
      Toast.error('Please add some text or media to save');
      return;
    }

    setIsSavingDraft(true);
    setLoadingMessage(t('savingDraft'));

    try {
      const draftId = await savePostDraft({
        userId: user.id,
        kind: 'create',
        description,
        privacy,
        media: selectedMediaList,
        music: selectedMusic,
        draftId: activeDraftId,
      });
      setActiveDraftId(draftId);
      Toast.success(t('draftSaved'));
      navigation.goBack();
    } catch (err: any) {
      Toast.error(getMessage(err));
    } finally {
      setIsSavingDraft(false);
      setLoadingMessage('');
    }
  };

  const handleEditMedia = (index: number) => {
    const media = selectedMediaList[index];
    if (!media?.uri) {
      return;
    }
    const kind = media.kind ?? (isVideoAsset(media) ? 'video' : 'image');
    startReEditFlow(
      {
        ...media,
        kind,
        sourceUri: media.sourceUri ?? media.uri,
      },
      index,
    );
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

  const handleAddMusic = () => {
    if (hasVideoSelected) {
      Toast.error(t('musicNotWithVideo'));
      return;
    }

    navigation.navigate('MusicPicker', {
      imageUris: selectedMediaList.map(media => media.uri),
      imageName: selectedMediaList[0]?.name,
      existingMusic: selectedMusic ?? undefined,
    });
  };

  const handleRemoveMusic = () => {
    setSelectedMusic(null);
  };

  const handlePickVideo = () => {
    if (selectedMediaList.length > 0) {
      Toast.error('Remove existing media before adding a video');
      return;
    }
    showImageSourcePicker('video', 1, {
      title: t('uploadVideo'),
      message: t('chooseVideoSource'),
      camera: t('recordVideo'),
      gallery: t('galleryUpload'),
      cancel: t('cancel'),
    });
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
      <Modal visible={isLoading || isSavingDraft} transparent animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.loaderText}>
              {loadingMessage || t('creatingPost')}
            </Text>
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
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.saveDraftButton,
              (!hasDraftContent || isLoading || isSavingDraft) &&
                styles.postButtonDisabled,
            ]}
            onPress={handleSaveDraft}
            disabled={!hasDraftContent || isLoading || isSavingDraft}>
            <Text style={styles.saveDraftButtonText}>{t('saveDraft')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="create-post-submit"
            style={[
              styles.postButton,
              (!hasDraftContent || isLoading || isSavingDraft) &&
                styles.postButtonDisabled,
            ]}
            onPress={handlePost}
            disabled={!hasDraftContent || isLoading || isSavingDraft}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image source={avatarUrl} style={styles.avatar} />
          <View style={styles.inputContainer}>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                testID="create-post-input"
                style={styles.input}
                placeholder="What's on your mind?"
                placeholderTextColor="#999"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
            {selectedMusic ? (
              <View style={styles.musicRow}>
                <Text style={styles.musicText} numberOfLines={1}>
                  {formatMusicLabel(selectedMusic, t('unknownTrack'))}
                </Text>
                <TouchableOpacity
                  style={styles.musicRemoveButton}
                  onPress={handleRemoveMusic}
                  accessibilityLabel={t('removeMusic')}>
                  <View style={styles.musicRemoveIconContainer}>
                    <X color="#333" size={10} />
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        {/* Selected Media Preview */}
        {selectedMediaList.length > 0 ? (
          <View style={styles.multiMediaContainer}>
            {/* Main Image */}
            <View style={styles.mainMediaWrapper}>
              {selectedMediaList[0].kind === 'video' ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleEditMedia(0)}
                  style={styles.mediaPressable}>
                  <Video
                    source={{uri: selectedMediaList[0].uri}}
                    style={styles.mainMediaImage}
                    resizeMode="cover"
                    repeat
                    muted
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleEditMedia(0)}
                  style={styles.mediaPressable}>
                  <Image
                    source={{uri: selectedMediaList[0].uri}}
                    style={styles.mainMediaImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
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
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleEditMedia(index + 1)}
                      style={styles.mediaPressable}>
                      {media.kind === 'video' ? (
                        <Video
                          source={{uri: media.uri}}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                          repeat
                          muted
                          pointerEvents="none"
                        />
                      ) : (
                        <Image
                          source={{uri: media.uri}}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                      )}
                    </TouchableOpacity>
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
          testID="create-post-upload-image"
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
          onPress={handleAddMusic}
        >
          <View style={[styles.optionIconContainer, styles.optionIconContainerMusic]}>
            <Music color="#4CD964" size={20} />
          </View>
          <Text style={styles.optionText}>{t('addMusic')}</Text>
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
