import axiosInstance from '.';
import endpoints from './endpoints';

export const getVideos = () => {
  // todo need to change the endpoint
  return axiosInstance.get(`${endpoints.home.videos}`);
};
