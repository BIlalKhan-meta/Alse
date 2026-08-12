import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {images} from '../utils/images';
import {colors} from '../utils/theme';
import {changeUrlForData} from '../utils/helpers';

export type ImageSizeVariant = 'thumbnail' | 'medium' | 'full';

interface CustomeImageInterface extends Omit<ImageProps, 'source'> {
  source?: ImageProps['source'];
  dummyImage?: any;
  variant?: ImageSizeVariant;
  media?: {
    path?: string;
    thumbnail_path?: string;
    medium_path?: string;
    full_path?: string;
  };
  showPlaceholder?: boolean;
}

const loadedRemoteUris = new Set<string>();

export function markRemoteImageLoaded(uri?: string | null) {
  if (uri) {
    loadedRemoteUris.add(uri);
  }
}

export function isRemoteImageLoaded(uri?: string | null): boolean {
  return Boolean(uri && loadedRemoteUris.has(uri));
}

function resolveVariantUrl(
  media: CustomeImageInterface['media'],
  variant: ImageSizeVariant = 'medium',
): string | undefined {
  if (!media) {
    return undefined;
  }
  const path = media.path || media.full_path;
  if (variant === 'thumbnail') {
    return media.thumbnail_path || media.medium_path || path;
  }
  if (variant === 'full') {
    return media.full_path || path || media.medium_path || media.thumbnail_path;
  }
  return media.medium_path || path || media.full_path || media.thumbnail_path;
}

const CustomImage = ({
  source,
  resizeMode = 'cover',
  style,
  dummyImage = images.profile,
  onError,
  onLoad,
  onLoadEnd,
  variant = 'medium',
  media,
  showPlaceholder = true,
  ...props
}: CustomeImageInterface) => {
  const uri = useMemo(() => {
    const raw =
      resolveVariantUrl(media, variant) ||
      (typeof source === 'object' && source && 'uri' in source
        ? (source as {uri?: string}).uri
        : undefined);
    if (!raw) {
      return undefined;
    }
    return changeUrlForData(raw);
  }, [media, variant, source]);

  const alreadyLoaded = Boolean(uri && loadedRemoteUris.has(uri));
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(uri) && !alreadyLoaded);
  const [showDelayedSpinner, setShowDelayedSpinner] = useState(false);

  useEffect(() => {
    const cached = Boolean(uri && loadedRemoteUris.has(uri));
    setFailed(false);
    setLoading(Boolean(uri) && !cached);
    setShowDelayedSpinner(false);
  }, [uri]);

  useEffect(() => {
    if (!loading) {
      setShowDelayedSpinner(false);
      return;
    }
    const timer = setTimeout(() => setShowDelayedSpinner(true), 250);
    return () => clearTimeout(timer);
  }, [loading]);

  const remote = Boolean(uri) && /^https?:\/\//.test(uri || '');
  const resolvedSource =
    !uri && !source
      ? dummyImage
      : typeof source === 'number'
        ? source
        : remote && failed
          ? dummyImage
          : uri
            ? {uri}
            : source;

  const showSpinner =
    showPlaceholder && remote && loading && !failed && showDelayedSpinner;

  return (
    <View style={[styles.wrap, style as ViewStyle]}>
      {showSpinner ? (
        <View style={styles.placeholder} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.themeColor} />
        </View>
      ) : null}
      <Image
        {...props}
        source={resolvedSource}
        onLoad={e => {
          markRemoteImageLoaded(uri);
          setLoading(false);
          onLoad?.(e);
        }}
        onLoadEnd={() => {
          markRemoteImageLoaded(uri);
          setLoading(false);
          onLoadEnd?.({} as any);
        }}
        onError={e => {
          if (remote) {
            setFailed(true);
          }
          setLoading(false);
          onError?.(e);
        }}
        resizeMode={resizeMode}
        style={styles.imageFill}
        fadeDuration={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  imageFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
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
