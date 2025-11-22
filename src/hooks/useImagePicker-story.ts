import {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const useImagePicker = () => {
  const [image, setImage] = useState<any>(null); // State to store the selected image URI
  const [imageData, setImageData] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<any>(false);
  const [pendingMedia, setPendingMedia] = useState<any>(null);

  // Function to handle image selection from gallery
  const chooseImageFromLibrary = (mediaType = 'photo', showPreview = false) => {
    let options: any = {
      mediaType: mediaType, // 'photo' or 'video' or 'mixed'
      maxWidth: 300,
      maxHeight: 550,
      quality: 0.2,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode == 'permission') {
        console.log('Permission not satisfied');
      } else if (response.assets?.[0]) {
        if (showPreview) {
          // Store media in pending state for preview
          setPendingMedia(response.assets[0]);
          setPreviewMode(true);
        } else {
          // Direct upload without preview
          setImage(response?.assets[0]?.uri);
          setImageData(response?.assets[0]);
        }
      }
    });
  };

  // Function to capture image using the camera
  const captureImage = (mediaType = 'photo', showPreview = false) => {
    let options = {
      mediaType: mediaType, // 'photo' or 'video' or 'mixed'
      maxWidth: 300,
      maxHeight: 550,
      quality: 0.2,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode == 'camera_unavailable') {
        console.log('Camera not available on device');
      } else if (response.errorCode == 'permission') {
        console.log('Permission not satisfied');
      } else if (response.assets?.[0]) {
        if (showPreview) {
          // Store media in pending state for preview
          setPendingMedia(response.assets[0]);
          setPreviewMode(true);
        } else {
          // Direct upload without preview
          setImage(response.assets[0].uri);
          setImageData(response.assets[0]);
        }
      }
    });
  };

  // Confirm media after preview
  const confirmMedia = () => {
    if (pendingMedia) {
      setImage(pendingMedia.uri);
      setImageData(pendingMedia);
      setPendingMedia(null);
      setPreviewMode(false);
    }
  };

  // Cancel media selection
  const cancelMedia = () => {
    setPendingMedia(null);
    setPreviewMode(false);
  };

  return {
    image,
    imageData,
    captureImage,
    chooseImageFromLibrary,
    setImageData,
    setImage,
    // Preview related
    previewMode,
    pendingMedia,
    confirmMedia,
    cancelMedia,
  };
};

export default useImagePicker;
