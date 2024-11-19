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

export const getPostComment = (id: number) => {
  return axiosInstance.get(`/post/${id}/comments`);
};

export const postComment = (formData: FormData, id: number) => {
  return axiosInstance.post(`/post/${id}/comment`, formData, {
    formData: true,
  });
};

export const createPost = (formData: FormData) => {
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

export const createChat = data => {
  return axiosInstance.post(`${endpoints.chat.create}`, data);
};
export const getConversations = () => {
  return axiosInstance.get(`${endpoints.chat.fetchConversation}`);
};

export const getChat = id => {
  return axiosInstance.get(`${endpoints.chat.fetchChat}/${id}`);
};
export const createMessage = formData => {
  return axiosInstance.post(`${endpoints.chat.send}`, formData, {
    formData: true,
  });
};
export const createGroup = formData => {
  return axiosInstance.post(endpoints.chat.createGroup, formData, {
    formData: true,
  });
};
// export const signup = (formData: any) => {
//   return axiosInstance.post(endpoints.auth.signup, formData, {
//     formData: true,
//   });
// };
export const userFollowAccept = (id: number) => {
  console.log('id ================>', id);
  return axiosInstance.post(`${endpoints.home.acceptFollow}/${id}`);
};

export const userFollowReject = (id: number) => {
  console.log('id ================>', id);
  return axiosInstance.post(`${endpoints.home.rejectFollow}/${id}`);
};

export const removeFollower = (id: number) => {
  return axiosInstance.post(`${endpoints.home.removeFollower}/${id}`);
};

export const getCountriesList = () => {
  return axiosInstance.get(endpoints.home.countries);
};

export const getState = (id: number) => {
  return axiosInstance.get(`${endpoints.home.countries}/${id}/states`);
};
export const getCity = (id: number) => {
  return axiosInstance.get(`${endpoints.home.state}/${id}/cities`);
};
export const getNotifications = () => {
  return axiosInstance.get(`${endpoints.home.notifications}`);
};
export const markRead = (id: string) => {
  return axiosInstance.get(`${endpoints.home.markRead}/${id}`);
};
