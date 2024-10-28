import axiosInstance from '.';
import endpoints from './endpoints';

export const getArticles = () => {
  //   console.log(axiosInstance.get(`${endpoints.profile.getProfile}`));
  return axiosInstance.get(`${endpoints.education.getArticles}`);
};
export const getBlogs = () => {
  //   console.log(axiosInstance.get(`${endpoints.profile.getProfile}`));
  return axiosInstance.get(`${endpoints.education.getBlogs}`);
};
export const getVideos = () => {
  //   console.log(axiosInstance.get(`${endpoints.profile.getProfile}`));
  return axiosInstance.get(`${endpoints.education.getVideos}`);
};

export const getBlog = (id: number) => {
  return axiosInstance.get(`${endpoints.education.getBlog}/${id}`);
};
export const getArticle = (id: number) => {
  return axiosInstance.get(`${endpoints.education.getArticle}/${id}`);
};
