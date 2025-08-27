import axiosInstance from '.';
import endpoints from './endpoints';

export const getPrivacySettings = () => {
  return axiosInstance.get(endpoints.settings.privacy);
};

export const updatePrivacySettings = (formData: FormData, id: number) => {
  return axiosInstance.post(`${endpoints.settings.privacy}/${id}`, formData, {
    formData: true,
  });
};

export const getNotificationSettings = () => {
  return axiosInstance.get(endpoints.settings.notifications);
};

export const updateNotificationSettings = (formData: FormData, id: number) => {
  return axiosInstance.post(
    `${endpoints.settings.notifications}/${id}`,
    formData,
    {
      formData: true,
    },
  );
};

export const getSellerSettings = () => {
  return axiosInstance.get(endpoints.settings.privacy);
};

export const updateSellerSettings = (formData: FormData, id: number) => {
  return axiosInstance.post(
    `${endpoints.settings.sellerSettings}/${id}`,
    formData,
    {
      formData: true,
    },
  );
};
