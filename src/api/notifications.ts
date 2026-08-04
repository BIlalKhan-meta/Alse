import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import axiosInstance from '.';
import endpoints from './endpoints';
import store from '../store';
import {BASE_URL} from '../utils/baseurl';

export type FcmDevicePayload = {
  fcm_token: string;
  device_id: string;
  device_type: 'android' | 'ios' | 'web';
  device_name?: string;
};

let cachedDeviceId: string | null = null;

export async function getStableDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }
  try {
    const id = await DeviceInfo.getUniqueId();
    cachedDeviceId = id || `device-${Platform.OS}`;
  } catch {
    cachedDeviceId = `device-${Platform.OS}-${Date.now()}`;
  }
  return cachedDeviceId;
}

export function getDeviceType(): 'android' | 'ios' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

export async function buildFcmDevicePayload(
  fcmToken: string,
): Promise<FcmDevicePayload> {
  const device_id = await getStableDeviceId();
  let device_name: string | undefined;
  try {
    device_name = await DeviceInfo.getModel();
  } catch {
    device_name = undefined;
  }
  return {
    fcm_token: fcmToken,
    device_id,
    device_type: getDeviceType(),
    device_name,
  };
}

export const registerFcmDevice = (payload: FcmDevicePayload) => {
  return axiosInstance.post(endpoints.home.fcmRegister, payload);
};

export const refreshFcmDevice = (payload: FcmDevicePayload) => {
  return axiosInstance.post(endpoints.home.fcmRefresh, payload);
};

/**
 * Unregister device. Pass authTokenOverride when calling during logout
 * (store token may already be cleared).
 */
export async function removeFcmDevice(
  deviceId?: string,
  authTokenOverride?: string | null,
): Promise<void> {
  const device_id = deviceId || (await getStableDeviceId());
  const token = authTokenOverride ?? store.getState().auth.token;
  const url = `${BASE_URL.replace(/\/$/, '')}${endpoints.home.fcmRemove}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({device_id}),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err: any = new Error(data?.message || 'Failed to remove FCM device');
    err.response = {status: response.status, data};
    throw err;
  }
}

export const getUnreadNotificationCount = () => {
  return axiosInstance.get(endpoints.home.unreadCount);
};

export const trackNotificationOpen = (id: string) => {
  return axiosInstance.post(`${endpoints.home.notificationOpen}/${id}/open`);
};

export const trackNotificationClick = (id: string) => {
  return axiosInstance.post(`${endpoints.home.notificationClick}/${id}/click`);
};

export const getNotificationsList = (params?: {
  type?: 'all' | 'read' | 'unread';
  per_page?: number;
  page?: number;
}) => {
  return axiosInstance.get(endpoints.home.notifications, {params});
};

export const markNotificationRead = (id: string) => {
  return axiosInstance.get(
    `${endpoints.home.markRead}/${id}/mark-as-read`,
  );
};

export const markAllNotificationsRead = () => {
  return axiosInstance.post(endpoints.home.markAllRead);
};

export const deleteNotification = (id: string) => {
  return axiosInstance.delete(`${endpoints.home.notifications}/${id}`);
};
