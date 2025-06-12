import {useEffect, useRef} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

export default function AddStory() {
  const device = useCameraDevice('front');
  const {hasPermission} = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      getPermissions();
    }
  }, [hasPermission]);

  const getPermissions = async () => {
    await Camera.requestCameraPermission();
    await Camera.requestMicrophonePermission();
  };

  if (!hasPermission)
    return (
      <SafeAreaView>
        <Text>Don't have permissions :(</Text>
      </SafeAreaView>
    );
  if (device == null)
    return (
      <SafeAreaView>
        <Text>No Camera found</Text>
      </SafeAreaView>
    );

  const camera = useRef<Camera>(null);

  return (
    <Camera
      ref={camera}
      video={true}
      photo={true}
      audio={true}
      device={device}
      isActive={true}
    />
  );
}
