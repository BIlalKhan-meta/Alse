import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {requestMediaPresign, MediaKeyPayload} from '../api/mediaUpload';
import {prepareVideoUriForUpload} from './helpers';

export type UploadProgressCallback = (percent: number) => void;

/** Matches CreateReel / backend practical limit — oversized files OOM low-heap Android. */
export const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function extensionFromUri(uri: string, fallback: string): string {
  const clean = uri.split('?')[0] || '';
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return (match?.[1] || fallback).toLowerCase();
}

function contentTypeFor(
  kind: 'image' | 'video',
  extension: string,
  explicit?: string,
): string {
  if (explicit) {
    return explicit;
  }
  if (kind === 'video') {
    return extension === 'mov' ? 'video/quicktime' : 'video/mp4';
  }
  if (extension === 'png') {
    return 'image/png';
  }
  if (extension === 'gif') {
    return 'image/gif';
  }
  if (extension === 'webp') {
    return 'image/webp';
  }
  return 'image/jpeg';
}

function toFilePath(fileUri: string): string {
  if (!fileUri) {
    return fileUri;
  }
  if (fileUri.startsWith('file://')) {
    return fileUri.replace(/^file:\/\//, '');
  }
  return fileUri;
}

function toFileUri(fileUri: string): string {
  if (!fileUri) {
    return fileUri;
  }
  if (fileUri.startsWith('file://') || fileUri.startsWith('content://')) {
    return fileUri;
  }
  if (fileUri.startsWith('/')) {
    return `file://${fileUri}`;
  }
  return fileUri;
}

function isAbortError(error: unknown): boolean {
  return (
    (error as Error)?.name === 'AbortError' ||
    (error as DOMException)?.name === 'AbortError'
  );
}

function isTransientNetworkError(error: unknown): boolean {
  const message = String((error as Error)?.message || '').toLowerCase();
  return (
    message.includes('network request failed') ||
    message.includes('network error') ||
    message.includes('failed to connect') ||
    message.includes('timed out') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('socket')
  );
}

export function toFriendlyUploadError(error: unknown): Error {
  if (isAbortError(error)) {
    return error as Error;
  }
  const original = String((error as Error)?.message || '');
  if (isTransientNetworkError(error)) {
    return new Error(
      'Upload failed due to a network issue. Please check your connection and try again.',
    );
  }
  if (!original) {
    return new Error('Upload failed. Please try again.');
  }
  return error instanceof Error ? error : new Error(original);
}

async function assertReadableFile(fileUri: string): Promise<string> {
  const path = toFilePath(fileUri);
  const exists = await RNFS.exists(path);
  if (!exists) {
    throw new Error('Media file not found on device. Please reselect and try again.');
  }
  const stat = await RNFS.stat(path).catch(() => null);
  if (!stat?.size || Number(stat.size) <= 0) {
    throw new Error('Media file is empty or unreadable. Please reselect and try again.');
  }
  return path;
}

async function putWithBlobUtil(
  uploadUrl: string,
  fileUri: string,
  headers: Record<string, string>,
  onProgress?: UploadProgressCallback,
  signal?: AbortSignal,
): Promise<void> {
  const ReactNativeBlobUtil = require('react-native-blob-util').default;
  const path = await assertReadableFile(fileUri);

  if (signal?.aborted) {
    throw new DOMException('Upload cancelled', 'AbortError');
  }

  const task = ReactNativeBlobUtil.config({
    timeout: 5 * 60 * 1000,
    fileCache: false,
  }).fetch('PUT', uploadUrl, headers || {}, ReactNativeBlobUtil.wrap(path));

  const abortUpload = () => {
    try {
      task.cancel?.();
    } catch (_) {}
  };
  signal?.addEventListener('abort', abortUpload, {once: true});

  try {
    if (typeof task.uploadProgress === 'function') {
      task.uploadProgress({interval: 300}, (written: number, total: number) => {
        if (!onProgress || !total || total <= 0) {
          return;
        }
        onProgress(Math.min(99, Math.round((written / total) * 100)));
      });
    }

    const response = await task;
    if (signal?.aborted) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }

    const status = Number(response?.info?.()?.status ?? response?.respInfo?.status ?? 0);
    if (status >= 200 && status < 300) {
      onProgress?.(100);
      return;
    }
    throw new Error(`Upload failed with status ${status || 'unknown'}`);
  } catch (error) {
    if (signal?.aborted || isAbortError(error)) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }
    throw error;
  } finally {
    signal?.removeEventListener('abort', abortUpload);
  }
}

