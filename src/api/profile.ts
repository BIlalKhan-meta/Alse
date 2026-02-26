import axiosInstance from '.';
import endpoints from './endpoints';

export const getProfile = () => {
  return axiosInstance.get(`${endpoints.profile.getProfile}`);
};

export interface EditProfilePayload {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
  location_name?: string;
  pronouns?: string;
  avatar?: string;
  name?: string;
  email?: string;
}

/** Edit profile with JSON body (including avatar as URL string). */
export const editProfileWithJson = (payload: EditProfilePayload) => {
  return axiosInstance.post(endpoints.profile.editProfile, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const editProfile = (formData: FormData) => {
  return axiosInstance.post(endpoints.profile.editProfile, formData, {
    formData: true,
    // Leave FormData unchanged so the file is sent in the multipart payload
    transformRequest: [(data, headers) => data],
  } as any);
};

export const changePassword = (formData: FormData) => {
  console.log('body, id body, idbody, idbody, idbody, id ==>', formData);

  return axiosInstance.post(endpoints.profile.changePassword, formData, {
    formData: true,
  } as any);
};

export const getUserPosts = (userId: string) => {
  const endpoint = endpoints.profile.getUserPosts.replace('{id}', userId);
  return axiosInstance.get(endpoint);
};
export const deleteAccount = () => {
  return axiosInstance.post(endpoints.profile.deleteAccount);
};
