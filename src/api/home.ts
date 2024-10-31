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

export const commentLike = (id: number, commentId: number) => {
  return axiosInstance.post(`/post/${id}/comment/${commentId}/like`);
};

export const savePost = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.home.saveItem}`, formData, {
    formData: true,
  });
};

export const getPostComment = (id: number) => {
  return axiosInstance.get(`/post/${id}/comments`);
};

export const postComment = (formData: FormData, id: number) => {
  console.log('body, id body, idbody, idbody, idbody, id ==>', formData, id);

  return axiosInstance.post(`/post/${id}/comment`, formData, {
    formData: true,
  });
};

export const createPost = (formData: FormData) => {
  console.log(formData, 'Formmmm Dataaaa Createee possttt');
  return axiosInstance.post(endpoints.home.createPost, formData, {
    formData: true, // This triggers the form-data handling in the interceptor
  });
};

export const editPost = (formData: FormData, id: number) => {
  return axiosInstance.post(endpoints.home.updatePost + `/${id}`, formData, {
    formData: true,
  });
};

export const deletePost = (id: number) => {
  console.log(id, 'idddddddddd');
  return axiosInstance.post(`${endpoints.home.deletePost}/${id}`);
};

export const reportPost = (formData: FormData) => {
  console.log(formData, 'formData');
  return axiosInstance.post(`${endpoints.home.reportPost}`, formData, {
    formData: true,
  });
};

export const fetchMyPost = (id: number) => {
  return axiosInstance.get(endpoints.home.myPost + `/${id}/posts`);
};

export const getBlockedUsers = () => {
  return axiosInstance.get(endpoints.home.getBlockedUser);
};

export const userBlock = (id: number) => {
  console.log('id ================>', id);
  return axiosInstance.post(`${endpoints.home.block}/${id}`);
};
export const userUnblock = (id: number) => {
  console.log('id ================>', id);
  return axiosInstance.post(`${endpoints.home.unBlock}/${id}`);
};

export const getRequestFollow = () => {
  return axiosInstance.get(endpoints.home.followRequest);
};

export const getFollowersList = () => {
  return axiosInstance.get(endpoints.home.followers);
};

export const getFollowingList = () => {
  return axiosInstance.get(endpoints.home.following);
};

export const userFollow = (id: number) => {
  console.log('id ================>', id);
  return axiosInstance.post(`${endpoints.home.follow}/${id}`);
};
export const userUnFollow = (id: number) => {
  console.log('id ================>', id);
  return axiosInstance.post(`${endpoints.home.unFollow}/${id}`);
};

export const userFollowAccept = (id: number) => {
  console.log('id ================>', id);
  return axiosInstance.post(`${endpoints.home.acceptFollow}/${id}`);
};

export const userFollowReject = (id: number) => {
  console.log('id ================>', id);
  return axiosInstance.post(`${endpoints.home.rejectFollow}/${id}`);
};
