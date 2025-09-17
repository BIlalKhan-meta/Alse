import axiosInstance from '.';
import endpoints from './endpoints';

export const getPrivacySettings = () => {
  return axiosInstance.get(endpoints.settings.privacy);
};

export const updatePrivacySettings = (data: any) => {
  return axiosInstance.put(endpoints.settings.privacy, data, {
    // Changed to POST
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const changePassword = (data: {
  old_password: string;
  new_password: string;
  confirm_password: string;
}) => {
  return axiosInstance.post(endpoints.settings.changePassword, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteAccount = () => {
  return axiosInstance.post(
    endpoints.settings.deleteAccount,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
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

export const updateUserType = (userType: 'buyer' | 'seller' | 'rider') => {
  return axiosInstance.post(
    endpoints.settings.updateUserType,
    { user_type: userType },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
