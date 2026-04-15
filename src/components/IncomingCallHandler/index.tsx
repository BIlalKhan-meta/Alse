import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {selectUserProfile, selectBearerToken} from '../../store/slices/authSlice';
import zegoCallService from '../../services/zegoCallService';

/**
 * Handles ZEGOCLOUD Call Kit initialization on user login.
 * ZegoCallInvitationDialog (in App.tsx) handles incoming call UI automatically.
 */
const IncomingCallHandler: React.FC = () => {
  const user = useSelector(selectUserProfile);
  const token = useSelector(selectBearerToken);
  const hasInitialized = useRef(false);
  const initializedUserIdRef = useRef<string | null>(null);
  const initInFlightRef = useRef(false);

  useEffect(() => {
    // Only tear down on real logout. If the token is still valid but `user` is
    // momentarily missing (persist rehydrate, profile refresh), uninit would drop
    // the ZIM session and break incoming invitations while backgrounded.
    if (!token) {
      if (hasInitialized.current) {
        zegoCallService.uninit();
        hasInitialized.current = false;
        initializedUserIdRef.current = null;
      }
      return;
    }

    const currentUserId = user?.id != null ? String(user.id) : null;
    if (!currentUserId) {
      return;
    }

    // Avoid tearing down/re-initializing on harmless profile changes.
    if (
      hasInitialized.current &&
      initializedUserIdRef.current === currentUserId &&
      zegoCallService.isLoggedIn()
    ) {
      return;
    }

    const initZego = async () => {
      if (initInFlightRef.current) return;
      initInFlightRef.current = true;
      try {
        if (
          hasInitialized.current &&
          initializedUserIdRef.current &&
          initializedUserIdRef.current !== currentUserId
        ) {
          zegoCallService.uninit();
          hasInitialized.current = false;
        }

        console.log('[IncomingCallHandler] Initializing ZEGOCLOUD for user:', currentUserId);
        const success = await zegoCallService.init(
          currentUserId,
          user?.full_name || user?.name || `user_${currentUserId}`,
        );
        if (success) {
          hasInitialized.current = true;
          initializedUserIdRef.current = currentUserId;
          console.log('[IncomingCallHandler] ZEGOCLOUD ready: incoming calls will work');
        } else {
          console.log('[IncomingCallHandler] ZEGOCLOUD init failed');
        }
      } finally {
        initInFlightRef.current = false;
      }
    };

    initZego();
  }, [token, user?.id]);

  useEffect(() => {
    return () => {
      if (hasInitialized.current) {
        zegoCallService.uninit();
        hasInitialized.current = false;
        initializedUserIdRef.current = null;
      }
    };
  }, []);

  return null;
};

export default IncomingCallHandler;
