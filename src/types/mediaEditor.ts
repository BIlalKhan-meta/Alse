import {PickedMedia} from '../hooks/useImagePicker';

export type MediaEditorOrigin = 'create' | 'edit';

export type CropAspect = 'original' | '1:1' | '4:5' | '16:9';

export type EditorTool = 'none' | 'crop' | 'text';

export type TextOverlayState = {
  text: string;
  x: number;
  y: number;
  width: number;
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
};

export type MediaEditorResultParams = {
  editedMediaBatch?: EditedMedia[];
};
