import eventEmitter, {EVENT_TYPES} from '../utils/EventEmitter';
import {createPostWithMediaKeys} from '../api/mediaUpload';
import {
  ensureFileUriReadable,
  toFriendlyUploadError,
  uploadMediaListDirect,
} from '../utils/directMediaUpload';
import {buildPostVideoFile, Toast} from '../utils/helpers';
import {createPost} from '../api/home';
import {deletePostDraftById} from '../utils/postDrafts';
import {
  composePhotoMusicSlideshow,
  MUSIC_TOO_MANY_IMAGES_FOR_CLIP,
} from '../utils/backgroundMusic';

export type QueuedPostUpload = {
  description: string;
  privacy: string;
  mediaList: Array<{
    uri: string;
    kind: 'image' | 'video';
    name?: string;
    type?: string;
  }>;
  music?: any;
  draftId?: string;
  userId?: number;
};

let inFlight = false;
let activeController: AbortController | null = null;
let lastEmittedPercent = -1;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function throwIfCancelled(signal: AbortSignal) {
  if (signal.aborted) {
    throw new DOMException('Upload cancelled', 'AbortError');
  }
}

function emitProgress(message: string, percent?: number) {
  if (!message) {
    lastEmittedPercent = -1;
    eventEmitter.emit(EVENT_TYPES.UPLOAD_PROGRESS, {
      message: '',
      percent: undefined,
    });
    return;
  }

  let nextPercent =
    typeof percent === 'number' && !Number.isNaN(percent)
      ? Math.max(0, Math.min(100, Math.round(percent)))
      : undefined;

  // Never report a lower % for the same upload session (avoids jumpy UI).
  if (typeof nextPercent === 'number') {
    if (nextPercent < lastEmittedPercent && nextPercent !== 0) {
      nextPercent = lastEmittedPercent;
    }
    if (nextPercent === lastEmittedPercent && message.startsWith('Uploading')) {
      return;
    }
    lastEmittedPercent = nextPercent;
  }

  eventEmitter.emit(EVENT_TYPES.UPLOAD_PROGRESS, {
    message,
    percent: nextPercent,
  });
}

async function finishWithToast(
  toast: () => void,
  finalPercent?: number,
) {
  if (typeof finalPercent === 'number') {
    emitProgress('Done', finalPercent);
    await sleep(450);
  }
  emitProgress('', undefined);
  // Let the banner unmount before the top toast appears.
  await sleep(80);
  toast();
}

export async function enqueuePostUpload(payload: QueuedPostUpload) {
  if (inFlight) {
    Toast.error('Another upload is already in progress');
    return;
  }
  inFlight = true;
  const controller = new AbortController();
  activeController = controller;
  const {signal} = controller;
  lastEmittedPercent = -1;
  emitProgress('Uploading…', 0);

  try {
    let mediaToUpload = payload.mediaList.filter(m => m?.uri);
    const imageMediaList = mediaToUpload.filter(m => m.kind !== 'video');
    const shouldMuxMusic =
      !!payload.music &&
      imageMediaList.length > 0 &&
      imageMediaList.length === mediaToUpload.length;

    if (shouldMuxMusic && payload.music) {
      emitProgress('Composing music video…');
      const videoUri = await composePhotoMusicSlideshow({
        imageUris: imageMediaList.map(m => m.uri),
        music: payload.music,
      });
      mediaToUpload = [
        {
          uri: videoUri,
          name: 'post_music.mp4',
          type: 'video/mp4',
          kind: 'video',
        },
      ];
      throwIfCancelled(signal);
    }

    let mediaKeys: Array<{key: string; type: 'image' | 'video'; filename?: string}> =
      [];
    if (mediaToUpload.length > 0) {
      try {
        mediaKeys = await uploadMediaListDirect(mediaToUpload, {
          folder: 'posts',
          onProgress: percent => emitProgress('Uploading…', percent),
          signal,
        });
      } catch (directErr) {
        throwIfCancelled(signal);
        console.warn('[postUploadQueue] direct upload failed', directErr);
        // If direct upload already mapped a clear message, surface it instead of
        // another fragile FormData attempt that often repeats Network request failed.
        const directMessage = String((directErr as Error)?.message || '');
        if (
          directMessage &&
          !/network request failed|network error/i.test(directMessage)
        ) {
          throw toFriendlyUploadError(directErr);
        }

        const body = new FormData();
        body.append('content', payload.description);
        body.append('description', payload.description);
        body.append('privacy', payload.privacy);
        for (let index = 0; index < mediaToUpload.length; index++) {
          const media = mediaToUpload[index];
          if (media.kind === 'video') {
            const file = await buildPostVideoFile(
              media.uri,
              media.name,
              media.type,
            );
            body.append(`file[${index}]`, file as any);
          } else {
            const readableUri = await ensureFileUriReadable(
              media.uri,
              'image',
            );
            body.append(`file[${index}]`, {
              uri: readableUri,
              name: media.name || `image_${index}.jpg`,
              type: media.type || 'image/jpeg',
            } as any);
          }
        }
        throwIfCancelled(signal);
        emitProgress('Creating post…', 95);
        try {
          await createPost(body, signal);
        } catch (fallbackErr) {
          throw toFriendlyUploadError(fallbackErr);
        }
        if (payload.userId && payload.draftId) {
          await deletePostDraftById(payload.userId, payload.draftId);
        }
        await finishWithToast(
          () => Toast.success('Posted Successfully'),
          100,
        );
        eventEmitter.emit(EVENT_TYPES.UPLOAD_COMPLETE, {ok: true});
        return;
      }
    }

    throwIfCancelled(signal);
    emitProgress('Creating post…', 98);
    await createPostWithMediaKeys({
      description: payload.description,
      privacy: payload.privacy,
      media_keys: mediaKeys,
    }, signal);
    if (payload.userId && payload.draftId) {
      await deletePostDraftById(payload.userId, payload.draftId);
    }
    await finishWithToast(() => Toast.success('Posted Successfully'), 100);
    eventEmitter.emit(EVENT_TYPES.UPLOAD_COMPLETE, {ok: true});
  } catch (err: any) {
    if (signal.aborted || err?.name === 'AbortError') {
      await finishWithToast(() => Toast.success('Post upload cancelled'));
      eventEmitter.emit(EVENT_TYPES.UPLOAD_COMPLETE, {
        ok: false,
        cancelled: true,
      });
      return;
    }
    const message =
      err?.message === MUSIC_TOO_MANY_IMAGES_FOR_CLIP
        ? 'Too many images for music clip'
        : toFriendlyUploadError(err).message || 'Upload failed';
    await finishWithToast(() => Toast.error(message));
    eventEmitter.emit(EVENT_TYPES.UPLOAD_COMPLETE, {ok: false, message});
  } finally {
    inFlight = false;
    if (activeController === controller) {
      activeController = null;
    }
  }
}

export function cancelPostUpload(): boolean {
  if (!inFlight || !activeController) {
    return false;
  }
  activeController.abort();
  return true;
}
