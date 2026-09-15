import axiosInstance from '.';
import endpoints from './endpoints';

/** 'story' covers statuses; reels and uploaded videos are both 'video'. */
export type ViewableType = 'post' | 'video' | 'story';

/**
 * Counts one unique view. Repeat views by the same user, and an author viewing
 * their own media, are ignored by the server.
 */
export const recordMediaView = (type: ViewableType, id: number | string) => {
  return axiosInstance.post(endpoints.views.record, {type, id});
};

/** Who viewed a piece of media. The server restricts this to the author. */
export const getMediaViewers = (
  type: ViewableType,
  id: number | string,
  page = 1,
) => {
  return axiosInstance.get(`${endpoints.views.viewers(type, id)}?page=${page}`);
};
