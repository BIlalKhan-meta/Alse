import axiosInstance from '.';
import endpoints from './endpoints';
import store from '../store';
import {BASE_URL} from '../utils/baseurl';

const UPLOAD_TIMEOUT_MS = 60000; // 60s for image/video uploads

/**
 * Upload FormData via fetch. Avoids axios FormData/Android Network Error issues.
 */
async function uploadWithFetch(
  path: string,
  body: FormData,
): Promise<{data: any}> {
  const token = store.getState().auth.token;
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err: any = new Error(response.statusText || 'Upload failed');
      err.response = {status: response.status, data};
      throw err;
    }
    return {data};
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      const err: any = new Error('Network request timeout');
      err.code = 'ECONNABORTED';
      throw err;
    }
    throw e;
  }
}

export const GetStories = () => {
  return axiosInstance.get(`${endpoints.stories.getStories}`);
};

export const AddStory = async (formData: FormData) => {
  return uploadWithFetch(endpoints.stories.addStories, formData);
};

export const DeleteStory = (storyId: string | number) => {
  return axiosInstance.delete(`${endpoints.stories.getStories}/${storyId}`);
};