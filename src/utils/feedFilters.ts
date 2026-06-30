import {resolveFeedLabel} from './feedLabels';
import {
  getNewsfeedMediaList,
  NewsfeedMediaItem,
} from './helpers';

export const FEED_FILTER_TABS = [
  'all',
  'following',
  'videos',
  'images',
  'stories',
] as const;

export type FeedFilterTab = (typeof FEED_FILTER_TABS)[number];

const mediaBasename = (fileOrPath?: string | null): string => {
  if (!fileOrPath) {
    return '';
  }
  return (fileOrPath.split('/').pop() ?? fileOrPath).toLowerCase();
};

const isStoryMediaItem = (media: NewsfeedMediaItem): boolean => {
  return (
    mediaBasename(media.file).startsWith('story_') ||
    mediaBasename(media.path).startsWith('story_')
  );
};

const isVideoMedia = (media: NewsfeedMediaItem): boolean =>
  String(media.type ?? '').toLowerCase() === 'video';

const isImageMedia = (media: NewsfeedMediaItem): boolean =>
  String(media.type ?? '').toLowerCase() === 'image';

const getDisplayMedia = (post: Record<string, unknown>) =>
  getNewsfeedMediaList(post.media as NewsfeedMediaItem[] | undefined);

const getRawMedia = (post: Record<string, unknown>): NewsfeedMediaItem[] =>
  Array.isArray(post.media) ? (post.media as NewsfeedMediaItem[]) : [];

const isFollowingPost = (post: Record<string, unknown>): boolean => {
  if (
    post.is_following === true ||
    post.user_is_following === true ||
    post.from_following === true
  ) {
    return true;
  }

  return resolveFeedLabel(post) === 'following';
};

const isStoryPost = (post: Record<string, unknown>): boolean => {
  const postType = String(post.post_type ?? post.type ?? '').toLowerCase();
  if (postType === 'story' || post.is_story === true) {
    return true;
  }

  const rawMedia = getRawMedia(post);
  return rawMedia.some(item => item?.path && isStoryMediaItem(item));
};

const isVideoPost = (post: Record<string, unknown>): boolean => {
  const displayMedia = getDisplayMedia(post);
  if (displayMedia.some(isVideoMedia)) {
    return true;
  }

  return getRawMedia(post).some(
    item => item?.path && !isStoryMediaItem(item) && isVideoMedia(item),
  );
};

const isImagePost = (post: Record<string, unknown>): boolean => {
  const displayMedia = getDisplayMedia(post);
  if (displayMedia.some(isImageMedia)) {
    return true;
  }

  return getRawMedia(post).some(
    item => item?.path && !isStoryMediaItem(item) && isImageMedia(item),
  );
};

export const filterFeedPosts = <T extends Record<string, unknown>>(
  posts: T[],
  filter: FeedFilterTab,
): T[] => {
  if (filter === 'all') {
    return posts;
  }

  return posts.filter(post => {
    switch (filter) {
      case 'following':
        return isFollowingPost(post);
      case 'videos':
        return isVideoPost(post);
      case 'images':
        return isImagePost(post);
      case 'stories':
        return isStoryPost(post);
      default:
        return true;
    }
  });
};

export const getFeedFilterApiParam = (
  filter: FeedFilterTab,
): string | undefined => (filter === 'all' ? undefined : filter);
