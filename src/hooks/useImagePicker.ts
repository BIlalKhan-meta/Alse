import {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export type LibraryMediaType = 'photo' | 'video' | 'mixed';

const useImagePicker = () => {
  const [image, setImage] = useState<any>(null); // State to store the selected image URI
  const [imageData, setImageData] = useState<any>(null);

  const libraryOptionsFor = (mediaType: LibraryMediaType) => {
    const base: any = {
      mediaType,
      quality: 1,
      selectionLimit: 1,
    };
    if (mediaType === 'photo') {
      base.maxWidth = 300;
      base.maxHeight = 550;
    }
    return base;
  };

  // Function to handle image selection from gallery
  const chooseImageFromLibrary = (mediaType: LibraryMediaType = 'photo') => {
    const options = libraryOptionsFor(mediaType);

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode == 'permission') {
        console.log('Permission not satisfied');
      } else {
        setImage(response.assets?.[0].uri); // Set the selected image URI
        // Handle further processing if needed (e.g., setting file type)
        setImageData(response?.assets?.[0]);
      }
    });
  };

  // Function to capture image using the camera
  const captureImage = (mediaType: LibraryMediaType = 'photo') => {
    const options = libraryOptionsFor(mediaType);

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode == 'camera_unavailable') {
        console.log('Camera not available on device');
      } else if (response.errorCode == 'permission') {
        console.log('Permission not satisfied');
      } else {
        setImage(response.assets?.[0].uri); // Set the captured image URI
        // Handle further processing if needed (e.g., setting file type)
        setImageData(response?.assets?.[0]);
      }
    });
  };

  return {
    image,
    imageData,
    captureImage,
    chooseImageFromLibrary,
    chooseVideoFromLibrary: () => chooseImageFromLibrary('video'),
    chooseMediaFromLibrary: () => chooseImageFromLibrary('mixed'),
    setImageData,
    setImage,
  };
};

export default useImagePicker;
