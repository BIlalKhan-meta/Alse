import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import {keepLocalCopy} from '@react-native-documents/picker';
import {convertImageToVideo} from 'react-native-nitro-media-kit';
import {resolveLocalImagePath, getImageDimensions} from './mediaEditor';
import {
  muxVideoWithAudioNative,
  trimAudioClipNative,
} from './photoMusicComposer';
import {
  MAX_MUSIC_CLIP_MS,
  MAX_MUSIC_CLIP_SECONDS,
  SelectedMusic,
} from '../types/backgroundMusic';

export {MAX_MUSIC_CLIP_SECONDS, MAX_MUSIC_CLIP_MS};

const MAX_OUTPUT_LONG_EDGE = 1080;

const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac', 'mp4'];

function stripFileScheme(uri: string): string {
  return decodeURIComponent(uri.trim()).replace(/^file:\/\//, '');
}

function toFileUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }
  return `file://${path}`;
}

function extensionFromMime(mimeType?: string | null): string {
  const mime = (mimeType ?? '').toLowerCase();
  if (mime.includes('mpeg') || mime.includes('mp3')) {
    return 'mp3';
  }
  if (mime.includes('m4a') || mime.includes('mp4')) {
    return 'm4a';
  }
  if (mime.includes('wav')) {
    return 'wav';
  }
  if (mime.includes('aac')) {
    return 'aac';
  }
  return 'mp3';
}

function extensionFromName(name?: string | null): string | null {
  if (!name) {
    return null;
  }
  const match = /\.([a-z0-9]+)$/i.exec(name.trim());
  if (!match) {
    return null;
  }
  const ext = match[1].toLowerCase();
  return AUDIO_EXTENSIONS.includes(ext) ? ext : null;
}

export function formatMusicLabel(
  music: SelectedMusic,
  unknownTrackLabel: string,
): string {
  const base = music.name?.trim() || unknownTrackLabel;
  const clipSec = Math.max(1, Math.round(music.clipDurationMs / 1000));
  return `${base} · ${clipSec}s`;
}

export function clampMusicClip(
  durationMs: number,
  clipStartMs: number,
  clipDurationMs: number,
): {clipStartMs: number; clipDurationMs: number} {
  const safeDuration = Math.max(0, durationMs);
  const maxClip = Math.min(MAX_MUSIC_CLIP_MS, safeDuration || MAX_MUSIC_CLIP_MS);
  const start = Math.min(Math.max(0, clipStartMs), Math.max(0, safeDuration - 1000));
  const maxStart = Math.max(0, safeDuration - 1000);
  const boundedStart = Math.min(start, maxStart);
  const duration = Math.min(
    Math.max(1000, clipDurationMs),
    maxClip,
    Math.max(1000, safeDuration - boundedStart),
  );

  return {
    clipStartMs: boundedStart,
    clipDurationMs: duration,
  };
}

export function createDefaultMusicClip(durationMs: number): {
  clipStartMs: number;
  clipDurationMs: number;
} {
  const safeDuration = Math.max(0, durationMs);
  const clipDurationMs = Math.min(
    MAX_MUSIC_CLIP_MS,
    safeDuration > 0 ? safeDuration : MAX_MUSIC_CLIP_MS,
  );
  return {clipStartMs: 0, clipDurationMs: Math.max(1000, clipDurationMs)};
}

