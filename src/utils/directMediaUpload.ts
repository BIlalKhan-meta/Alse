import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {requestMediaPresign, MediaKeyPayload} from '../api/mediaUpload';

export type UploadProgressCallback = (percent: number) => void;

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

async function putWithProgress(
  uploadUrl: string,
  fileUri: string,
  headers: Record<string, string>,
  onProgress?: UploadProgressCallback,
): Promise<void> {
  const normalizedUri = fileUri.startsWith('file://')
    ? fileUri
    : fileUri.startsWith('/')
      ? `file://${fileUri}`
      : fileUri;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
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
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
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
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt === 1) {
        try {
          const {backgroundPutFile} = require('./backgroundUpload');
          await backgroundPutFile(uploadUrl, fileUri, headers);
          onProgress?.(100);
          return;
        } catch (bgError) {
          console.warn('[upload] background upload fallback to XHR', bgError);
        }
      }
      await putWithProgress(uploadUrl, fileUri, headers, onProgress);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastError;
}

export async function compressVideoIfNeeded(uri: string): Promise<string> {
  try {
    const {Video} = require('react-native-compressor');
    const compressed = await Video.compress(uri, {
      compressionMethod: 'auto',
      maxSize: 1280,
      bitrate: 2_500_000,
    });
    return compressed || uri;
  } catch (error) {
    console.warn('[upload] video compress skipped', error);
    return uri;
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

export async function ensureFileUriReadable(uri: string): Promise<string> {
  if (!uri) {
    return uri;
  }
  if (uri.startsWith('content://') || uri.startsWith('ph://')) {
    const dest = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.bin`;
    await RNFS.copyFile(uri, dest);
    return `file://${dest}`;
  }
  return uri;
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
  },
): Promise<MediaKeyPayload & {localThumbnail?: string | null}> {
  let uri = await ensureFileUriReadable(media.uri);
  if (media.kind === 'video') {
    uri = await compressVideoIfNeeded(uri);
  }

  const localThumbnail = await generateLocalUploadThumbnail(uri, media.kind);
  const extension = extensionFromUri(
    media.name || uri,
    media.kind === 'video' ? 'mp4' : 'jpg',
  );
  const contentType = contentTypeFor(media.kind, extension, media.type);

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

  await putWithRetry(
    upload.upload_url,
    uri,
    upload.headers || {'Content-Type': contentType},
    options?.onProgress,
  );

  return {
    key: upload.key,
    type: media.kind,
    filename: upload.filename || `${upload.key.split('/').pop()}`,
    localThumbnail,
  };
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
  },
): Promise<MediaKeyPayload[]> {
  const results: MediaKeyPayload[] = [];
  const total = mediaList.length || 1;

  for (let i = 0; i < mediaList.length; i++) {
    const base = Math.round((i / total) * 100);
    const span = Math.round(100 / total);
    const uploaded = await uploadMediaDirect(mediaList[i], {
      folder: options?.folder,
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
