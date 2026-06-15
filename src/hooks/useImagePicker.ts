import {useState} from 'react';
import {Alert} from 'react-native';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

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

export const mapPickerAssetsToMedia = (assets: Asset[]): PickedMedia[] =>
  assets.map(asset => {
    const assetType = asset.type ?? '';
    const kind: PickedMediaKind =
      assetType.startsWith('video') || asset.duration != null ? 'video' : 'image';
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

const useImagePicker = () => {
  const [image, setImage] = useState<any>(null); // State to store the selected image URI
  const [imageData, setImageData] = useState<any>(null);
  const [imagesData, setImagesData] = useState<any[]>([]);

  const libraryOptionsFor = (mediaType: LibraryMediaType, selectionLimit: number = 1) => {
    const base: any = {
      mediaType,
      quality: 1,
      selectionLimit,
    };
    if (mediaType === 'photo') {
      base.maxWidth = 1200; // Increased to allow better quality
      base.maxHeight = 1200;
    }
    return base;
  };

  // Function to handle image selection from gallery
  const chooseImageFromLibrary = (mediaType: LibraryMediaType = 'photo', selectionLimit: number = 1) => {
    const options = libraryOptionsFor(mediaType, selectionLimit);

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode == 'permission') {
        console.log('Permission not satisfied');
      } else if (response.assets && response.assets.length > 0) {
        const assets = response.assets;
        if (selectionLimit > 1) {
          setImagesData(assets);
          setImageData(null);
          setImage(null);
        } else {
          setImage(assets[0].uri);
          setImageData(assets[0]);
          setImagesData(assets);
        }
      }
    });
  };

  // Function to capture image using the camera
  const captureImage = (mediaType: LibraryMediaType = 'photo') => {
    const options = libraryOptionsFor(mediaType, 1);

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode == 'camera_unavailable') {
        console.log('Camera not available on device');
      } else if (response.errorCode == 'permission') {
        console.log('Permission not satisfied');
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setImage(asset.uri);
        setImageData(asset);
        setImagesData([asset]);
      }
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
          onPress: () => captureImage(mediaType),
        },
        {
          text: labels?.gallery ?? 'Open Gallery',
          onPress: () => chooseImageFromLibrary(mediaType, selectionLimit),
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
