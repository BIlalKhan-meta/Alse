import {createListenerMiddleware, isAnyOf} from '@reduxjs/toolkit';
import {logout, LogoutUser} from './slices/authSlice';
import agoraRtmCallService from '../services/agoraRtmCallService';
import chatSocket from '../services/chatSocket';

export const callCleanupListener = createListenerMiddleware();

callCleanupListener.startListening({
  matcher: isAnyOf(logout, LogoutUser.fulfilled),
  effect: async () => {
    await agoraRtmCallService.releaseAgoraRtm().catch(() => {});
    chatSocket.disconnect();
  },
});
