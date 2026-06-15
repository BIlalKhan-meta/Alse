import {useCallback, useState} from 'react';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import {
  createDefaultMusicClip,
  deriveTrackName,
  getAudioDurationMs,
} from '../utils/backgroundMusic';
import {ensureAudioPermission} from '../utils/helpers';
import {SelectedMusic} from '../types/backgroundMusic';

function buildAudioFileName(name?: string | null, mimeType?: string | null): string {
  if (name?.trim() && /\.[a-z0-9]+$/i.test(name.trim())) {
    return name.trim();
  }

  const base = deriveTrackName(name) || `track-${Date.now()}`;
  const mime = (mimeType ?? '').toLowerCase();
  if (mime.includes('mpeg') || mime.includes('mp3')) {
    return `${base}.mp3`;
  }
  if (mime.includes('wav')) {
    return `${base}.wav`;
  }
  if (mime.includes('aac')) {
    return `${base}.aac`;
  }
  return `${base}.m4a`;
}

export function useMusicPicker() {
  const [isPicking, setIsPicking] = useState(false);

  const pickAudioFile = useCallback(async (): Promise<SelectedMusic | null> => {
    setIsPicking(true);
    try {
      const hasPermission = await ensureAudioPermission();
      if (!hasPermission) {
        throw new Error('Storage permission is required to access audio files');
      }

      const [file] = await pick({
        type: [types.audio],
        allowMultiSelection: false,
      });

      if (!file?.uri) {
        return null;
      }

      if (file.hasRequestedType === false) {
        throw new Error('Selected file is not an audio track');
      }

      const fileName = buildAudioFileName(file.name, file.type);
      const [copyResult] = await keepLocalCopy({
        files: [
          {
            uri: file.uri,
            fileName,
            convertVirtualFileToType: file.type ?? undefined,
          },
        ],
        destination: 'cachesDirectory',
      });

      if (copyResult.status === 'error') {
        const copyError = copyResult.copyError ?? 'Could not access the selected audio file';
        if (/permission/i.test(copyError)) {
          throw new Error('Storage permission is required to access audio files');
        }
        throw new Error(copyError);
      }

      const cachedUri = copyResult.localUri;
      const durationMs = await getAudioDurationMs(cachedUri);
      const clip = createDefaultMusicClip(durationMs);

      return {
        uri: cachedUri,
        name: deriveTrackName(file.name) || deriveTrackName(fileName) || 'Track',
        mimeType: file.type ?? 'audio/mpeg',
        durationMs,
        clipStartMs: clip.clipStartMs,
        clipDurationMs: clip.clipDurationMs,
      };
    } catch (error: unknown) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return null;
      }
      throw error;
    } finally {
      setIsPicking(false);
    }
  }, []);

  return {
    isPicking,
    pickAudioFile,
  };
}

export default useMusicPicker;
