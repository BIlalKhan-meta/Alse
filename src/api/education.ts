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
export const getMyArticles = () => {
  //   console.log(axiosInstance.get(`${endpoints.profile.getProfile}`));
  return axiosInstance.get(`${endpoints.education.getMyArticles}`);
};
export const getMyBlogs = () => {
  //   console.log(axiosInstance.get(`${endpoints.profile.getProfile}`));
  return axiosInstance.get(`${endpoints.education.getMyBlogs}`);
};
export const getMyVideos = () => {
  //   console.log(axiosInstance.get(`${endpoints.profile.getProfile}`));
  return axiosInstance.get(`${endpoints.education.getMyVideos}`);
};

export const getBlog = (id: number) => {
  return axiosInstance.get(`${endpoints.education.getBlog}/${id}`);
};
export const getArticle = (id: number) => {
  return axiosInstance.get(`${endpoints.education.getArticle}/${id}`);
};
export const getVideo = (id: number) => {
  return axiosInstance.get(`${endpoints.education.getVideo}/${id}`);
};
export const getSimilarVideos = (id: number) => {
  return axiosInstance.get(
    `${endpoints.education.similarVideos}/${id}/similar`,
  );
};

export const createArticle = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.education.createArticle}`, formData, {
    formData: true,
  });
};

export const createBlog = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.education.createBlog}`, formData, {
    formData: true,
  });
};
export const createVideo = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.education.createVideo}`, formData, {
    formData: true,
  });
};

export const updateArticleStatus = (id: number) => {
  return axiosInstance.post(`${endpoints.education.updateArticleStatus}/${id}`);
};
export const updateBlogStatus = (id: number) => {
  return axiosInstance.post(`${endpoints.education.updateBlogStatus}/${id}`);
};
export const updateBlog = (formData: FormData, id: number) => {
  return axiosInstance.post(
    `${endpoints.education.updateBlog}/${id}`,
    formData,
    {
      formData: true,
    },
  );
};
export const updateArticle = (formData: FormData, id: number) => {
  return axiosInstance.post(
    `${endpoints.education.updateArticle}/${id}`,
    formData,
    {
      formData: true,
    },
  );
};
export const updateVideo = (formData: FormData, id: number) => {
  return axiosInstance.post(
    `${endpoints.education.updateVideo}/${id}`,
    formData,
    {
      formData: true,
    },
  );
};
