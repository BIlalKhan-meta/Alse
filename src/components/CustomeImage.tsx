import React, {useEffect, useState} from 'react';
import {Image, ImageProps} from 'react-native';
import {images} from '../utils/images';

interface CustomeImageInterface extends ImageProps {
  dummyImage?: any;
}

function isRemoteHttpUri(source: ImageProps['source']): boolean {
  return (
    !!source &&
    typeof source === 'object' &&
    'uri' in source &&
    typeof (source as {uri: string}).uri === 'string' &&
    /^https?:\/\//.test((source as {uri: string}).uri)
  );
}

const CustomImage = ({
  source,
  resizeMode = 'cover',
  style,
  dummyImage = images.profile,
  onError,
  ...props
}: CustomeImageInterface) => {
  const [failed, setFailed] = useState(false);
  const remote = isRemoteHttpUri(source);

  useEffect(() => {
    setFailed(false);
  }, [source]);

  const resolvedSource =
    !source
      ? dummyImage
      : typeof source === 'number'
        ? source
        : remote && failed
          ? dummyImage
          : source;

  return (
    <Image
      {...props}
      source={resolvedSource}
      onError={e => {
        if (remote) {
          setFailed(true);
        }
        onError?.(e);
      }}
      resizeMode={resizeMode}
      style={style}
    />
  );
};

export default CustomImage;
