import {PickedMedia} from '../hooks/useImagePicker';

export type MediaEditorOrigin = 'create' | 'edit';

export type CropAspect = 'original' | '1:1' | '4:5' | '16:9';

export type EditorTool = 'none' | 'crop' | 'text';

export const TEXT_SIZES = [14, 18, 22, 26, 32] as const;

export const TEXT_BACKGROUND_OPACITIES = [0.25, 0.5, 0.75, 0.85, 1] as const;

export const TEXT_BOX_WIDTH_STEP = 12;
export const TEXT_BOX_HEIGHT_STEP = 8;
export const TEXT_BOX_MIN_WIDTH = 80;
export const TEXT_BOX_MIN_HEIGHT = 40;

export type TextOverlayState = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  backgroundEnabled: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
};

export const hexToRgba = (hex: string, opacity: number): string => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(255,255,255,${opacity})`;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

export const createDefaultTextOverlay = (
  cardWidth: number,
  cardHeight: number,
): TextOverlayState => ({
  text: '',
  x: cardWidth * 0.1,
  y: cardHeight * 0.55,
  width: cardWidth * 0.8,
  height: 56,
  fontSize: 18,
  color: '#000000',
  backgroundEnabled: true,
  backgroundColor: '#FFFFFF',
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
  sourceUri?: string;
  reEditIndex?: number;
};

export type EditorSnapshot = {
  workingUri: string;
  textOverlay: TextOverlayState | null;
  activeTool: EditorTool;
};

export type MediaEditorResultParams = {
  editedMediaBatch?: EditedMedia[];
  reEditIndex?: number;
};
