import {
  createCallSession,
  endCallSession,
  getChannelUsers,
} from '../api/calling';
import callNotificationService from './callNotificationService';

/**
 * Service for managing call flow - now uses Zego Cloud for all calling.
 * Call invitations and in-call UI are handled by ZegoCallInvitationDialog
 * and ZegoUIKitPrebuiltCallService (see ChatOngoing, IncomingCallHandler).
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
   * Create a call session (backend) - used for tracking. Zego handles actual call signaling.
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

      try {
        const callSession = await createCallSession(receiverId, callType);
        if (callSession?.status && callSession?.data) {
          sessionId = String(callSession.data.session_id ?? '');
        }
      } catch (sessionErr) {
        console.warn('[CallManager] Session creation failed:', sessionErr);
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
   * Join call - Zego handles this via ZegoCallInvitationDialog.
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
      this.currentCall = {
        sessionId,
        channel,
        isActive: true,
      };

      return {
        success: true,
        data: {
          channel,
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

  async endCall() {
    try {
      if (this.currentCall.isActive && this.currentCall.sessionId) {
        await endCallSession(String(this.currentCall.sessionId));
      }
      this.currentCall = {isActive: false};
      return {success: true};
    } catch (error) {
      console.error('Error ending call:', error);
      this.currentCall = {isActive: false};
      return {
        success: false,
        error: (error as Error)?.message || 'Failed to end call',
      };
    }
  }

  async getCallUsers(channel: string) {
    try {
      const response = await getChannelUsers(channel);
      return {success: true, data: response.data};
    } catch (error) {
      console.error('Error getting call users:', error);
      return {
        success: false,
        error: (error as Error)?.message || 'Failed to get call users',
      };
    }
  }

  isInCall(): boolean {
    return this.currentCall.isActive;
  }

  getCurrentCall() {
    return this.currentCall;
  }

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

  handleMissedCall(callerName: string) {
    callNotificationService.showMissedCallNotification(callerName);
  }

  handleCallEnded(duration: string) {
    callNotificationService.showCallEndedNotification(duration);
  }

  cancelIncomingCallNotification() {
    callNotificationService.cancelIncomingCallNotification();
  }
}

export const callManagerService = new CallManagerService();
export default callManagerService;
