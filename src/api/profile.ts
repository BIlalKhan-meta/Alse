import axiosInstance from '.';
import endpoints from './endpoints';

export const getProfile = () => {
  // console.log("=====",axiosInstance.get(`${endpoints.profile.getProfile}`));
  return axiosInstance.get(`${endpoints.profile.getProfile}`);
};

export const editProfile = (formData: FormData) => {
  console.log('body, id body, idbody, idbody, idbody, id ==>', formData);

  return axiosInstance.post(endpoints.profile.editProfile, formData, {
    formData: true,
  });
};

export const changePassword = (formData: FormData) => {
  console.log('body, id body, idbody, idbody, idbody, id ==>', formData);

  return axiosInstance.post(endpoints.profile.changePassword, formData, {
    formData: true,
  });
};
export const deleteAccount = () => {
  return axiosInstance.post(endpoints.profile.deleteAccount);
};
