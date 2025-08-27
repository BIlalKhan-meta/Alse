import axiosInstance from '.';
import endpoints from './endpoints';

export const getVideos = (page = 1, limit = 10) => {
  console.log('Fetching videos with page:', page, 'limit:', limit);
  console.log('Using endpoint:', endpoints.education.getVideos);

  // Try the education videos endpoint first
  return axiosInstance.get(
    `${endpoints.education.getVideos}?page=${page}&limit=${limit}`,
  );
};
