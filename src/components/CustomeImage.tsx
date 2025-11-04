import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  ImageProps,
} from 'react-native';
import {images} from '../utils/images';

interface CustomeImageInterface extends ImageProps {
  dummyImage?: any;
}

const CustomImage = ({
  source,
  resizeMode = 'cover',
  style,
  dummyImage = images.profile,
  ...props
}: CustomeImageInterface) => {
  const [validUrl, setValidUrl] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkImage = async () => {
      try {
        // Only check if it's a URI source
        if (source && typeof source === 'object' && source.uri) {
          const response = await fetch(source.uri, {method: 'HEAD'});
          // If status is 200 and content-type starts with "image/", it's valid
          if (
            response.ok &&
            response.headers.get('Content-Type')?.startsWith('image/')
          ) {
            setValidUrl(true);
          } else {
            setValidUrl(false);
          }
        } else {
          setValidUrl(false);
        }
      } catch (error) {
        setValidUrl(false);
      } finally {
        setChecking(false);
      }
    };

    checkImage();
  }, [source]);

  if (checking) {
    return (
      <View style={[style, styles.center]}>
        <ActivityIndicator size="small" color="#888" />
      </View>
    );
  }

  return (
    <Image
      {...props}
      source={validUrl ? source : dummyImage}
      resizeMode={resizeMode}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
});

export default CustomImage;
