import axiosInstance from '.';
import endpoints from './endpoints';

export const newsFeed = () => {
  console.log(axiosInstance.get(`${endpoints.home.feedPost}`));
  return axiosInstance.get(`${endpoints.home.feedPost}`);
};

export const fetchProfileById = (id: number) => {
  return axiosInstance.get(endpoints.home.profileById + `/${id}`);
};

export const postLike = (id: number) => {
  return axiosInstance.post(`/post/${id}/like`);
};
