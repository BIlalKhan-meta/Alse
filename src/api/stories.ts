import axiosInstance from '.';
import endpoints from './endpoints';
import store from '../store';
import {BASE_URL} from '../utils/baseurl';

const UPLOAD_TIMEOUT_MS = 60000; // 60s for image/video uploads

export type StoryAnalyticsEvent = 'opened' | 'completed' | 'skipped';
type UploadProgressCallback = (progress: number) => void;

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
    headers.Authorization = `Bearer ${token}`;
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

async function uploadWithProgress(
  path: string,
  body: FormData,
  onProgress?: UploadProgressCallback,
): Promise<{data: any}> {
  const token = store.getState().auth.token;
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      callback();
    };

    timeoutId = setTimeout(() => {
      request.abort();
      finish(() => {
        const err: any = new Error('Network request timeout');
        err.code = 'ECONNABORTED';
        reject(err);
      });
    }, UPLOAD_TIMEOUT_MS);

    request.open('POST', url);
    request.setRequestHeader('Accept', 'application/json');
    if (token) {
      request.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    request.upload.onprogress = event => {
      if (!event.lengthComputable || !event.total) {
        return;
      }
      const progress = Math.min(
        99,
        Math.round((event.loaded / event.total) * 100),
      );
      onProgress?.(progress);
    };

    request.onload = () => {
      finish(() => {
        let data = {};
        try {
          data = request.responseText ? JSON.parse(request.responseText) : {};
        } catch {
          data = {};
        }

        if (request.status >= 200 && request.status < 300) {
          onProgress?.(100);
          resolve({data});
          return;
        }

        const err: any = new Error(request.statusText || 'Upload failed');
        err.response = {status: request.status, data};
        reject(err);
      });
    };

    request.onerror = () => {
      finish(() => reject(new Error('Network request failed')));
    };

    request.onabort = () => {
      finish(() => {
        const err: any = new Error('Network request timeout');
        err.code = 'ECONNABORTED';
        reject(err);
      });
    };

    onProgress?.(0);
    request.send(body);
  });
}

export const GetStories = () => {
  return axiosInstance.get(`${endpoints.stories.getStories}`);
};

export const AddStory = async (
  formData: FormData,
  onProgress?: UploadProgressCallback,
) => {
  if (onProgress) {
    return uploadWithProgress(
      endpoints.stories.addStories,
      formData,
      onProgress,
    );
  }

  return uploadWithFetch(endpoints.stories.addStories, formData);
};

export const DeleteStory = (storyId: string | number) => {
  return axiosInstance.delete(`${endpoints.stories.getStories}/${storyId}`);
};

export const TrackStoryAnalytics = (
  storyId: string | number,
  event: StoryAnalyticsEvent,
) => {
  return axiosInstance.post(endpoints.stories.analytics(storyId), {event});
};
