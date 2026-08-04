import axiosInstance from '.';
import endpoints from './endpoints';
import store from '../store';
import {BASE_URL} from '../utils/baseurl';

export const newsFeed = data => {
  // console.log("datadatadatadatadatadatadata================>",data)
  return axiosInstance.get(`${endpoints.home.feedPost}`, {params: data});
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

export const getCommentLikes = (postId: number, commentId: number) => {
  return axiosInstance.get(`/post/${postId}/comment/${commentId}/likes`);
};

export const getPostComment = (id: number) => {
  return axiosInstance.get(`/post/${id}/comments`);
};

export const postComment = (formData: FormData, id: number) => {
  return uploadWithFetch(`/post/${id}/comment`, formData);
};

export const postCommentReply = (
  formData: FormData,
  postId: number,
  parentCommentId: number,
) => {
  return uploadWithFetch(
    `/post/${postId}/comment/${parentCommentId}/reply`,
    formData,
  );
};

export const createPost = (formData: FormData) => {
  return uploadWithFetch(
    endpoints.home.createPost,
    formData,
    CREATE_POST_UPLOAD_TIMEOUT_MS,
  );
};

export const editPost = (formData: FormData, id: number) => {
  return uploadWithFetch(
    `${endpoints.home.updatePost}/${id}`,
    formData,
    CREATE_POST_UPLOAD_TIMEOUT_MS,
  );
};
export const removeImage = (postID, id) => {
  return axiosInstance.post(
    endpoints.home.mediaDelete + `/${postID}/media/${id}/delete`,
  );
};

export const deletePost = (id: number) => {
  // console.log(id, 'idddddddddd');
  return axiosInstance.post(`${endpoints.home.deletePost}/${id}`);
};

export const reportPost = (formData: FormData) => {
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

export const getAllUsers = (page: number, text: string) => {
  return axiosInstance.get(
    `${endpoints.home.allUsers}?page=${page}&search=${text}`,
    // `${endpoints.home.allUsers}?page=${page}`,
  );
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
export const getConversations = search => {
  return axiosInstance.get(`${endpoints.chat.fetchConversation}`, {
    params: search,
  });
};

export const getChat = id => {
  return axiosInstance.get(`${endpoints.chat.fetchChat}/${id}`);
};
export const createMessage = formData => {
  return axiosInstance.post(`${endpoints.chat.send}`, formData, {
    formData: true,
  });
};
export const createGroup = (formData: FormData) => {
  return uploadWithFetch(endpoints.chat.createGroup, formData);
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
export const getNotifications = (params?: {
  type?: 'all' | 'read' | 'unread';
  per_page?: number;
  page?: number;
}) => {
  return axiosInstance.get(`${endpoints.home.notifications}`, {params});
};
export const markRead = (id: string) => {
  return axiosInstance.get(
    `${endpoints.home.notifications}/${id}/mark-as-read`,
  );
};
export const markAllRead = () => {
  return axiosInstance.post(`${endpoints.home.markAllRead}`);
};

export const getAllLogs = () => {
  return axiosInstance.get('/call-history');
};

const UPLOAD_TIMEOUT_MS = 60000; // 60s default for image uploads
const CREATE_POST_UPLOAD_TIMEOUT_MS = 300000; // 5 min for posts with video

/**
 * Upload FormData via fetch. Avoids axios FormData/Android Network Error issues.
 * Returns { data } to match axios response shape for existing callers.
 */
async function uploadWithFetch(
  path: string,
  body: FormData,
  timeoutMs: number = UPLOAD_TIMEOUT_MS,
): Promise<{data: any}> {
  const token = store.getState().auth.token;
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Do NOT set Content-Type – fetch sets multipart/form-data with boundary

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
      const err: any = new Error('Upload timed out. Try a shorter video or better connection.');
      err.code = 'ECONNABORTED';
      throw err;
    }
    if (e?.message === 'Network request failed') {
      const err: any = new Error(
        'Upload failed. The video file may be missing or too large to send.',
      );
      throw err;
    }
    throw e;
  }
}

export const uploadImages = (body: FormData) => {
  return uploadWithFetch(endpoints.chat.send_image_message, body);
};

export const uploadVideo = (body: FormData) => {
  return uploadWithFetch(endpoints.chat.send_video_message, body);
};
