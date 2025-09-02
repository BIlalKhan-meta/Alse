import axiosInstance from '.';
import endpoints from './endpoints';

export const getProfile = () => {
  // console.log("=====",axiosInstance.get(`${endpoints.profile.getProfile}`));
  return axiosInstance.get(`${endpoints.profile.getProfile}`);
};

export const editProfile = (formData: FormData) => {
  console.log('editProfile called with FormData:', formData);

  // Log FormData contents for debugging
  if (formData && typeof formData.getParts === 'function') {
    console.log('FormData parts:', formData.getParts());
  }

  return axiosInstance.post(endpoints.profile.editProfile, formData, {
    formData: true,
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
