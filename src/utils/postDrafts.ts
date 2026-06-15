import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {PickedMedia} from '../hooks/useImagePicker';
import {SelectedMusic} from '../types/backgroundMusic';
import {
  DraftMediaItem,
  PostDraft,
  PostDraftMeta,
  SavePostDraftInput,
} from '../types/postDraft';
import {resolveLocalAudioPath} from './backgroundMusic';
import {resolveLocalImagePath} from './mediaEditor';

const MAX_DRAFTS = 20;
const DRAFT_FILE_NAME = 'draft.json';

function storageKey(userId: number): string {
  return `postDrafts:${userId}`;
}

function draftRoot(userId: number): string {
  return `${RNFS.DocumentDirectoryPath}/post-drafts/${userId}`;
}

function draftDir(userId: number, draftId: string): string {
  return `${draftRoot(userId)}/${draftId}`;
}

function generateDraftId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function stripFileScheme(uri: string): string {
  return decodeURIComponent(uri.trim()).replace(/^file:\/\//, '');
}

function toFileUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }
  return `file://${path}`;
}

function isRemoteUri(uri: string): boolean {
  const decoded = decodeURIComponent(uri.trim());
  return decoded.startsWith('http://') || decoded.startsWith('https://');
}

function extensionForMedia(
  kind: 'image' | 'video',
  name?: string,
  type?: string,
): string {
  const fromName = name?.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName) {
    return fromName;
  }
  const mime = (type ?? '').toLowerCase();
  if (mime.includes('png')) {
    return 'png';
  }
  if (mime.includes('gif')) {
    return 'gif';
  }
  if (mime.includes('webp')) {
    return 'webp';
  }
  if (mime.includes('quicktime') || mime.includes('mov')) {
    return 'mov';
  }
  if (mime.includes('video')) {
    return 'mp4';
  }
  return kind === 'video' ? 'mp4' : 'jpg';
}

async function readIndex(userId: number): Promise<PostDraftMeta[]> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as PostDraftMeta[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(userId: number, index: PostDraftMeta[]): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(index));
}

async function copyUriToPath(
  sourceUri: string,
  destPath: string,
  kind: 'image' | 'video',
): Promise<void> {
  if (isRemoteUri(sourceUri)) {
    const download = await RNFS.downloadFile({
      fromUrl: sourceUri,
      toFile: destPath,
    }).promise;
    if (download.statusCode && download.statusCode >= 400) {
      throw new Error('Could not download media for draft');
    }
    return;
  }

  const decoded = decodeURIComponent(sourceUri.trim());

  if (kind === 'video') {
    if (decoded.startsWith('content://') || decoded.startsWith('ph://')) {
      await RNFS.copyFile(decoded, destPath);
      return;
    }

    const sourcePath = stripFileScheme(decoded);
    const exists = await RNFS.exists(sourcePath);
    if (!exists) {
      throw new Error('Media file not found');
    }
    await RNFS.copyFile(sourcePath, destPath);
    return;
  }

  if (
    decoded.startsWith('ph://') ||
    decoded.startsWith('assets-library://') ||
    decoded.startsWith('content://')
  ) {
    const resolved = await resolveLocalImagePath(decoded);
    try {
      await RNFS.copyFile(resolved.path, destPath);
    } finally {
      await resolved.cleanup();
    }
    return;
  }

  const sourcePath = stripFileScheme(decoded);
  const exists = await RNFS.exists(sourcePath);
  if (!exists) {
    throw new Error('Media file not found');
  }
  await RNFS.copyFile(sourcePath, destPath);
}

async function persistMediaItem(
  media: PickedMedia & {isExisting?: boolean; mediaId?: number},
  folder: string,
  index: number,
): Promise<DraftMediaItem> {
  const kind = media.kind ?? 'image';
  const ext = extensionForMedia(kind, media.name, media.type);
  const destPath = `${folder}/media-${index}.${ext}`;

  if (media.isExisting && media.uri && isRemoteUri(media.uri)) {
    return {
      uri: media.uri,
      name: media.name,
      type: media.type,
      kind,
      sourceUri: media.sourceUri ?? media.uri,
      isExisting: true,
      mediaId: media.mediaId,
      persistedUri: media.uri,
    };
  }

  await copyUriToPath(media.uri, destPath, kind);

  return {
    uri: toFileUri(destPath),
    name: media.name ?? `media-${index}.${ext}`,
    type: media.type ?? (kind === 'video' ? 'video/mp4' : 'image/jpeg'),
    kind,
    sourceUri: media.sourceUri ?? toFileUri(destPath),
    isExisting: media.isExisting,
    mediaId: media.mediaId,
    persistedUri: toFileUri(destPath),
  };
}

async function persistMusic(
  music: SelectedMusic,
  folder: string,
): Promise<SelectedMusic> {
  const ext = music.name?.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'mp3';
  const destPath = `${folder}/music.${ext}`;
  const localPath = await resolveLocalAudioPath(
    music.uri,
    music.name,
    music.mimeType,
  );
  await RNFS.copyFile(localPath, destPath);
  if (localPath !== destPath) {
    await RNFS.unlink(localPath).catch(() => {});
  }

  return {
    ...music,
    uri: toFileUri(destPath),
  };
}

