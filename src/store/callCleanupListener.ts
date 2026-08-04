import {createListenerMiddleware, isAnyOf} from '@reduxjs/toolkit';
import {logout, LogoutUser} from './slices/authSlice';
import agoraRtmCallService from '../services/agoraRtmCallService';
import chatSocket from '../services/chatSocket';
import {unregisterFcmDeviceFromBackend} from '../services/pushNotificationService';

export const callCleanupListener = createListenerMiddleware();

callCleanupListener.startListening({
  matcher: isAnyOf(logout, LogoutUser.fulfilled),
  effect: async (_action, api) => {
    const prevToken = (api.getOriginalState() as any)?.auth?.token ?? null;
    await unregisterFcmDeviceFromBackend(prevToken).catch(() => {});
    await agoraRtmCallService.releaseAgoraRtm().catch(() => {});
    chatSocket.disconnect();
  },
});
