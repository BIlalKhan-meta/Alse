import axiosInstance from '.';
import endpoints from './endpoints';
import store from '../store';
import {BASE_URL} from '../utils/baseurl';

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000; // 5 min for compressed video uploads

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

/**
 * Fetch video categories. Uses same /categories endpoint as blogs/products.
 * Backend validates category_id against the categories table.
 */
export const getVideoCategories = () => {
  return axiosInstance.get(endpoints.products.category);
};

export const getVideos = (page = 1, limit = 10) => {
  console.log('Fetching videos with page:', page, 'limit:', limit);
  console.log('Using endpoint:', endpoints.education.getVideos);

  // Try the education videos endpoint first
  return axiosInstance.get(
    `${endpoints.search.videos}?page=${page}&limit=${limit}`,
  );
};

export const uploadVideo = (formData: FormData, categoryId: number) => {
  return axiosInstance.post(
    endpoints.search.videos + `/${categoryId}`,
    formData,
    {
      formData: true,
    },
  );
};

export const createVideo = (formData: FormData) => {
  return uploadWithFetch('/video/create', formData);
};
