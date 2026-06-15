import {PickedMedia} from '../hooks/useImagePicker';
import {SelectedMusic} from './backgroundMusic';

export type PostDraftKind = 'create' | 'edit';

export type DraftMediaItem = PickedMedia & {
  isExisting?: boolean;
  mediaId?: number;
  persistedUri: string;
};

export type PostDraft = {
  id: string;
  kind: PostDraftKind;
  userId: number;
  updatedAt: number;
  description: string;
  privacy: string;
  media: DraftMediaItem[];
  music?: SelectedMusic;
  postId?: number;
  removedMediaIds?: number[];
};

export type PostDraftMeta = {
  id: string;
  kind: PostDraftKind;
  preview: string;
  thumbnailUri?: string;
  postId?: number;
  updatedAt: number;
};

export type SavePostDraftInput = {
  userId: number;
  kind: PostDraftKind;
  description: string;
  privacy: string;
  media: Array<PickedMedia & {isExisting?: boolean; mediaId?: number}>;
  music?: SelectedMusic | null;
  postId?: number;
  removedMediaIds?: number[];
  draftId?: string;
};
