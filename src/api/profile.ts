import axiosInstance from '.';
import endpoints from './endpoints';

export const editProfile = (formData: FormData) => {
  console.log('body, id body, idbody, idbody, idbody, id ==>', formData);

  return axiosInstance.post(endpoints.profile.editProfile, formData, {
    formData: true,
  });
};
