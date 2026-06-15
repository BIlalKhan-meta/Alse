export type SelectedMusic = {
  uri: string;
  name: string;
  mimeType: string;
  durationMs: number;
  clipStartMs: number;
  clipDurationMs: number;
};

export type MusicPickerRouteParams = {
  imageUris: string[];
  imageUri?: string;
  imageName?: string;
  existingMusic?: SelectedMusic;
};

export const MAX_MUSIC_CLIP_SECONDS = 30;
export const MAX_MUSIC_CLIP_MS = MAX_MUSIC_CLIP_SECONDS * 1000;
