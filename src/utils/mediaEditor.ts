import ImageEditor from '@react-native-community/image-editor';
import {Image, InteractionManager, NativeEventEmitter, NativeModules, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import {captureRef} from 'react-native-view-shot';
import {showEditor} from 'react-native-video-trim';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import {CropAspect} from '../types/mediaEditor';

export type ImageDimensions = {width: number; height: number};

export type CropTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export const CARD_PREVIEW_WIDTH = 320;
export const CARD_PREVIEW_HEIGHT = 400;

export function aspectToRatio(aspect: CropAspect): number | null {
  switch (aspect) {
    case '1:1':
      return 1;
    case '4:5':
      return 4 / 5;
    case '16:9':
      return 16 / 9;
    default:
      return null;
  }
}

export function getCropFrameSize(
  aspect: CropAspect,
  cardWidth: number,
  cardHeight: number,
): {width: number; height: number} {
  const ratio = aspectToRatio(aspect);
  if (!ratio) {
    return {width: cardWidth, height: cardHeight};
  }

  let width = cardWidth;
  let height = width / ratio;

  if (height > cardHeight) {
    height = cardHeight;
    width = height * ratio;
  }

  return {width, height};
}

export async function getImageDimensions(uri: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({width, height}),
      error => reject(error),
    );
  });
}

export function getContainBaseSize(
  imageSize: ImageDimensions,
  cardWidth: number,
  cardHeight: number,
): ImageDimensions {
  const imageAspect = imageSize.width / imageSize.height;
  const cardAspect = cardWidth / cardHeight;

  if (imageAspect > cardAspect) {
    return {
      width: cardWidth,
      height: cardWidth / imageAspect,
    };
  }

  return {
    width: cardHeight * imageAspect,
    height: cardHeight,
  };
}

export function computeCropRect(
  imageSize: ImageDimensions,
  cardSize: ImageDimensions,
  cropFrame: ImageDimensions,
  transform: CropTransform,
  baseSize?: ImageDimensions,
): {offset: {x: number; y: number}; size: {width: number; height: number}} {
  const containBase =
    baseSize ?? getContainBaseSize(imageSize, cardSize.width, cardSize.height);
  const {scale, offsetX, offsetY} = transform;

  const displayedWidth = containBase.width * scale;
  const displayedHeight = containBase.height * scale;

  const imageLeft = (cardSize.width - displayedWidth) / 2 + offsetX;
  const imageTop = (cardSize.height - displayedHeight) / 2 + offsetY;

  const cropLeft = (cardSize.width - cropFrame.width) / 2;
  const cropTop = (cardSize.height - cropFrame.height) / 2;

  const relativeX = (cropLeft - imageLeft) / displayedWidth;
  const relativeY = (cropTop - imageTop) / displayedHeight;
  const relativeW = cropFrame.width / displayedWidth;
  const relativeH = cropFrame.height / displayedHeight;

  const x = Math.max(
    0,
    Math.min(imageSize.width, relativeX * imageSize.width),
  );
  const y = Math.max(
    0,
    Math.min(imageSize.height, relativeY * imageSize.height),
  );
  const width = Math.max(
    1,
    Math.min(imageSize.width - x, relativeW * imageSize.width),
  );
  const height = Math.max(
    1,
    Math.min(imageSize.height - y, relativeH * imageSize.height),
  );

  return {
    offset: {x: Math.round(x), y: Math.round(y)},
    size: {width: Math.round(width), height: Math.round(height)},
  };
}

export async function applyImageCrop(
  uri: string,
  cropRect: {offset: {x: number; y: number}; size: {width: number; height: number}},
): Promise<string> {
  const result = await ImageEditor.cropImage(uri, cropRect);
  return result.uri;
}

export async function capturePreviewAsImage(
  viewRef: RefObject<View | null>,
): Promise<string> {
  const uri = await captureRef(viewRef, {
    format: 'jpg',
    quality: 0.92,
    result: 'tmpfile',
  });
  return Platform.OS === 'android' ? uri : uri.replace('file://', '');
}

type ResolvedImagePath = {
  path: string;
  cleanup?: () => Promise<void>;
};

