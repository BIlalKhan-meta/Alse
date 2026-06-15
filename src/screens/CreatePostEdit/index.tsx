import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import CardComponent from '../../components/CardComponent';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import styles from './styles';
import useImagePicker, {
  isVideoAsset,
  mergeMediaList,
  PickedMedia,
} from '../../hooks/useImagePicker';
import useMediaEditorFlow from '../../hooks/useMediaEditorFlow';
import {EditedMedia} from '../../types/mediaEditor';
import InterMedium from '../../components/Text/InterMedium';
import {postEdit, updatePost} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import {buildPostVideoFile, getMessage, Toast} from '../../utils/helpers';
import Loader from '../../components/Loader';
import {removeImage} from '../../api/home';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {
  deleteDraftsForPost,
  draftMediaToPickedMedia,
  loadPostDraft,
  savePostDraft,
} from '../../utils/postDrafts';

const ListOptions = [
  {label: 'Public', value: '2'},
  {label: 'Friends', value: '1'},
  {label: 'Only Me', value: '0'},
];

const MAX_MEDIA = 10;

type EditMediaItem = PickedMedia & {
  mediaId?: number;
  isExisting?: boolean;
};

const mapExistingPostMedia = (media: any[] = []): EditMediaItem[] =>
  media
    .filter(item => item?.path)
    .map(item => {
      const uri = item.path;
      const candidate = {uri, type: item.type};
      const kind: PickedMedia['kind'] =
        String(item.type ?? '').toLowerCase() === 'video' || isVideoAsset(candidate)
          ? 'video'
          : 'image';
      return {
        uri,
        sourceUri: uri,
        type: item.type,
        kind,
        mediaId: item.id,
        isExisting: true,
      };
    });

