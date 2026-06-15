import {NativeModules} from 'react-native';

type PhotoMusicComposerModule = {
  trimAudioClip: (
    inputPath: string,
    startMs: number,
    endMs: number,
  ) => Promise<string>;
  muxVideoWithAudio: (videoPath: string, audioPath: string) => Promise<string>;
};

const {PhotoMusicComposer} = NativeModules as {
  PhotoMusicComposer?: PhotoMusicComposerModule;
};

function stripFileScheme(uri: string): string {
  return decodeURIComponent(uri.trim()).replace(/^file:\/\//, '');
}

function ensureComposer(): PhotoMusicComposerModule {
  if (
    !PhotoMusicComposer?.trimAudioClip ||
    !PhotoMusicComposer?.muxVideoWithAudio
  ) {
    throw new Error(
      'PhotoMusicComposer native module is not linked. Rebuild the native app.',
    );
  }
  return PhotoMusicComposer;
}

export async function trimAudioClipNative(
  inputPath: string,
  startMs: number,
  endMs: number,
): Promise<string> {
  const composer = ensureComposer();
  return composer.trimAudioClip(
    stripFileScheme(inputPath),
    Math.round(startMs),
    Math.round(endMs),
  );
}

export async function muxVideoWithAudioNative(
  videoPath: string,
  audioPath: string,
): Promise<string> {
  const composer = ensureComposer();
  return composer.muxVideoWithAudio(
    stripFileScheme(videoPath),
    stripFileScheme(audioPath),
  );
}