async function putWithProgress(
  uploadUrl: string,
  fileUri: string,
  headers: Record<string, string>,
  onProgress?: UploadProgressCallback,
  signal?: AbortSignal,
): Promise<void> {
  const normalizedUri = toFileUri(fileUri);
  await assertReadableFile(normalizedUri);

  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Upload cancelled', 'AbortError'));
      return;
    }

    const xhr = new XMLHttpRequest();
    const abortUpload = () => xhr.abort();
    signal?.addEventListener('abort', abortUpload, {once: true});
    xhr.open('PUT', uploadUrl);
    Object.entries(headers || {}).forEach(([key, value]) => {
      if (value) {
        xhr.setRequestHeader(key, value);
      }
    });
    xhr.timeout = 5 * 60 * 1000;
    xhr.upload.onprogress = event => {
      if (!onProgress || !event.lengthComputable || event.total <= 0) {
        return;
      }
      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => {
      signal?.removeEventListener('abort', abortUpload);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => {
      signal?.removeEventListener('abort', abortUpload);
      reject(new Error('Network request failed'));
    };
    xhr.ontimeout = () => {
      signal?.removeEventListener('abort', abortUpload);
      reject(new Error('Upload timed out'));
    };
    xhr.onabort = () => {
      signal?.removeEventListener('abort', abortUpload);
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };
    xhr.send({
      uri: normalizedUri,
      type: headers['Content-Type'] || 'application/octet-stream',
      name: 'upload',
    } as any);
  });
}

async function putWithRetry(
  uploadUrl: string,
  fileUri: string,
  headers: Record<string, string>,
  onProgress?: UploadProgressCallback,
  maxAttempts: number = 3,
  signal?: AbortSignal,
): Promise<void> {
  let lastError: unknown;
  const path = await assertReadableFile(fileUri);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }

    // Prefer blob-util for large video PUTs — XHR {uri} often throws
    // "Network request failed" on Android for bigger files.
    try {
      await putWithBlobUtil(uploadUrl, path, headers, onProgress, signal);
      return;
    } catch (blobError) {
      if (signal?.aborted || isAbortError(blobError)) {
        throw blobError;
      }
      lastError = blobError;
      console.warn('[upload] blob-util PUT failed, trying fallbacks', blobError);
    }

    // Skip react-native-background-upload on Android: its uploadservice
    // GlobalRequestObserver registers a BroadcastReceiver without
    // RECEIVER_NOT_EXPORTED and crashes API 33+ (ALSE-X SecurityException).
    if (attempt === 1 && Platform.OS !== 'android') {
      try {
        const {backgroundPutFile} = require('./backgroundUpload');
        await backgroundPutFile(
          uploadUrl,
          path,
          headers,
          signal,
          onProgress,
        );
        onProgress?.(100);
        return;
      } catch (bgError) {
        if (signal?.aborted || isAbortError(bgError)) {
          throw bgError;
        }
        lastError = bgError;
        console.warn('[upload] background upload fallback to XHR', bgError);
      }
    }

    try {
      await putWithProgress(uploadUrl, path, headers, onProgress, signal);
      return;
    } catch (error) {
      if (signal?.aborted || isAbortError(error)) {
        throw error;
      }
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(1000 * attempt);
      }
    }
  }

  throw toFriendlyUploadError(lastError);
}

export async function compressVideoIfNeeded(uri: string): Promise<string> {
  try {
    // Skip compress on very low-heap Android — LocationExtractor/encode OOM
    // at 128MB growth limit (ALSE-22). Upload original instead.
    if (Platform.OS === 'android') {
      try {
        const DeviceInfo = require('react-native-device-info');
        const totalMem = await DeviceInfo.getTotalMemory?.();
        if (typeof totalMem === 'number' && totalMem > 0 && totalMem < 2.5e9) {
          console.warn('[upload] skip compress on low-RAM device');
          return toFileUri(uri);
        }
      } catch {
        // device-info optional
      }
    }

    const {Video} = require('react-native-compressor');
    // Conservative settings for low-heap Android (128MB devices OOM during encode).
    const compressed = await Video.compress(uri, {
      compressionMethod: 'manual',
      maxSize: Platform.OS === 'android' ? 720 : 1280,
      bitrate: Platform.OS === 'android' ? 1_000_000 : 2_500_000,
      minimumFileSizeForCompress: 8,
    });
    const nextUri = compressed || uri;
    return toFileUri(nextUri);
  } catch (error) {
    console.warn('[upload] video compress skipped', error);
    return toFileUri(uri);
  }
}

async function assertVideoUnderSizeLimit(uri: string): Promise<void> {
  const path = toFilePath(uri);
  const stat = await RNFS.stat(path).catch(() => null);
  if (stat?.size && Number(stat.size) > MAX_VIDEO_UPLOAD_BYTES) {
    throw new Error(
      'Video must be smaller than 100 MB. Please trim or compress it before uploading.',
    );
  }
}

