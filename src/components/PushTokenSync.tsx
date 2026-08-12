import React, {useEffect} from 'react';
import {AppState} from 'react-native';
import {useSelector} from 'react-redux';
import {syncFcmTokenWithBackend} from '../services/pushNotificationService';
import {refreshNotificationBadgeFromApi} from '../utils/notificationBadge';

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
    syncFcmTokenWithBackend().catch(() => {});
    refreshNotificationBadgeFromApi().catch(() => {});

    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncFcmTokenWithBackend().catch(() => {});
        refreshNotificationBadgeFromApi().catch(() => {});
      }
    });
    return () => sub.remove();
  }, [token]);

  return null;
};

export default PushTokenSync;
