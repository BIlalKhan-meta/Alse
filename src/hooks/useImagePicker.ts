import {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const useImagePicker = () => {
  const [image, setImage] = useState(null); // State to store the selected image URI
  const [imageData, setImageData] = useState(null);

  // Function to handle image selection from gallery
  const chooseImageFromLibrary = () => {
    let options = {
      mediaType: 'photo', // 'photo' or 'video'
      maxWidth: 300,
      maxHeight: 550,
      quality: 0.2,
    };

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
  const captureImage = (mediaType?: string) => {
    let options = {
      mediaType: mediaType || 'photo', // 'photo' or 'video'
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
      } else {
        setImage(response.assets?.[0].uri); // Set the captured image URI
        // Handle further processing if needed (e.g., setting file type)
        setImageData(response?.assets?.[0]);
      }
    });
  };

  return {image, imageData, captureImage, chooseImageFromLibrary, setImageData, setImage};
};

export default useImagePicker;