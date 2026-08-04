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

export type NotificationPreferenceKey =
  | 'messages_enabled'
  | 'replies_enabled'
  | 'comments_enabled'
  | 'followers_enabled'
  | 'likes_enabled'
  | 'mentions_enabled'
  | 'promotions_enabled'
  | 'price_drop_enabled'
  | 'local_activity_enabled'
  | 'marketplace_enabled'
  | 'announcements_enabled'
  | 'orders_enabled'
  | 'email_enabled'
  | 'push_enabled';

/** @deprecated legacy key alias */
export type NotificationTypeKey = NotificationPreferenceKey;

/**
 * PUT /api/notifications/delivery-preferences with JSON body.
 * Sends only the single updated toggle (Module 10 flat keys).
 */
export const updateNotificationToggle = (
  typeKey: NotificationPreferenceKey | string,
  value: boolean,
) => {
  return axiosInstance.put(
    endpoints.settings.notifications,
    {[typeKey]: value},
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};

export const updateNotificationSettings = (data: Record<string, boolean>) => {
  return axiosInstance.put(endpoints.settings.notifications, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
