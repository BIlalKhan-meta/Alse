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

export const createPost = (formData: FormData) => {
  console.log(formData, 'Formmmm Dataaaa Createee possttt');
  return axiosInstance.post(endpoints.home.createPost, formData, {
    formData: true, // This triggers the form-data handling in the interceptor
  });
};

export const fetchMyPost = (id: number) => {
  return axiosInstance.get(endpoints.home.myPost + `/${id}/posts`);
};
