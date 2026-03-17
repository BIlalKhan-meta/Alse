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

  useEffect(() => {
    if (!token || !user?.id) {
      if (hasInitialized.current) {
        zegoCallService.uninit();
        hasInitialized.current = false;
      }
      return;
    }

    const initZego = async () => {
      console.log('[IncomingCallHandler] Initializing ZEGOCLOUD for user:', user.id);
      const success = await zegoCallService.init(
        user.id,
        user.full_name || user.name || `user_${user.id}`,
      );
      if (success) {
        hasInitialized.current = true;
        console.log('[IncomingCallHandler] ZEGOCLOUD ready: incoming calls will work');
      } else {
        console.log('[IncomingCallHandler] ZEGOCLOUD init failed');
      }
    };

    initZego();

    return () => {
      zegoCallService.uninit();
    };
  }, [token, user?.id, user?.full_name, user?.name]);

  return null;
};

export default IncomingCallHandler;
