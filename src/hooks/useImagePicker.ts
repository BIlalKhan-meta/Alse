import {useState} from 'react';
import {Alert, InteractionManager} from 'react-native';
import {
  Asset,
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {ensureCameraPermission, Toast} from '../utils/helpers';

export type LibraryMediaType = 'photo' | 'video' | 'mixed';

export type ImageSourcePickerLabels = {
  title?: string;
  message?: string;
  camera?: string;
  gallery?: string;
  cancel?: string;
};

export type PickedMediaKind = 'image' | 'video';

export type PickedMedia = {
  uri: string;
  name?: string;
  type?: string;
  kind: PickedMediaKind;
  sourceUri?: string;
};

const VIDEO_URI_PATTERN = /\.(mp4|mov|m4v|webm|3gp)$/i;

export const isVideoAsset = (asset: Asset | PickedMedia | null | undefined): boolean => {
  if (!asset) {
    return false;
  }
  const assetType = asset.type ?? '';
  if (assetType.startsWith('video')) {
    return true;
  }
  if ('duration' in asset && asset.duration != null) {
    return true;
  }
  const uri = asset.uri ?? '';
  return VIDEO_URI_PATTERN.test(uri);
};

export const mapPickerAssetsToMedia = (assets: Asset[]): PickedMedia[] =>
  assets.map(asset => {
    const kind: PickedMediaKind = isVideoAsset(asset) ? 'video' : 'image';
    const uri = asset.uri ?? '';
    return {
      uri,
      name: asset.fileName,
      type: asset.type,
      kind,
      sourceUri: uri,
    };
  });

export const mergeMediaList = (
  existing: PickedMedia[],
  incoming: PickedMedia[],
  maxCount: number,
): PickedMedia[] => {
  const merged = [...existing];
  for (const item of incoming) {
    if (merged.length >= maxCount) {
      break;
    }
    if (item.uri && !merged.some(media => media.uri === item.uri)) {
      merged.push(item);
    }
  }
  return merged;
};

const runAfterAlertDismiss = (action: () => void) => {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(action, 300);
  });
};

const VALID_LIBRARY_MEDIA_TYPES: LibraryMediaType[] = [
  'photo',
  'video',
  'mixed',
];

const normalizeLibraryMediaType = (
  mediaType: unknown,
  fallback: LibraryMediaType = 'photo',
): LibraryMediaType => {
  if (
    typeof mediaType === 'string' &&
    VALID_LIBRARY_MEDIA_TYPES.includes(mediaType as LibraryMediaType)
  ) {
    return mediaType as LibraryMediaType;
  }
  return fallback;
};

const libraryOptionsFor = (
  mediaType: LibraryMediaType,
  selectionLimit: number = 1,
): ImageLibraryOptions => {
  const safeType = normalizeLibraryMediaType(mediaType);
  const base: ImageLibraryOptions = {
    mediaType: safeType,
    quality: 1,
    selectionLimit,
  };
  if (safeType === 'photo') {
    base.maxWidth = 2048;
    base.maxHeight = 2048;
  }
  return base;
};

const cameraOptionsFor = (mediaType: LibraryMediaType): CameraOptions => {
  if (mediaType === 'video') {
    return {
      mediaType: 'video',
      videoQuality: 'high',
      durationLimit: 120,
      saveToPhotos: false,
    };
  }

  if (mediaType === 'mixed') {
    return {
      mediaType: 'mixed',
      quality: 1,
    };
  }

  return {
    mediaType: 'photo',
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 1,
  };
};

const useImagePicker = () => {
  const [image, setImage] = useState<any>(null);
  const [imageData, setImageData] = useState<any>(null);
  const [imagesData, setImagesData] = useState<any[]>([]);

  const assignSingleAsset = (asset: Asset, requestedMediaType?: LibraryMediaType) => {
    const isVideo =
      requestedMediaType === 'video' || isVideoAsset(asset);

    setImage(asset.uri);
    setImageData(asset);
    if (isVideo) {
      setImagesData([]);
      return;
    }
    setImagesData([asset]);
  };

  const handlePickerError = (response: ImagePickerResponse, context: string) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode === 'permission') {
      Toast.error('Permission is required to continue');
      return;
    }

    if (response.errorCode === 'camera_unavailable') {
      Toast.error('Camera is not available on this device');
      return;
    }

    const message = response.errorMessage ?? `${context} failed`;
    Toast.error(message);
  };

  const chooseImageFromLibrary = (
    mediaType: LibraryMediaType = 'photo',
    selectionLimit: number = 1,
  ) => {
    const safeType = normalizeLibraryMediaType(mediaType);
    const limit =
      typeof selectionLimit === 'number' && selectionLimit > 0
        ? selectionLimit
        : 1;
    const options = libraryOptionsFor(safeType, limit);

    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorCode) {
        handlePickerError(response, 'Gallery picker');
        return;
      }

      if (!response.assets?.length) {
        return;
      }

      const assets = response.assets;
      if (limit > 1) {
        setImagesData(assets);
        setImageData(null);
        setImage(null);
        return;
      }

      assignSingleAsset(assets[0], safeType);
    });
  };

  const captureImage = async (mediaType: LibraryMediaType = 'photo') => {
    const safeType = normalizeLibraryMediaType(mediaType);
    const forVideo = safeType === 'video';
    const granted = await ensureCameraPermission({forVideo});
    if (!granted) {
      Toast.error(
        forVideo
          ? 'Camera and microphone permissions are required to record video'
          : 'Camera permission is required to take photos',
      );
      return;
    }

    const options = cameraOptionsFor(safeType);

    launchCamera(options, response => {
      if (response.didCancel || response.errorCode) {
        handlePickerError(response, 'Camera');
        return;
      }

      if (!response.assets?.length) {
        return;
      }

      assignSingleAsset(response.assets[0], safeType);
    });
  };

  const clearPickerSelection = () => {
    setImage(null);
    setImageData(null);
    setImagesData([]);
  };

  const showImageSourcePicker = (
    mediaType: LibraryMediaType = 'photo',
    selectionLimit: number = 1,
    labels?: ImageSourcePickerLabels,
  ) => {
    Alert.alert(
      labels?.title ?? 'Upload Image',
      labels?.message ?? 'Choose camera or gallery',
      [
        {text: labels?.cancel ?? 'Cancel', style: 'cancel'},
        {
          text: labels?.camera ?? 'Open Camera',
          onPress: () => {
            runAfterAlertDismiss(() => {
              void captureImage(mediaType);
            });
          },
        },
        {
          text: labels?.gallery ?? 'Open Gallery',
          onPress: () => {
            runAfterAlertDismiss(() => {
              chooseImageFromLibrary(mediaType, selectionLimit);
            });
          },
        },
      ],
    );
  };

  return {
    image,
    imageData,
    imagesData,
    captureImage,
    chooseImageFromLibrary,
    showImageSourcePicker,
    chooseVideoFromLibrary: () => chooseImageFromLibrary('video'),
    chooseMediaFromLibrary: () => chooseImageFromLibrary('mixed'),
    setImageData,
    setImage,
    setImagesData,
    clearPickerSelection,
  };
};

export default useImagePicker;
