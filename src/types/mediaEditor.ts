import {PickedMedia} from '../hooks/useImagePicker';

export type MediaEditorOrigin = 'create' | 'edit';

export type CropAspect = 'original' | '1:1' | '4:5' | '16:9';

export type EditorTool = 'none' | 'crop' | 'text';

export const TEXT_COLORS = [
  '#000000',
  '#FFFFFF',
  '#FF3B30',
  '#20B2AA',
  '#007AFF',
  '#FFCC00',
] as const;

export const TEXT_SIZES = [14, 18, 22, 26, 32] as const;

export const TEXT_BACKGROUND_OPACITIES = [0.25, 0.5, 0.75, 0.85, 1] as const;

export type TextOverlayState = {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  color: string;
  backgroundEnabled: boolean;
  backgroundOpacity: number;
};

export const createDefaultTextOverlay = (
  cardWidth: number,
  cardHeight: number,
): TextOverlayState => ({
  text: '',
  x: cardWidth * 0.1,
  y: cardHeight * 0.55,
  width: cardWidth * 0.8,
  fontSize: 18,
  color: '#000000',
  backgroundEnabled: true,
  backgroundOpacity: 0.85,
});

export type ImageCropRouteParams = {
  imageUri: string;
  editorParams: MediaEditorRouteParams & {
    workingUri?: string;
    croppedUri?: string;
  };
};

export type EditedMedia = PickedMedia & {
  width?: number;
  height?: number;
};

export type MediaEditorQueueItem = {
  uri: string;
  name?: string;
  type?: string;
  kind: 'image' | 'video';
};

export type MediaEditorRouteParams = {
  uri: string;
  name?: string;
  type?: string;
  kind: 'image' | 'video';
  queue: MediaEditorQueueItem[];
  queueIndex: number;
  maxRemaining: number;
  origin: MediaEditorOrigin;
  completedMedia?: EditedMedia[];
  originRouteKey?: string;
  workingUri?: string;
  croppedUri?: string;
};

export type MediaEditorResultParams = {
  editedMediaBatch?: EditedMedia[];
};
