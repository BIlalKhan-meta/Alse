import {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export type LibraryMediaType = 'photo' | 'video' | 'mixed';

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
      } else {
        if (response.assets && response.assets.length > 0) {
          setImage(response.assets[0].uri);
          setImageData(response.assets[0]);
          setImagesData(response.assets);
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
      } else {
        if (response.assets && response.assets.length > 0) {
          setImage(response.assets[0].uri);
          setImageData(response.assets[0]);
          setImagesData([response.assets[0]]);
        }
      }
    });
  };

  return {
    image,
    imageData,
    imagesData,
    captureImage,
    chooseImageFromLibrary,
    chooseVideoFromLibrary: () => chooseImageFromLibrary('video'),
    chooseMediaFromLibrary: () => chooseImageFromLibrary('mixed'),
    setImageData,
    setImage,
    setImagesData,
  };
};

export default useImagePicker;
