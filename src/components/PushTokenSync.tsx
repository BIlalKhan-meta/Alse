import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {syncFcmTokenWithBackend} from '../services/pushNotificationService';

/**
 * Registers FCM device with backend whenever the user is authenticated
 * (including cold start with persisted session).
 */
const PushTokenSync: React.FC = () => {
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    if (!token) {
      return;
    }
    syncFcmTokenWithBackend().catch(() => {});
  }, [token]);

  return null;
};

export default PushTokenSync;
