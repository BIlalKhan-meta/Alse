import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {selectUserProfile, selectBearerToken} from '../../store/slices/authSlice';
import agoraRtmService from '../../services/agoraRtmService';
import {getRtmToken} from '../../api/calling';
import {AGORA_RTM_TOKEN} from '../../config/agora';
import {navigateToIncomingVideoCall} from '../../utils/navigationRef';

/**
 * Handles Agora RTM login and incoming call signaling.
 * When an incoming call is received via RTM, navigates to IncomingVideoCall screen.
 */
const IncomingCallHandler: React.FC = () => {
  const user = useSelector(selectUserProfile);
  const token = useSelector(selectBearerToken);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!token || !user?.id) {
      if (hasInitialized.current) {
        agoraRtmService.logout();
        hasInitialized.current = false;
      }
      return;
    }

    const initRtm = async () => {
      console.log('[IncomingCallHandler] Initializing RTM for user:', user.id);
      const apiToken = await getRtmToken(user.id);
      // Use API token, or fallback to config RTM token for incoming call modal
      const rtmToken = apiToken?.trim() || AGORA_RTM_TOKEN || undefined;
      const success = await agoraRtmService.login(user.id, rtmToken);
      if (success) {
        hasInitialized.current = true;
        agoraRtmService.setIncomingCallCallback(payload => {
          navigateToIncomingVideoCall({
            callerName: payload.callerName,
            callerAvatar: payload.callerAvatar,
            channel: payload.channel,
            uid: parseInt(payload.callerId, 10) || 0,
            callType: payload.callType ?? 'video',
            sessionId: payload.sessionId,
          });
        });
        console.log('[IncomingCallHandler] RTM ready: incoming call modal will work');
      } else {
        console.log('[IncomingCallHandler] RTM not available: incoming call modal disabled, outgoing calls still work');
      }
    };

    initRtm();

    return () => {
      agoraRtmService.setIncomingCallCallback(null);
    };
  }, [token, user?.id]);

  return null;
};

export default IncomingCallHandler;