function buildMeta(draft: PostDraft): PostDraftMeta {
  const firstImage = draft.media.find(item => item.kind !== 'video');
  const firstMedia = draft.media[0];
  const thumbnailUri =
    firstImage?.persistedUri ?? firstMedia?.persistedUri ?? undefined;

  return {
    id: draft.id,
    kind: draft.kind,
    preview: draft.description.trim().slice(0, 120),
    thumbnailUri,
    postId: draft.postId,
    updatedAt: draft.updatedAt,
  };
}

async function ensureDraftDir(userId: number, draftId: string): Promise<string> {
  const root = draftRoot(userId);
  const folder = draftDir(userId, draftId);
  const rootExists = await RNFS.exists(root);
  if (!rootExists) {
    await RNFS.mkdir(root);
  }
  const folderExists = await RNFS.exists(folder);
  if (!folderExists) {
    await RNFS.mkdir(folder);
  }
  return folder;
}

async function removeDraftFolder(userId: number, draftId: string): Promise<void> {
  const folder = draftDir(userId, draftId);
  const exists = await RNFS.exists(folder);
  if (!exists) {
    return;
  }

  const entries = await RNFS.readDir(folder);
  await Promise.all(entries.map(entry => RNFS.unlink(entry.path)));
  await RNFS.unlink(folder);
}

export async function listPostDrafts(userId: number): Promise<PostDraftMeta[]> {
  const index = await readIndex(userId);
  return [...index].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function loadPostDraft(
  userId: number,
  draftId: string,
): Promise<PostDraft | null> {
  const filePath = `${draftDir(userId, draftId)}/${DRAFT_FILE_NAME}`;
  const exists = await RNFS.exists(filePath);
  if (!exists) {
    const index = await readIndex(userId);
    const filtered = index.filter(item => item.id !== draftId);
    if (filtered.length !== index.length) {
      await writeIndex(userId, filtered);
    }
    return null;
  }

  const raw = await RNFS.readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw) as PostDraft;
  } catch {
    return null;
  }
}

export async function deletePostDraft(
  userId: number,
  draftId: string,
): Promise<void> {
  await removeDraftFolder(userId, draftId);
  const index = await readIndex(userId);
  await writeIndex(
    userId,
    index.filter(item => item.id !== draftId),
  );
}

export async function deleteDraftsForPost(
  userId: number,
  postId: number,
): Promise<void> {
  const index = await readIndex(userId);
  const toDelete = index.filter(
    item => item.kind === 'edit' && item.postId === postId,
  );
  await Promise.all(toDelete.map(item => removeDraftFolder(userId, item.id)));
  await writeIndex(
    userId,
    index.filter(item => !(item.kind === 'edit' && item.postId === postId)),
  );
}

export async function deletePostDraftById(
  userId: number,
  draftId?: string,
): Promise<void> {
  if (!draftId) {
    return;
  }
  await deletePostDraft(userId, draftId);
}

export function draftMediaToPickedMedia(
  media: DraftMediaItem[],
): Array<PickedMedia & {isExisting?: boolean; mediaId?: number}> {
  return media.map(item => ({
    uri: item.persistedUri,
    name: item.name,
    type: item.type,
    kind: item.kind,
    sourceUri: item.sourceUri ?? item.persistedUri,
    isExisting: item.isExisting,
    mediaId: item.mediaId,
  }));
}

export async function savePostDraft(input: SavePostDraftInput): Promise<string> {
  const draftId = input.draftId ?? generateDraftId();

  if (input.draftId) {
    await removeDraftFolder(input.userId, draftId);
  }

  const folder = await ensureDraftDir(input.userId, draftId);

  const persistedMedia: DraftMediaItem[] = [];
  for (let index = 0; index < input.media.length; index++) {
    const item = await persistMediaItem(input.media[index], folder, index);
    persistedMedia.push(item);
  }

  let persistedMusic: SelectedMusic | undefined;
  if (input.music && input.kind === 'create') {
    persistedMusic = await persistMusic(input.music, folder);
  }

  const draft: PostDraft = {
    id: draftId,
    kind: input.kind,
    userId: input.userId,
    updatedAt: Date.now(),
    description: input.description,
    privacy: input.privacy,
    media: persistedMedia,
    music: persistedMusic,
    postId: input.postId,
    removedMediaIds: input.removedMediaIds?.length
      ? [...input.removedMediaIds]
      : undefined,
  };

  await RNFS.writeFile(
    `${folder}/${DRAFT_FILE_NAME}`,
    JSON.stringify(draft),
    'utf8',
  );

  let index = await readIndex(input.userId);
  index = index.filter(item => item.id !== draftId);
  index.unshift(buildMeta(draft));

  if (index.length > MAX_DRAFTS) {
    const evicted = index.slice(MAX_DRAFTS);
    index = index.slice(0, MAX_DRAFTS);
    await Promise.all(
      evicted.map(item => removeDraftFolder(input.userId, item.id)),
    );
  }

  await writeIndex(input.userId, index);
  return draftId;
}
