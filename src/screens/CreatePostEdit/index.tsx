import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import CardComponent from '../../components/CardComponent';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './styles';
import useImagePicker, {
  mapPickerAssetsToMedia,
  mergeMediaList,
  PickedMedia,
} from '../../hooks/useImagePicker';
import InterMedium from '../../components/Text/InterMedium';
import {postEdit, updatePost} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import {createVideoFile, getMessage, Toast} from '../../utils/helpers';
import Loader from '../../components/Loader';
import {removeImage} from '../../api/home';

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
    .map(item => ({
      uri: item.path,
      type: item.type,
      kind:
        String(item.type ?? '').toLowerCase() === 'video' ? 'video' : 'image',
      mediaId: item.id,
      isExisting: true,
    }));

const CreatePostEdit: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const title = route?.params?.title || 'Create Post';
  const data = route?.params?.data;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mediaList, setMediaList] = useState<EditMediaItem[]>(() =>
    mapExistingPostMedia(data?.media),
  );
  const [privacy, setPrivacy] = useState(`${route?.params?.data?.privacy}`);
  const [comment, setComment] = useState<string>(
    route?.params?.data?.description || '',
  );

  const {
    imageData,
    imagesData,
    captureImage,
    chooseImageFromLibrary,
    setImagesData,
  } = useImagePicker();

  const remainingMediaSlots = MAX_MEDIA - mediaList.length;
  const hasVideoSelected = mediaList.some(media => media.kind === 'video');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerRight: () => (
        <TouchableOpacity
          disabled={isLoading}
          style={styles.postButton}
          onPress={handlePost}>
          <InterMedium style={styles.postTxt}>
            {title === 'Edit Post' ? 'Update' : 'Post'}
          </InterMedium>
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, isLoading, comment, privacy, mediaList]);

  useEffect(() => {
    if (!imagesData?.length) {
      return;
    }
    const incoming = mapPickerAssetsToMedia(imagesData).filter(
      item => item.kind === 'image',
    );
    if (incoming.length > 0) {
      setMediaList(prev => mergeMediaList(prev, incoming, MAX_MEDIA));
    }
    setImagesData([]);
  }, [imagesData, setImagesData]);

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

    setMediaList(prev => {
      if (prev.some(item => item.isExisting)) {
        Toast.error('Remove existing media before replacing with a video');
        return prev;
      }
      return [
        {
          uri: imageData.uri,
          name: imageData.fileName,
          type: imageData.type,
          kind: 'video',
        },
      ];
    });
    setImagesData([]);
  }, [imageData, setImagesData]);

  const previewMedia = useMemo(
    () => mediaList.map(item => ({uri: item.uri, id: item.mediaId})),
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
    chooseImageFromLibrary('photo', remainingMediaSlots);
  };

  const handlePickVideo = () => {
    if (mediaList.length > 0) {
      Toast.error('Remove existing media before adding a video');
      return;
    }
    chooseImageFromLibrary('video', 1);
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

  const handleRemoveMediaAt = async (index: number) => {
    const target = mediaList[index];
    if (!target) {
      return;
    }

    if (target.isExisting && target.mediaId && data?.id) {
      try {
        await removeImage(data.id, target.mediaId);
      } catch (err) {
        console.log('Error from Image Removed', err);
      }
    }

    setMediaList(prev => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handlePost = async () => {
    if (!comment || comment.trim() === '') {
      Toast.error('Please enter content');
      return;
    }

    const body = new FormData();
    body.append('description', comment);
    body.append('privacy', Number(privacy));

    const newMedia = mediaList.filter(item => !item.isExisting);
    newMedia.forEach((media, index) => {
      if (media.kind === 'video') {
        body.append(`file[${index}]`, createVideoFile(media.uri) as any);
      } else {
        body.append(`file[${index}]`, {
          name: media.name || `image_${index}.jpg`,
          uri: media.uri,
          type: media.type || 'image/jpeg',
        } as any);
      }
    });

    setIsLoading(true);

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

    dispatch(postEdit({formData: body, id: data?.id}))
      .unwrap()
      .then(() => {
        setIsLoading(false);
        Toast.success('Posted Edit Successfully');
        navigation.goBack();
      })
      .catch(err => {
        setIsLoading(false);
        Toast.error(getMessage(err?.message));
      });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <CardComponent
          onImagePress={handlePickImages}
          onVideoPress={handlePickVideo}
          onCameraPress={handleCapturePhoto}
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
