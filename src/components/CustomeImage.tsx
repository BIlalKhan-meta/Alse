import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import FastImage, {FastImageProps} from 'react-native-fast-image';
import {images} from '../utils/images';
import {colors} from '../utils/theme';

export type ImageSizeVariant = 'thumbnail' | 'medium' | 'full';

interface CustomeImageInterface extends Omit<ImageProps, 'source'> {
  source?: ImageProps['source'];
  dummyImage?: any;
  /** Prefer thumbnail/medium/full URL when media object provided */
  variant?: ImageSizeVariant;
  media?: {
    path?: string;
    thumbnail_path?: string;
    medium_path?: string;
    full_path?: string;
  };
  showPlaceholder?: boolean;
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

function resolveVariantUrl(
  media: CustomeImageInterface['media'],
  variant: ImageSizeVariant = 'medium',
): string | undefined {
  if (!media) {
    return undefined;
  }
  if (variant === 'thumbnail') {
    return media.thumbnail_path || media.medium_path || media.path || media.full_path;
  }
  if (variant === 'full') {
    return media.full_path || media.path || media.medium_path || media.thumbnail_path;
  }
  return media.medium_path || media.path || media.full_path || media.thumbnail_path;
}

const CustomImage = ({
  source,
  resizeMode = 'cover',
  style,
  dummyImage = images.profile,
  onError,
  variant = 'medium',
  media,
  showPlaceholder = true,
  ...props
}: CustomeImageInterface) => {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const variantUri = resolveVariantUrl(media, variant);
  const effectiveSource =
    variantUri != null
      ? {uri: variantUri}
      : source;

  const remote = isRemoteHttpUri(effectiveSource);

  useEffect(() => {
    setFailed(false);
    setLoading(true);
  }, [effectiveSource]);

  const resolvedSource =
    !effectiveSource
      ? dummyImage
      : typeof effectiveSource === 'number'
        ? effectiveSource
        : remote && failed
          ? dummyImage
          : effectiveSource;

  const fastResizeMode =
    resizeMode === 'contain'
      ? FastImage.resizeMode.contain
      : resizeMode === 'stretch'
        ? FastImage.resizeMode.stretch
        : resizeMode === 'center'
          ? FastImage.resizeMode.center
          : FastImage.resizeMode.cover;

  if (remote && !failed && typeof resolvedSource === 'object' && 'uri' in resolvedSource) {
    return (
      <View style={[styles.wrap, style as ViewStyle]}>
        {showPlaceholder && loading ? (
          <View style={styles.placeholder}>
            <ActivityIndicator size="small" color={colors.themeColor} />
          </View>
        ) : null}
        <FastImage
          {...(props as FastImageProps)}
          style={[StyleSheet.absoluteFillObject, style as any]}
          source={{
            uri: (resolvedSource as {uri: string}).uri,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={fastResizeMode}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setFailed(true);
            setLoading(false);
            onError?.({} as any);
          }}
        />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF1F4',
    zIndex: 1,
  },
});

export default CustomImage;
