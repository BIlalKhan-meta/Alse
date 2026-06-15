import {useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';
import {Asset} from 'react-native-image-picker';
import {
  mapPickerAssetsToMedia,
  isVideoAsset,
  PickedMedia,
} from './useImagePicker';
import {
  MediaEditorOrigin,
  MediaEditorQueueItem,
} from '../types/mediaEditor';

const toQueueItem = (media: PickedMedia): MediaEditorQueueItem => ({
  uri: media.sourceUri ?? media.uri,
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
      const sourceUri = first.uri;

      navigation.navigate('MediaEditor', {
        uri: sourceUri,
        name: first.name,
        type: first.type,
        kind: 'image',
        queue,
        queueIndex: 0,
        maxRemaining,
        origin,
        completedMedia: [],
        sourceUri,
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
      const sourceUri = media.sourceUri ?? media.uri;

      navigation.navigate('MediaEditor', {
        uri: sourceUri,
        workingUri: media.uri !== sourceUri ? media.uri : undefined,
        name: queueItem.name,
        type: queueItem.type,
        kind: 'video',
        queue: [queueItem],
        queueIndex: 0,
        maxRemaining: 1,
        origin,
        completedMedia: [],
        sourceUri,
      });
    },
    [navigation, origin],
  );

  const startReEditFlow = useCallback(
    (media: PickedMedia, reEditIndex: number) => {
      const sourceUri = media.sourceUri ?? media.uri;
      const kind =
        media.kind ?? (isVideoAsset(media) ? 'video' : 'image');

      navigation.navigate('MediaEditor', {
        uri: sourceUri,
        workingUri: media.uri,
        name: media.name,
        type: media.type,
        kind,
        queue: [
          {
            uri: sourceUri,
            name: media.name,
            type: media.type,
            kind,
          },
        ],
        queueIndex: 0,
        maxRemaining: 1,
        origin,
        completedMedia: [],
        sourceUri,
        reEditIndex,
      });
    },
    [navigation, origin],
  );

  return {
    startImageEditFlow,
    startVideoEditFlow,
    startReEditFlow,
  };
};

export default useMediaEditorFlow;