const CreatePostEdit: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useSelector(selectUserProfile);
  const title = route?.params?.title || 'Create Post';
  const data = route?.params?.data;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | undefined>(
    route.params?.draftId,
  );
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);
  const [mediaList, setMediaList] = useState<EditMediaItem[]>(() =>
    mapExistingPostMedia(data?.media),
  );
  const [privacy, setPrivacy] = useState(`${route?.params?.data?.privacy}`);
  const [comment, setComment] = useState<string>(
    route?.params?.data?.description || '',
  );

  const {t} = useTranslation();

  const {
    imageData,
    imagesData,
    captureImage,
    showImageSourcePicker,
    setImagesData,
    setImageData,
  } = useImagePicker();

  const remainingMediaSlots = MAX_MEDIA - mediaList.length;
  const hasVideoSelected = mediaList.some(media => media.kind === 'video');
  const {startImageEditFlow, startVideoEditFlow, startReEditFlow} =
    useMediaEditorFlow('edit');

  useFocusEffect(
    React.useCallback(() => {
      const batch = route.params?.editedMediaBatch as EditedMedia[] | undefined;
      const editIndex = route.params?.reEditIndex as number | undefined;
      if (batch?.length) {
        if (editIndex !== undefined && editIndex >= 0) {
          setMediaList(prev => {
            const next = [...prev];
            const previous = next[editIndex];
            next[editIndex] = {
              ...batch[0],
              sourceUri: batch[0].sourceUri ?? previous?.sourceUri,
              isExisting: previous?.isExisting,
              mediaId: previous?.mediaId,
            };
            return next;
          });
        } else if (batch.some(item => item.kind === 'video')) {
          setMediaList(batch);
        } else {
          setMediaList(prev => mergeMediaList(prev, batch, MAX_MEDIA));
        }
        navigation.setParams({editedMediaBatch: undefined, reEditIndex: undefined});
      }
    }, [navigation, route.params?.editedMediaBatch, route.params?.reEditIndex]),
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
      if (!draft || draft.kind !== 'edit') {
        Toast.error(t('draftLoadFailed'));
        return;
      }

      setComment(draft.description);
      setPrivacy(draft.privacy);
      setMediaList(draftMediaToPickedMedia(draft.media));
      setRemovedMediaIds(draft.removedMediaIds ?? []);
      setActiveDraftId(draft.id);
    })();

    return () => {
      cancelled = true;
    };
  }, [route.params?.draftId, t, user?.id]);

  const hasDraftContent = !!comment.trim() || mediaList.length > 0;

  const handleSaveDraft = async () => {
    if (!user?.id) {
      return;
    }
    const postId = data?.id ?? route.params?.data?.id;
    if (!postId) {
      Toast.error(t('draftLoadFailed'));
      return;
    }
    if (!hasDraftContent) {
      Toast.error('Please add some text or media to save');
      return;
    }

    setIsSavingDraft(true);
    try {
      const draftId = await savePostDraft({
        userId: user.id,
        kind: 'edit',
        description: comment,
        privacy,
        media: mediaList,
        postId,
        removedMediaIds,
        draftId: activeDraftId,
      });
      setActiveDraftId(draftId);
      Toast.success(t('draftSaved'));
      navigation.goBack();
    } catch (err: any) {
      Toast.error(getMessage(err));
    } finally {
      setIsSavingDraft(false);
    }
  };

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

    if (mediaList.some(item => item.isExisting)) {
      Toast.error('Remove existing media before replacing with a video');
      setImagesData([]);
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
  }, [imageData, setImageData, setImagesData, startVideoEditFlow, mediaList]);

  const previewMedia = useMemo(
    () =>
      mediaList.map(item => ({
        uri: item.uri,
        id: item.mediaId,
        kind: item.kind ?? (isVideoAsset(item) ? 'video' : 'image'),
      })),
    [mediaList],
  );

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
    if (mediaList.length > 0) {
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

  const handleCapturePhoto = () => {
    if (hasVideoSelected) {
      Toast.error('Remove the video before adding images');
      return;
    }
    if (remainingMediaSlots <= 0) {
      Toast.error(`You can add up to ${MAX_MEDIA} images`);
      return;
    }
    captureImage('photo');
  };

  const handleEditMediaAt = (index: number) => {
    const media = mediaList[index];
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

  const handleRemoveMediaAt = async (index: number) => {
    const target = mediaList[index];
    if (!target) {
      return;
    }

    if (target.isExisting && target.mediaId) {
      setRemovedMediaIds(prev =>
        prev.includes(target.mediaId!) ? prev : [...prev, target.mediaId!],
      );
    }

    setMediaList(prev => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handlePost = async () => {
    if (!comment || comment.trim() === '') {
      Toast.error('Please enter content');
      return;
    }

    setIsLoading(true);

    try {
      if (data?.id && removedMediaIds.length > 0) {
        for (const mediaId of removedMediaIds) {
          try {
            await removeImage(data.id, mediaId);
          } catch (err) {
            console.log('Error from Image Removed', err);
          }
        }
      }

      const body = new FormData();
      body.append('description', comment);
      body.append('privacy', Number(privacy));

      const newMedia = mediaList.filter(item => !item.isExisting);
      for (let index = 0; index < newMedia.length; index++) {
        const media = newMedia[index];
        if (media.kind === 'video') {
          const file = await buildPostVideoFile(media.uri, media.name, media.type);
          body.append(`file[${index}]`, file as any);
        } else {
          body.append(`file[${index}]`, {
            name: media.name || `image_${index}.jpg`,
            uri: media.uri,
            type: media.type || 'image/jpeg',
          } as any);
        }
      }

      dispatch(
        updatePost({
          ...data,
          description: comment,
          privacy: privacy,
          ...(newMedia.length
            ? {
                media: newMedia.map(item => ({
                  path: item.uri,
                  type: item.kind,
                })),
              }
            : {}),
        }),
      );

      await dispatch(postEdit({formData: body, id: data?.id})).unwrap();
      if (user?.id && data?.id) {
        await deleteDraftsForPost(user.id, data.id);
      }
      setIsLoading(false);
      Toast.success('Posted Edit Successfully');
      navigation.goBack();
    } catch (err: any) {
      setIsLoading(false);
      Toast.error(getMessage(err?.message ?? err));
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            disabled={isLoading || isSavingDraft || !hasDraftContent}
            style={styles.saveDraftButton}
            onPress={handleSaveDraft}>
            <InterMedium style={styles.saveDraftTxt}>{t('saveDraft')}</InterMedium>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isLoading || isSavingDraft}
            style={styles.postButton}
            onPress={handlePost}>
            <InterMedium style={styles.postTxt}>
              {title === 'Edit Post' ? 'Update' : 'Post'}
            </InterMedium>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [
    navigation,
    title,
    isLoading,
    isSavingDraft,
    hasDraftContent,
    t,
  ]);

  if (isLoading || isSavingDraft) {
    return <Loader />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <CardComponent
          onImagePress={handlePickImages}
          onVideoPress={handlePickVideo}
          onCameraPress={handleCapturePhoto}
          onMediaPress={handleEditMediaAt}
          value={comment}
          handleOnChangeText={setComment}
          ListOptions={ListOptions}
          privacy={privacy}
          mediaList={previewMedia}
          onRemoveMediaAt={handleRemoveMediaAt}
          removeMedia={() => handleRemoveMediaAt(0)}
          setPrivacy={setPrivacy}
        />
      </View>
    </ScrollView>
  );
};

export default CreatePostEdit;
