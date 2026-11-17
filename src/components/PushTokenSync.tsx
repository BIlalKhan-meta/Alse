import React, {useEffect} from 'react';
import {AppState} from 'react-native';
import {useSelector} from 'react-redux';
import {syncFcmTokenWithBackend} from '../services/pushNotificationService';
import {refreshNotificationBadgeFromApi} from '../utils/notificationBadge';
import axiosInstance from '../api';
import {
  onVoipToken,
  setupNativeCallKeep,
} from '../services/nativeCallKeepService';
import {syncPeopleYouMayKnowAfterLogin} from '../services/peopleYouMayKnowService';
import {selectUserProfile} from '../store/slices/authSlice';

/**
 * Registers FCM device with backend whenever the user is authenticated
 * (including cold start with persisted session). Retries on AppState active.
 * Also runs one-time People You May Know contacts sync after push settles.
 */
const PushTokenSync: React.FC = () => {
  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector(selectUserProfile);

  useEffect(() => {
    if (!token) {
      return;
    }

    const syncPresence = () => {
      axiosInstance.post('/presence/heartbeat').catch(() => {});
    };

    let cancelled = false;
    let pymkTimer: ReturnType<typeof setTimeout> | undefined;

    const syncPymk = () => {
      if (cancelled) {
        return;
      }
      // Defer so contacts permission does not race iOS startup / push prompts.
      pymkTimer = setTimeout(() => {
        if (cancelled) {
          return;
        }
        syncPeopleYouMayKnowAfterLogin({
          latitude: user?.latitude,
          longitude: user?.longitude,
          location_name: user?.location_name || user?.location || null,
        }).catch(err => console.warn('[PYMK] post-login sync failed', err));
      }, 1500);
    };

    setupNativeCallKeep().catch(err =>
      console.warn('[CallKeep] setup failed', err),
    );
    onVoipToken(() => {
      syncFcmTokenWithBackend().catch(() => {});
    });
    syncFcmTokenWithBackend()
      .catch(() => {})
      .finally(() => {
        syncPymk();
      });
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
      cancelled = true;
      if (pymkTimer) {
        clearTimeout(pymkTimer);
      }
      sub.remove();
      clearInterval(intervalId);
    };
  }, [token, user?.latitude, user?.longitude, user?.location_name, user?.location]);

  return null;
};

export default PushTokenSync;
