import axiosInstance from '.';
import endpoints from './endpoints';
import store from '../store';
import {BASE_URL} from '../utils/baseurl';

const REQUEST_TIMEOUT_MS = 15000;

/**
 * POST FormData via fetch. Avoids axios FormData/Android Network Error issues.
 */
async function postFormDataWithFetch(
  path: string,
  body: FormData,
): Promise<{data: any}> {
  const token = store.getState().auth.token;
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
      const err: any = new Error(response.statusText || 'Request failed');
      err.response = {status: response.status, data};
      throw err;
    }
    return {data};
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      const err: any = new Error('Network request timeout');
      err.code = 'ECONNABORTED';
      throw err;
    }
    throw e;
  }
}

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

export type NotificationTypeKey =
  | 'social_likes'
  | 'social_comments'
  | 'social_follows'
  | 'marketplace_orders'
  | 'marketplace_payments'
  | 'seller_new_orders'
  | 'seller_reviews'
  | 'security_alerts';

/**
 * POST /api/notifications/delivery-preferences with FormData.
 * Sends only the single updated toggle.
 */
export const updateNotificationToggle = (
  typeKey: NotificationTypeKey,
  value: boolean,
) => {
  const formData = new FormData();
  formData.append(`types[${typeKey}]`, value ? '1' : '0');
  return postFormDataWithFetch(endpoints.settings.notifications, formData);
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
