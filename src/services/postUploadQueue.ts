import eventEmitter, {EVENT_TYPES} from '../utils/EventEmitter';
import {createPostWithMediaKeys} from '../api/mediaUpload';
import {uploadMediaListDirect} from '../utils/directMediaUpload';
import {buildPostVideoFile, Toast} from '../utils/helpers';
import store from '../store';
import {postCreate} from '../store/slices/homeSlice';
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

function emitProgress(message: string, percent?: number) {
  eventEmitter.emit(EVENT_TYPES.UPLOAD_PROGRESS, {message, percent});
}

export async function enqueuePostUpload(payload: QueuedPostUpload) {
  if (inFlight) {
    Toast.error('Another upload is already in progress');
    return;
  }
  inFlight = true;
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
    }

    let mediaKeys: Array<{key: string; type: 'image' | 'video'; filename?: string}> =
      [];
    if (mediaToUpload.length > 0) {
      try {
        mediaKeys = await uploadMediaListDirect(mediaToUpload, {
          folder: 'posts',
          onProgress: percent => emitProgress(`Uploading ${percent}%`, percent),
        });
      } catch (directErr) {
        console.warn('[postUploadQueue] direct upload failed', directErr);
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
            body.append(`file[${index}]`, {
              uri: media.uri,
              name: media.name || `image_${index}.jpg`,
              type: media.type || 'image/jpeg',
            } as any);
          }
        }
        emitProgress('Creating post…', 95);
        await store.dispatch(postCreate(body)).unwrap();
        if (payload.userId && payload.draftId) {
          await deletePostDraftById(payload.userId, payload.draftId);
        }
        emitProgress('Done', 100);
        Toast.success('Posted Successfully');
        eventEmitter.emit(EVENT_TYPES.UPLOAD_COMPLETE, {ok: true});
        return;
      }
    }

    emitProgress('Creating post…', 98);
    await createPostWithMediaKeys({
      description: payload.description,
      privacy: payload.privacy,
      media_keys: mediaKeys,
    });
    if (payload.userId && payload.draftId) {
      await deletePostDraftById(payload.userId, payload.draftId);
    }
    emitProgress('Done', 100);
    Toast.success('Posted Successfully');
    eventEmitter.emit(EVENT_TYPES.UPLOAD_COMPLETE, {ok: true});
  } catch (err: any) {
    const message =
      err?.message === MUSIC_TOO_MANY_IMAGES_FOR_CLIP
        ? 'Too many images for music clip'
        : err?.message || 'Upload failed';
    Toast.error(message);
    eventEmitter.emit(EVENT_TYPES.UPLOAD_COMPLETE, {ok: false, message});
  } finally {
    inFlight = false;
    setTimeout(() => emitProgress('', undefined), 1200);
  }
}
