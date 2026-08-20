import {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const useImagePicker = () => {
  const [image, setImage] = useState<any>(null); // State to store the selected image URI
  const [imageData, setImageData] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<any>(false);
  const [pendingMedia, setPendingMedia] = useState<any>(null);

  const MAX_STORY_VIDEO_DURATION = 30;

  let globalOptions = {
    mediaType: 'photo', // 'photo' or 'video' or 'mixed'
    maxWidth: 4096,
    maxHeight: 4096,
    quality: 1,
  };

  // Function to handle image selection from gallery
  const chooseImageFromLibrary = (mediaType = 'photo', showPreview = false) => {
    let options: any = {
      ...globalOptions,
      mediaType: mediaType, // 'photo' or 'video' or 'mixed'
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

  const chooseFromLibrary = async (
    mediaType = 'photo',
    showPreview = false,
  ) => {
    let options: any = {
      ...globalOptions,
      mediaType: mediaType,
    };

    try {
      const response: any = await new Promise((resolve, reject) => {
        launchImageLibrary(options, res => {
          if (res.didCancel) return resolve(null);
          if (res.errorCode)
            return reject(res.errorMessage || 'Image picker error');
          resolve(res);
        });
      });

      if (!response || !response.assets?.[0]) {
        return null;
      }

      const asset = response.assets[0];

      if (showPreview) {
        setPendingMedia(asset);
        setPreviewMode(true);
      } else {
        setImage(asset.uri);
        setImageData(asset);
      }

      return asset; // return selected media
    } catch (error) {
      console.log('Image picker error:', error);
      return null;
    }
  };

  // Function to capture image using the camera
  const captureImage = (mediaType = 'photo', showPreview = false) => {
    const isVideoOrMixed =
      mediaType === 'video' || mediaType === 'mixed';
    let options: any = {
      mediaType: mediaType, // 'photo' or 'video' or 'mixed'
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.92,
    };
    if (isVideoOrMixed) {
      options.durationLimit = MAX_STORY_VIDEO_DURATION;
    }

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
    chooseFromLibrary,
  };
};

export default useImagePicker;
