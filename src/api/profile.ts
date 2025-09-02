import axiosInstance from '.';
import endpoints from './endpoints';

export const getProfile = () => {
  return axiosInstance.get(`${endpoints.profile.getProfile}`);
};

export const editProfile = (formData: FormData) => {
  return axiosInstance.post(endpoints.profile.editProfile, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const changePassword = (formData: FormData) => {
  console.log('body, id body, idbody, idbody, idbody, id ==>', formData);

  return axiosInstance.post(endpoints.profile.changePassword, formData, {
    formData: true,
  });
};

export const getUserPosts = (userId: string) => {
  const endpoint = endpoints.profile.getUserPosts.replace('{id}', userId);
  return axiosInstance.get(endpoint);
};
export const deleteAccount = () => {
  return axiosInstance.post(endpoints.profile.deleteAccount);
};
