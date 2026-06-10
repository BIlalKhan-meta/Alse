import {useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';
import {Asset} from 'react-native-image-picker';
import {
  mapPickerAssetsToMedia,
  PickedMedia,
} from './useImagePicker';
import {
  MediaEditorOrigin,
  MediaEditorQueueItem,
} from '../types/mediaEditor';

const toQueueItem = (media: PickedMedia): MediaEditorQueueItem => ({
  uri: media.uri,
  name: media.name,
  type: media.type,
  kind: media.kind,
});

export const useMediaEditorFlow = (origin: MediaEditorOrigin) => {
  const navigation = useNavigation<any>();

  const startImageEditFlow = useCallback(
    (assets: Asset[] | PickedMedia[], maxRemaining: number) => {
      const incoming =
        Array.isArray(assets) && assets.length > 0 && 'uri' in assets[0]
          ? (assets as PickedMedia[])
          : mapPickerAssetsToMedia(assets as Asset[]).filter(
              item => item.kind === 'image',
            );

      if (!incoming.length) {
        return;
      }

      const queue = incoming.map(toQueueItem);
      const first = queue[0];

      navigation.navigate('MediaEditor', {
        uri: first.uri,
        name: first.name,
        type: first.type,
        kind: 'image',
        queue,
        queueIndex: 0,
        maxRemaining,
        origin,
        completedMedia: [],
      });
    },
    [navigation, origin],
  );

  const startVideoEditFlow = useCallback(
    (asset: Asset | PickedMedia) => {
      const media: PickedMedia =
        'kind' in asset
          ? (asset as PickedMedia)
          : mapPickerAssetsToMedia([asset as Asset])[0];

      if (!media?.uri || media.kind !== 'video') {
        return;
      }

      const queueItem = toQueueItem(media);

      navigation.navigate('MediaEditor', {
        uri: queueItem.uri,
        name: queueItem.name,
        type: queueItem.type,
        kind: 'video',
        queue: [queueItem],
        queueIndex: 0,
        maxRemaining: 1,
        origin,
        completedMedia: [],
      });
    },
    [navigation, origin],
  );

  return {
    startImageEditFlow,
    startVideoEditFlow,
  };
};

export default useMediaEditorFlow;
