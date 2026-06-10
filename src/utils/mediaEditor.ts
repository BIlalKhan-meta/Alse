import ImageEditor from '@react-native-community/image-editor';
import {Image, NativeEventEmitter, NativeModules, Platform} from 'react-native';
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

export function computeCropRect(
  imageSize: ImageDimensions,
  cardSize: ImageDimensions,
  cropFrame: ImageDimensions,
  transform: CropTransform,
): {offset: {x: number; y: number}; size: {width: number; height: number}} {
  const {scale, offsetX, offsetY} = transform;
  const displayedWidth = imageSize.width * scale;
  const displayedHeight = imageSize.height * scale;

  const imageLeft = (cardSize.width - displayedWidth) / 2 + offsetX;
  const imageTop = (cardSize.height - displayedHeight) / 2 + offsetY;

  const cropLeft = (cardSize.width - cropFrame.width) / 2;
  const cropTop = (cardSize.height - cropFrame.height) / 2;

  const relativeX = (cropLeft - imageLeft) / displayedWidth;
  const relativeY = (cropTop - imageTop) / displayedHeight;
  const relativeW = cropFrame.width / displayedWidth;
  const relativeH = cropFrame.height / displayedHeight;

  const x = Math.max(0, Math.min(imageSize.width, relativeX * imageSize.width));
  const y = Math.max(0, Math.min(imageSize.height, relativeY * imageSize.height));
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

export async function exportImageMedia(options: {
  uri: string;
  aspect: CropAspect;
  transform: CropTransform;
  hasTextOverlay: boolean;
  previewRef: RefObject<View | null>;
  cardWidth?: number;
  cardHeight?: number;
}): Promise<{uri: string; width?: number; height?: number}> {
  const cardWidth = options.cardWidth ?? CARD_PREVIEW_WIDTH;
  const cardHeight = options.cardHeight ?? CARD_PREVIEW_HEIGHT;

  if (options.hasTextOverlay && options.previewRef.current) {
    const capturedUri = await capturePreviewAsImage(options.previewRef);
    return {uri: capturedUri};
  }

  if (options.aspect !== 'original') {
    const imageSize = await getImageDimensions(options.uri);
    const cropFrame = getCropFrameSize(options.aspect, cardWidth, cardHeight);
    const cropRect = computeCropRect(
      imageSize,
      {width: cardWidth, height: cardHeight},
      cropFrame,
      options.transform,
    );
    const workingUri = await applyImageCrop(options.uri, cropRect);
    const dimensions = await getImageDimensions(
      workingUri.startsWith('file://') ? workingUri : `file://${workingUri}`,
    ).catch(() => null);
    return {
      uri: workingUri,
      width: dimensions?.width,
      height: dimensions?.height,
    };
  }

  return {uri: options.uri};
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