export async function resolveLocalImagePath(
  uri: string,
): Promise<ResolvedImagePath> {
  if (!uri) {
    throw new Error('Missing image uri');
  }

  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const dest = `${RNFS.CachesDirectoryPath}/crop-source-${Date.now()}.jpg`;
    const download = await RNFS.downloadFile({fromUrl: uri, toFile: dest}).promise;
    if (download.statusCode && download.statusCode >= 400) {
      throw new Error('Could not download image for cropping');
    }
    return {
      path: dest,
      cleanup: () => RNFS.unlink(dest).catch(() => {}),
    };
  }

  if (
    Platform.OS === 'ios' &&
    (uri.startsWith('ph://') || uri.startsWith('assets-library://'))
  ) {
    const dimensions = await getImageDimensions(uri);
    const dest = `${RNFS.CachesDirectoryPath}/crop-source-${Date.now()}.jpg`;
    await RNFS.copyAssetsFileIOS(
      uri,
      dest,
      dimensions.width,
      dimensions.height,
    );
    return {
      path: dest,
      cleanup: () => RNFS.unlink(dest).catch(() => {}),
    };
  }

  if (Platform.OS === 'android' && uri.startsWith('content://')) {
    const dest = `${RNFS.CachesDirectoryPath}/crop-source-${Date.now()}.jpg`;
    await RNFS.copyFile(uri, dest);
    return {
      path: dest,
      cleanup: () => RNFS.unlink(dest).catch(() => {}),
    };
  }

  const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
  return {path};
}

export async function openNativeImageCropper(
  uri: string,
): Promise<string | null> {
  let resolved: ResolvedImagePath | null = null;

  try {
    await new Promise<void>(resolve => {
      InteractionManager.runAfterInteractions(() => resolve());
    });

    resolved = await resolveLocalImagePath(uri);
    const result = await ImagePicker.openCropper({
      path: resolved.path,
      mediaType: 'photo',
      cropping: true,
      freeStyleCropEnabled: true,
      compressImageQuality: 0.92,
      avoidEmptySpaceAroundImage: true,
    });

    if (!result?.path) {
      return null;
    }

    if (Platform.OS === 'android') {
      return result.path.startsWith('file://')
        ? result.path
        : `file://${result.path}`;
    }

    return result.path.startsWith('file://')
      ? result.path
      : `file://${result.path}`;
  } catch (error: any) {
    if (error?.code === 'E_PICKER_CANCELLED') {
      return null;
    }
    throw error;
  } finally {
    if (resolved?.cleanup) {
      await resolved.cleanup();
    }
  }
}

export async function exportImageMedia(options: {
  uri: string;
  hasTextOverlay: boolean;
  previewRef: RefObject<View | null>;
}): Promise<{uri: string; width?: number; height?: number}> {
  if (options.hasTextOverlay && options.previewRef.current) {
    const capturedUri = await capturePreviewAsImage(options.previewRef);
    return {uri: capturedUri};
  }

  const dimensions = await getImageDimensions(
    options.uri.startsWith('file://') ? options.uri : `file://${options.uri}`,
  ).catch(() => null);

  return {
    uri: options.uri,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

export type VideoEditorPostResult = {
  success: boolean;
  exportedUri?: string;
  error?: string;
};

export async function openVideoEditorForPost(
  sourceUri: string,
): Promise<VideoEditorPostResult> {
  const VideoTrimModule = NativeModules.VideoTrim;
  if (!VideoTrimModule) {
    return {
      success: false,
      error: 'Video trim module is not linked. Rebuild the native app.',
    };
  }

  return new Promise(resolve => {
    const emitter = new NativeEventEmitter(VideoTrimModule);
    let settled = false;

    const finish = (result: VideoEditorPostResult) => {
      if (settled) {
        return;
      }
      settled = true;
      subscription.remove();
      resolve(result);
    };

    const subscription = emitter.addListener('VideoTrim', (event: any) => {
      const name = event?.name;
      if (name === 'onFinishTrimming' && event.outputPath) {
        finish({success: true, exportedUri: event.outputPath});
        return;
      }
      if (name === 'onError') {
        finish({
          success: false,
          error: event.message ?? 'Video editing failed',
        });
        return;
      }
      if (name === 'onCancel' || name === 'onCancelTrimming') {
        finish({success: false, error: 'User cancelled'});
      }
    });

    try {
      showEditor(sourceUri, {
        headerText: 'Edit Video',
        trimmerColor: '#20B2AA',
        theme: 'light',
        saveToPhoto: false,
        openShareSheetOnFinish: false,
      });
    } catch (error: any) {
      finish({
        success: false,
        error: error?.message ?? 'Failed to open video editor',
      });
    }
  });
}