export async function resolveLocalAudioPath(
  uri: string,
  name?: string,
  mimeType?: string,
): Promise<string> {
  if (!uri) {
    throw new Error('Missing audio uri');
  }

  const decodedUri = decodeURIComponent(uri.trim());
  const ext =
    extensionFromName(name) ?? extensionFromMime(mimeType) ?? 'mp3';
  const dest = `${RNFS.CachesDirectoryPath}/music-source-${Date.now()}.${ext}`;

  if (decodedUri.startsWith('http://') || decodedUri.startsWith('https://')) {
    const download = await RNFS.downloadFile({
      fromUrl: decodedUri,
      toFile: dest,
    }).promise;
    if (download.statusCode && download.statusCode >= 400) {
      throw new Error('Could not download audio file');
    }
    return dest;
  }

  if (Platform.OS === 'android' && decodedUri.startsWith('content://')) {
    const copied = await keepLocalCopy({
      files: [
        {
          uri: decodedUri,
          fileName: `music-source-${Date.now()}.${ext}`,
          convertVirtualFileToType: mimeType ?? undefined,
        },
      ],
      destination: 'cachesDirectory',
    });
    const copyResult = copied[0];
    if (copyResult?.status === 'success') {
      return stripFileScheme(copyResult.localUri);
    }
    throw new Error(
      copyResult?.status === 'error'
        ? copyResult.copyError
        : 'Could not access the selected audio file',
    );
  }

  const sourcePath = stripFileScheme(decodedUri);
  const sourceExists = await RNFS.exists(sourcePath);
  if (!sourceExists) {
    throw new Error('Audio file not found');
  }

  if (sourcePath === dest) {
    return dest;
  }

  await RNFS.copyFile(sourcePath, dest);
  return dest;
}

export async function getAudioDurationMs(uri: string): Promise<number> {
  const soundPath = stripFileScheme(uri);

  return new Promise((resolve, reject) => {
    Sound.setCategory('Playback');
    const sound = new Sound(soundPath, '', error => {
      if (error) {
        reject(new Error('Could not read audio duration'));
        return;
      }

      const seconds = sound.getDuration();
      sound.release();

      if (!seconds || Number.isNaN(seconds)) {
        reject(new Error('Could not read audio duration'));
        return;
      }

      resolve(Math.round(seconds * 1000));
    });
  });
}

function computeOutputSize(
  width: number,
  height: number,
): {width: number; height: number} {
  const longEdge = Math.max(width, height);
  if (longEdge <= MAX_OUTPUT_LONG_EDGE) {
    return {
      width: Math.max(2, Math.round(width / 2) * 2),
      height: Math.max(2, Math.round(height / 2) * 2),
    };
  }

  const scale = MAX_OUTPUT_LONG_EDGE / longEdge;
  return {
    width: Math.max(2, Math.round((width * scale) / 2) * 2),
    height: Math.max(2, Math.round((height * scale) / 2) * 2),
  };
}

export type ComposePhotoMusicVideoOptions = {
  imageUri: string;
  music: SelectedMusic;
  outputWidth?: number;
  outputHeight?: number;
};

export async function composePhotoMusicVideo(
  options: ComposePhotoMusicVideoOptions,
): Promise<string> {
  const {music} = options;
  const clip = clampMusicClip(
    music.durationMs,
    music.clipStartMs,
    music.clipDurationMs,
  );
  const clipDurationSec = clip.clipDurationMs / 1000;

  const resolvedImage = await resolveLocalImagePath(options.imageUri);
  const resolvedAudio = await resolveLocalAudioPath(
    music.uri,
    music.name,
    music.mimeType,
  );

  try {
    const dimensions = await getImageDimensions(
      options.imageUri.startsWith('file://')
        ? options.imageUri
        : toFileUri(resolvedImage.path),
    ).catch(() => ({width: 1080, height: 1350}));

    computeOutputSize(
      options.outputWidth ?? dimensions.width,
      options.outputHeight ?? dimensions.height,
    );

    const trimmedAudio = await trimAudioClipNative(
      resolvedAudio,
      clip.clipStartMs,
      clip.clipStartMs + clip.clipDurationMs,
    );

    const silentVideoResult = await convertImageToVideo(
      resolvedImage.path,
      clipDurationSec,
    );

    if (!silentVideoResult.ok || !silentVideoResult.outputUri) {
      throw new Error(
        silentVideoResult.error?.message ?? 'Failed to create video from image',
      );
    }

    const muxedVideo = await muxVideoWithAudioNative(
      silentVideoResult.outputUri,
      trimmedAudio,
    );

    return toFileUri(muxedVideo);
  } finally {
    await resolvedImage.cleanup?.();
  }
}

export function deriveTrackName(fileName?: string | null): string {
  if (!fileName?.trim()) {
    return '';
  }
  return fileName.replace(/\.[^/.]+$/, '').trim();
}
