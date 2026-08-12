import axiosInstance from './index';
import endpoints from './endpoints';

export type PresignUpload = {
  upload_url: string;
  key: string;
  filename: string;
  disk: string;
  headers: Record<string, string>;
  expires_at: string;
};

export type MediaKeyPayload = {
  key: string;
  type: 'image' | 'video';
  filename?: string;
};

export const requestMediaPresign = (payload: {
  content_type: string;
  extension: string;
  folder?: 'posts' | 'stories' | 'videos';
  filename_prefix?: string;
  count?: number;
}) => {
  return axiosInstance.post(endpoints.media.presign, payload);
};

export const finalizeMediaUpload = (payload: {
  files: MediaKeyPayload[];
  post_id?: number;
  folder?: 'posts' | 'stories' | 'videos';
}) => {
  return axiosInstance.post(endpoints.media.finalize, payload);
};

export const createPostWithMediaKeys = (payload: {
  description: string;
  privacy: string | number;
  media_keys?: MediaKeyPayload[];
}) => {
  return axiosInstance.post(endpoints.home.createPost, {
    description: payload.description,
    content: payload.description,
    privacy: payload.privacy,
    media_keys: payload.media_keys ?? [],
  });
};
