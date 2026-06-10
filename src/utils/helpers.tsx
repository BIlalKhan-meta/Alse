import moment from 'moment';
import {Platform} from 'react-native';
import {BASE_URL} from './baseurl';
import {
  check,
  request,
  RESULTS,
  requestMultiple,
  PERMISSIONS,
} from 'react-native-permissions';
import ReactNativeToastMessage from 'react-native-toast-message';

// This function can be used anywhere as it supports multiple permissions.
// It checks for permissions and then requests for it.
export async function checkMultiplePermissions(permissions) {
  let isPermissionGranted = false;
  let returnData = [];
  const statuses = await requestMultiple(permissions);
  for (var index in permissions) {
    if (statuses[permissions[index]] === RESULTS.GRANTED) {
      isPermissionGranted = true;
      returnData.push({
        isPermissionGranted: isPermissionGranted,
        message: permissions[index],
      });
    } else {
      isPermissionGranted = false;
      returnData.push({
        isPermissionGranted: isPermissionGranted,
        message: permissions[index],
      });
      break;
    }
  }
  return returnData;
}

// In case you want to check a single permission
export async function ensurePhotoPermission() {
  const isAndroid13OrAbove =
    Platform.OS === 'android' &&
    typeof Platform.Version === 'number' &&
    Platform.Version >= 33;

  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY
      : isAndroid13OrAbove
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

  let result = await check(permission);

  if (result === RESULTS.DENIED) {
    // 👇 This will show the permission popup
    result = await request(permission);
  }

  return result === RESULTS.GRANTED;
}

type Message = string | object;

function ToastMessage() {
  this.success = (message: string): void => {
    if (typeof message !== 'string') {
      message = 'An error occurred. Please try again later';
    }

    ReactNativeToastMessage.show({
      type: 'success',
      position: 'top',
      text1: 'Success',
      text2: message,
      props: {
        style: {
          backgroundColor: 'green',
        },
      },
    });
  };

  this.error = (message: string): void => {
    if (typeof message !== 'string') {
      message = 'An error occurred. Please try again later';
    }

    ReactNativeToastMessage.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: message,
      props: {
        style: {
          backgroundColor: 'red',
        },
      },
    });
  };
}

export const Toast = new ToastMessage();

export const showToast = (msg: Message): void => {
  presentToast(getMessage(msg));
};

export const presentToast = (message: string): void => {
  setTimeout(() => {
    Toast.error(message);
  }, 500);
};

export const getMessage = (json: Message): string => {
  switch (typeof json) {
    case 'string': {
      return json;
    }
    case 'object': {
      if (Array.isArray(json)) {
        const data = json[0];
        return getMessage(data);
      } else {
        if (json && 'errors' in json) {
          const data = json.errors;
          if (typeof data === 'object') {
            const values = Object.values(data);
            return getMessage(values);
          } else {
            return getMessage(data);
          }
        } else {
          if (
            json &&
            ('validation_error' in json ||
              typeof json.message === 'object' ||
              json.msg ||
              json.message)
          ) {
            if (json.validation_error) {
              const errorKeys = Object.keys(json.validation_error);
              return getMessage(json.validation_error[errorKeys[0]][0]);
            }
            if (json.message) {
              return getMessage(json.message);
            }
            if (json.msg) {
              return getMessage(json.msg);
            } else {
              const errorKeys = Object.keys(json.message);
              return getMessage(json.message[errorKeys[0]][0]);
            }
          }
          if (json.message) {
            return getMessage(json.message);
          } else if (json.error) {
            return getMessage(json.error);
          } else {
            return 'An error occurred. Please try again later';
          }
        }
      }
    }
    default: {
      return 'An error occurred. Please try again later';
    }
  }
};

export const getDateSection = date => {
  const today = moment();
  const itemDate = moment(date);

  if (itemDate.isSame(today, 'day')) {
    return 'Today';
  } else if (itemDate.isSame(today.clone().subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  } else if (itemDate.isAfter(today.clone().subtract(7, 'days'))) {
    return 'Last Week';
  } else {
    return itemDate.format('MMM DD, YYYY');
  }
};

export const changeUrlForData = (url: string) =>
  (url || '')?.replaceAll(
    'https://elombelo-bucket.s3.us-west-1.amazonaws.com',
    'https://alse-backend-bucket.s3.ap-southeast-2.amazonaws.com',
  );

/** Ensures avatar URL is absolute. Handles relative paths and S3 bucket URLs. */
export const getAbsoluteAvatarUrl = (
  url: string | null | undefined,
  cacheBust?: boolean,
): string | null => {
  if (!url || url === 'null') return null;
  const normalized = changeUrlForData(url);
  let absolute = normalized;
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    const base = BASE_URL.replace(/\/api\/?$/, '');
    absolute = normalized.startsWith('/') ? `${base}${normalized}` : `${base}/${normalized}`;
  }
  if (cacheBust) {
    const sep = absolute.includes('?') ? '&' : '?';
    return `${absolute}${sep}t=${Date.now()}`;
  }
  return absolute;
};

