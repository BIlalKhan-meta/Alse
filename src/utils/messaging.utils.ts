import {useEffect} from 'react';
import {getFcmToken} from '../services/pushNotificationService';

export {getFcmToken};

export const NotificationListener = () => {
  useEffect(() => {
    // Notification lifecycle is centralized in pushNotificationService.
  }, []);

  return null;
};

export const BacKgroundNotifListener = () => {
  useEffect(() => {
    // Background FCM handling is registered from index.js.
  }, []);

  return null;
};
