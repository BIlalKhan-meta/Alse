import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import FastImage, {
  FastImageProps,
  ImageStyle as FastImageStyle,
  Priority,
  ResizeMode,
  Source,
} from 'react-native-fast-image';
import {images} from '../utils/images';
import {colors} from '../utils/theme';
import {changeUrlForData} from '../utils/helpers';

export type ImageSizeVariant = 'thumbnail' | 'medium' | 'full';

type MediaLike = {
  path?: string;
  thumbnail_path?: string;
  medium_path?: string;
  full_path?: string;
};

interface CustomeImageInterface {
  source?: Source | number;
  dummyImage?: number;
  variant?: ImageSizeVariant;
  media?: MediaLike;
  showPlaceholder?: boolean;
  resizeMode?: ResizeMode | 'contain' | 'cover' | 'stretch' | 'center';
  style?: StyleProp<ViewStyle | FastImageStyle>;
  onLoad?: FastImageProps['onLoad'];
  onError?: FastImageProps['onError'];
  onLoadEnd?: () => void;
  children?: React.ReactNode;
  testID?: string;
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

export function preloadRemoteImages(
  uris: Array<string | null | undefined>,
  priority: Priority = FastImage.priority.normal,
) {
  const sources = uris
    .map(uri => (uri ? changeUrlForData(uri) : ''))
    .filter(uri => Boolean(uri) && /^https?:\/\//.test(uri))
    .filter((uri, index, arr) => arr.indexOf(uri) === index)
    .map(uri => ({uri, priority}));

  if (sources.length === 0) {
    return;
  }
  try {
    FastImage.preload(sources);
  } catch (e) {
    console.warn('[CustomImage] preload failed', e);
  }
}

function resolveVariantUrl(
  media: MediaLike | undefined,
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

function mapResizeMode(
  mode: CustomeImageInterface['resizeMode'] = 'cover',
): ResizeMode {
  switch (mode) {
    case 'contain':
      return FastImage.resizeMode.contain;
    case 'stretch':
      return FastImage.resizeMode.stretch;
    case 'center':
      return FastImage.resizeMode.center;
    case 'cover':
    default:
      return FastImage.resizeMode.cover;
  }
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
  children,
  testID,
}: CustomeImageInterface) => {
  const uri = useMemo(() => {
    const raw =
      resolveVariantUrl(media, variant) ||
      (typeof source === 'object' && source && 'uri' in source
        ? source.uri
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
  const resolvedSource: Source | number =
    !uri && !source
      ? dummyImage
      : typeof source === 'number'
        ? source
        : remote && failed
          ? dummyImage
          : uri
            ? {
                uri,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }
            : typeof source === 'object' && source
              ? source
              : dummyImage;

  const showSpinner =
    showPlaceholder && remote && loading && !failed && showDelayedSpinner;

  return (
    <View style={[styles.wrap, style as ViewStyle]} testID={testID}>
      {showSpinner ? (
        <View style={styles.placeholder} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.themeColor} />
        </View>
      ) : null}
      <FastImage
        source={resolvedSource}
        onLoad={e => {
          markRemoteImageLoaded(uri);
          setLoading(false);
          onLoad?.(e);
          onLoadEnd?.();
        }}
        onError={() => {
          if (remote) {
            setFailed(true);
          }
          setLoading(false);
          onError?.();
          onLoadEnd?.();
        }}
        resizeMode={mapResizeMode(resizeMode)}
        style={styles.imageFill}>
        {children}
      </FastImage>
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