export type NewsfeedMediaItem = {
  id?: number;
  post_id?: number;
  path?: string;
  type?: string;
  file?: string;
  date?: string;
};

function mediaBasename(fileOrPath?: string | null): string {
  if (!fileOrPath) {
    return '';
  }
  const segment = fileOrPath.split('/').pop() ?? fileOrPath;
  return segment.toLowerCase();
}

/** Story assets use a separate API; newsfeed should never display `Story_*` files. */
function isStoryMediaItem(m: NewsfeedMediaItem): boolean {
  return (
    mediaBasename(m.file).startsWith('story_') ||
    mediaBasename(m.path).startsWith('story_')
  );
}

/**
 * All newsfeed post media for display: drops story attachments (`Story_*`), then
 * returns every `Post_*` upload (oldest first), or all remaining items by date.
 */
export function getNewsfeedMediaList(
  media: NewsfeedMediaItem[] | undefined | null,
): NewsfeedMediaItem[] {
  if (!media?.length) {
    return [];
  }
  const postOnly = media.filter(m => m?.path && !isStoryMediaItem(m));
  if (!postOnly.length) {
    return [];
  }

  const postUploads = postOnly.filter(m =>
    mediaBasename(m.file).startsWith('post_'),
  );
  if (postUploads.length) {
    return [...postUploads].sort(
      (a, b) =>
        (a.id ?? 0) - (b.id ?? 0) ||
        (a.date || '').localeCompare(b.date || ''),
    );
  }

  return [...postOnly].sort((a, b) =>
    (b.date || '').localeCompare(a.date || ''),
  );
}

/**
 * Picks newsfeed post media only: drops story attachments (`Story_*`), then prefers
 * `Post_*` uploads, else newest image/video by `date`.
 */
export function getPrimaryNewsfeedMedia(
  media: NewsfeedMediaItem[] | undefined | null,
): NewsfeedMediaItem | undefined {
  return getNewsfeedMediaList(media)[0];
}

/** App convention: attribution suffix on post `description` for reshares (parse with parseSharedFrom). */
export const SHARED_FROM_DESCRIPTION_MARKER = '\n\n— Shared from ';

export function parseSharedFrom(description: string | undefined | null): {
  caption: string;
  sharedFromName: string | null;
} {
  if (description == null || description === '') {
    return {caption: '', sharedFromName: null};
  }
  const i = description.lastIndexOf(SHARED_FROM_DESCRIPTION_MARKER);
  if (i === -1) {
    return {caption: description, sharedFromName: null};
  }
  const sharedFromName = description
    .slice(i + SHARED_FROM_DESCRIPTION_MARKER.length)
    .trim();
  return {
    caption: description.slice(0, i),
    sharedFromName: sharedFromName || null,
  };
}

export function buildSharedDescription(
  caption: string,
  originalAuthorFullName: string,
): string {
  const base = (caption ?? '').trimEnd();
  const name = (originalAuthorFullName ?? '').trim();
  if (!name) {
    return base;
  }
  return `${base}${SHARED_FROM_DESCRIPTION_MARKER}${name}`;
}

export const createFile = (img: string) => {
  let localUri = img;
  let filename: any = localUri.split('/').pop();
  let match: any = /\.(\w+)$/.exec(filename);
  let type = match ? `image/${match[1]}` : `image`;
  var image = img;
  let obj = {
    name: 'img' + new Date().getTime() + '.' + (match?.[1] ?? 'jpg'),
    type: type,
    uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
  };
  return obj;
};

/** Use for chat video uploads so the correct video/* MIME type is set. */
export const createVideoFile = (uri: string) => {
  const filename = uri.split('/').pop() ?? 'video';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match?.[1] ?? 'mp4';
  const type = `video/${ext}`;
  return {
    name: `video_${new Date().getTime()}.${ext}`,
    type,
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
  };
};
