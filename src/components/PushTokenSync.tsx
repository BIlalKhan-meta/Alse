import React, {useEffect} from 'react';
import {AppState} from 'react-native';
import {useSelector} from 'react-redux';
import {syncFcmTokenWithBackend} from '../services/pushNotificationService';
import {refreshNotificationBadgeFromApi} from '../utils/notificationBadge';
import axiosInstance from '../api';

/**
 * Registers FCM device with backend whenever the user is authenticated
 * (including cold start with persisted session). Retries on AppState active.
 */
const PushTokenSync: React.FC = () => {
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    if (!token) {
      return;
    }

    const syncPresence = () => {
      axiosInstance.post('/presence/heartbeat').catch(() => {});
    };

    syncFcmTokenWithBackend().catch(() => {});
    refreshNotificationBadgeFromApi().catch(() => {});
    syncPresence();

    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncFcmTokenWithBackend().catch(() => {});
        refreshNotificationBadgeFromApi().catch(() => {});
        syncPresence();
      }
    });

    const intervalId = setInterval(syncPresence, 60_000);

    return () => {
      sub.remove();
      clearInterval(intervalId);
    };
  }, [token]);

  return null;
};

export default PushTokenSync;