export async function generateLocalUploadThumbnail(
  uri: string,
  kind: 'image' | 'video',
): Promise<string | null> {
  if (kind === 'image') {
    return uri;
  }
  return null;
}

export async function ensureFileUriReadable(
  uri: string,
  kind: 'image' | 'video' = 'image',
): Promise<string> {
  if (!uri) {
    return uri;
  }
  if (kind === 'video') {
    return prepareVideoUriForUpload(uri);
  }
  if (uri.startsWith('content://') || uri.startsWith('ph://')) {
    const dest = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.jpg`;
    await RNFS.copyFile(uri, dest);
    return `file://${dest}`;
  }
  return toFileUri(uri);
}

export async function uploadMediaDirect(
  media: {
    uri: string;
    kind: 'image' | 'video';
    name?: string;
    type?: string;
  },
  options?: {
    folder?: 'posts' | 'stories' | 'videos';
    onProgress?: UploadProgressCallback;
    signal?: AbortSignal;
  },
): Promise<MediaKeyPayload & {localThumbnail?: string | null}> {
  let uri = await ensureFileUriReadable(media.uri, media.kind);
  if (media.kind === 'video') {
    if (options?.signal?.aborted) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }
    uri = await compressVideoIfNeeded(uri);
    await assertVideoUnderSizeLimit(uri);
  }
  await assertReadableFile(uri);

  const localThumbnail = await generateLocalUploadThumbnail(uri, media.kind);
  const extension = extensionFromUri(
    media.name || uri,
    media.kind === 'video' ? 'mp4' : 'jpg',
  );
  const contentType = contentTypeFor(media.kind, extension, media.type);

  let lastError: unknown;
  const maxPresignAttempts = media.kind === 'video' ? 2 : 1;

  for (let attempt = 1; attempt <= maxPresignAttempts; attempt++) {
    if (options?.signal?.aborted) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }

    try {
      const presignRes = await requestMediaPresign({
        content_type: contentType,
        extension,
        folder: options?.folder ?? 'posts',
        filename_prefix: media.kind === 'video' ? 'PostVid' : 'PostImg',
        count: 1,
      });

      const upload: any =
        presignRes?.data?.data?.uploads?.[0] ??
        presignRes?.data?.uploads?.[0];
      if (!upload?.upload_url || !upload?.key) {
        throw new Error('Failed to get upload URL');
      }

      // Only send headers the server signed — avoid spoiling S3 signature.
      const signedHeaders: Record<string, string> = {
        ...(upload.headers || {}),
      };
      if (!signedHeaders['Content-Type'] && !signedHeaders['content-type']) {
        signedHeaders['Content-Type'] = contentType;
      }

      await putWithRetry(
        upload.upload_url,
        uri,
        signedHeaders,
        options?.onProgress,
        media.kind === 'video' ? 3 : 2,
        options?.signal,
      );

      return {
        key: upload.key,
        type: media.kind,
        filename: upload.filename || `${upload.key.split('/').pop()}`,
        localThumbnail,
      };
    } catch (error) {
      if (options?.signal?.aborted || isAbortError(error)) {
        throw error;
      }
      lastError = error;
      if (attempt < maxPresignAttempts && isTransientNetworkError(error)) {
        console.warn(
          `[upload] transient failure, refreshing presign (attempt ${attempt})`,
          error,
        );
        await sleep(1200 * attempt);
        continue;
      }
      throw toFriendlyUploadError(error);
    }
  }

  throw toFriendlyUploadError(lastError);
}

export async function uploadMediaListDirect(
  mediaList: Array<{
    uri: string;
    kind: 'image' | 'video';
    name?: string;
    type?: string;
  }>,
  options?: {
    folder?: 'posts' | 'stories' | 'videos';
    onProgress?: UploadProgressCallback;
    signal?: AbortSignal;
  },
): Promise<MediaKeyPayload[]> {
  const results: MediaKeyPayload[] = [];
  const total = mediaList.length || 1;

  for (let i = 0; i < mediaList.length; i++) {
    if (options?.signal?.aborted) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }
    const base = Math.round((i / total) * 100);
    const span = Math.round(100 / total);
    const uploaded = await uploadMediaDirect(mediaList[i], {
      folder: options?.folder,
      signal: options?.signal,
      onProgress: percent => {
        options?.onProgress?.(
          Math.min(99, base + Math.round((percent / 100) * span)),
        );
      },
    });
    results.push({
      key: uploaded.key,
      type: uploaded.type,
      filename: uploaded.filename,
    });
  }

  options?.onProgress?.(100);
  return results;
}

export function supportsBackgroundUploadHint(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
