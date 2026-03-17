import {
  createCallSession,
  endCallSession,
  getAgoraTokenForAudience,
  getChannelUsers,
} from '../api/calling';
import agoraCallService from './agoraCallService';
import callNotificationService from './callNotificationService';
import agoraRtmService from './agoraRtmService';

/**
 * Service for managing complete call flow
 */
class CallManagerService {
  private currentCall: {
    sessionId?: string;
    channel?: string;
    isActive: boolean;
  } = {
    isActive: false,
  };

  /**
   * Initiate a call to another user.
   * Channel name is deterministic: chat_${chatId} so both parties always join
   * the same Agora RTC channel (same pattern as letsPlanADate).
   */
  async initiateCall(
    receiverId: string,
    receiverName: string,
    callType: 'video' | 'audio' = 'video',
    receiverAvatar?: string,
    callerName?: string,
    callerAvatar?: string,
    callerId?: string | number,
    chatId?: string | number,
  ) {
    try {
      const channel = chatId ? `chat_${chatId}` : `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      let sessionId: string | undefined;
      let agoraToken: string | undefined;

      try {
        const callSession = await createCallSession(receiverId, callType);
        if (callSession?.status && callSession?.data) {
          sessionId = String(callSession.data.session_id ?? '');
          agoraToken = callSession.data.agora_token;
        }
      } catch (sessionErr) {
        console.warn('[CallManager] Session creation failed (call will still proceed):', sessionErr);
      }

      this.currentCall = {
        sessionId,
        channel,
        isActive: true,
      };

      try {
        await agoraRtmService.sendInvitation(receiverId, {
          channel,
          callType,
          callerName: callerName || 'Unknown',
          callerAvatar,
          sessionId: sessionId ?? '',
          callerId: callerId?.toString(),
        });
      } catch (rtmErr) {
        console.warn('[CallManager] RTM invitation failed (call will still proceed):', rtmErr);
      }

      return {
        success: true,
        data: {
          channel,
          agoraToken,
          rtcUid: 0,
          sessionId,
          receiverName,
          receiverAvatar,
          callType,
        },
      };
    } catch (error) {
      console.error('Error initiating call:', error);
      return {
        success: false,
        error: (error as Error)?.message || 'Failed to initiate call',
      };
    }
  }

  /**
   * Join an incoming call.
   * The channel name is received from the RTM invitation (already deterministic).
   */
  async joinCall(
    channel: string,
    callerName: string,
    callType: 'video' | 'audio' = 'video',
    callerAvatar?: string,
    sessionId?: string,
    _currentUserId?: string | number,
  ) {
    try {
      let agoraToken: string | undefined;
      try {
        const tokenResponse = await getAgoraTokenForAudience(channel);
        const resData = (tokenResponse as any)?.data;
        agoraToken = resData?.data?.agora_token ?? resData?.agora_token;
      } catch (e) {
        console.warn('[CallManager] Token fetch failed - joining without token (unsecured):', e);
      }

      this.currentCall = {
        sessionId,
        channel,
        isActive: true,
      };

      return {
        success: true,
        data: {
          channel,
          agoraToken,
          rtcUid: 0,
          sessionId,
          callerName,
          callerAvatar,
          callType,
        },
      };
    } catch (error) {
      console.error('Error joining call:', error);
      return {
        success: false,
        error: (error as Error)?.message || 'Failed to join call',
      };
    }
  }

  /**
   * End the current call
   */
  async endCall() {
    try {
      // Cancel RTM invitation if receiver hasn't answered yet
      await agoraRtmService.cancelInvitation();

      if (this.currentCall.isActive && this.currentCall.sessionId) {
        await endCallSession(String(this.currentCall.sessionId));
      }

      await agoraCallService.leaveChannel();
      this.currentCall = {isActive: false};

      return {success: true};
    } catch (error) {
      console.error('Error ending call:', error);
      return {
        success: false,
        error: (error as Error)?.message || 'Failed to end call',
      };
    }
  }

  /**
   * Get users in the current call channel
   */
  async getCallUsers(channel: string) {
    try {
      const response = await getChannelUsers(channel);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error getting call users:', error);
      return {
        success: false,
        error: (error as Error)?.message || 'Failed to get call users',
      };
    }
  }

  /**
   * Check if currently in a call
   */
  isInCall(): boolean {
    return this.currentCall.isActive;
  }

  /**
   * Get current call info
   */
  getCurrentCall() {
    return this.currentCall;
  }

  /**
   * Handle incoming call notification
   */
  handleIncomingCall(
    callerName: string,
    callType: 'video' | 'audio',
    channel: string,
    uid: number,
    callerAvatar?: string,
  ) {
    callNotificationService.showIncomingCallNotification(
      callerName,
      callType,
      channel,
      uid,
    );
  }

  /**
   * Handle missed call
   */
  handleMissedCall(callerName: string) {
    callNotificationService.showMissedCallNotification(callerName);
  }

  /**
   * Handle call ended
   */
  handleCallEnded(duration: string) {
    callNotificationService.showCallEndedNotification(duration);
  }

  /**
   * Cancel incoming call notification
   */
  cancelIncomingCallNotification() {
    callNotificationService.cancelIncomingCallNotification();
  }
}

// Export singleton instance
export const callManagerService = new CallManagerService();
export default callManagerService;
