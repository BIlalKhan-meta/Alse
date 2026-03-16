import RtmEngine from 'agora-react-native-rtm';
import {AGORA_APP_ID} from '../config/agora';

export interface CallInvitationPayload {
  channel: string;
  callType: 'video' | 'audio';
  callerName: string;
  callerAvatar?: string;
  sessionId?: string;
  callerId: string;
}

export type IncomingCallCallback = (payload: CallInvitationPayload) => void;

/**
 * Agora RTM Service for call signaling using call invitation API.
 * Uses createLocalInvitation/sendLocalInvitation for outgoing calls
 * and onRemoteInvitationReceived for incoming calls.
 */
class AgoraRtmService {
  private engine: RtmEngine | null = null;
  private currentUserId: string | null = null;
  private incomingCallCallback: IncomingCallCallback | null = null;
  private isLoggedIn = false;
  private remoteInvitationSubscription: {remove: () => void} | null = null;
  private currentLocalInvitation: any = null;
  private pendingRemoteInvitation: any = null;

  /**
   * Initialize and login to RTM with user ID.
   * Tries with token first; if rejected, retries without token (unsecured project).
   */
  async login(userId: string | number, rtmToken?: string): Promise<boolean> {
    const uid = String(userId);
    if (this.isLoggedIn && this.currentUserId === uid) {
      console.log('[Agora RTM] Already logged in for user:', uid);
      return true;
    }

    await this.cleanup();

    const tryLogin = async (token: string | undefined): Promise<void> => {
      const engine = new RtmEngine();
      await engine.createInstance(AGORA_APP_ID);
      this.engine = engine;
      try {
        await engine.loginV2(uid, token);
      } catch (e) {
        this.engine = null;
        try {
          await engine.release();
        } catch (_) {}
        throw e;
      }
    };

    const setupListeners = () => {
      this.remoteInvitationSubscription = this.engine!.addListener(
        'RemoteInvitationReceived',
        (remoteInvitation: any) => {
          try {
            this.pendingRemoteInvitation = remoteInvitation;
            const content = remoteInvitation.content;
            if (content) {
              const payload = JSON.parse(content) as CallInvitationPayload;
              if (payload.channel && payload.callType && payload.callerName) {
                console.log('[Agora RTM] Incoming call received from:', payload.callerName);
                this.incomingCallCallback?.(payload);
              }
            }
          } catch (e) {
            console.warn('[Agora RTM] Failed to parse call invitation:', e);
          }
        },
      );
    };

    // Try with token first; if rejected (e.g. wrong token type), retry without token (unsecured)
    const attemptLogin = async (token: string | undefined) => {
      await tryLogin(token);
      this.currentUserId = uid;
      this.isLoggedIn = true;
      setupListeners();
    };

    try {
      console.log('[Agora RTM] Initializing appId:', AGORA_APP_ID, 'user:', uid, 'token:', rtmToken ? 'yes' : 'no');
      await attemptLogin(rtmToken);
      console.log('[Agora RTM] Logged in successfully for user:', uid);
      return true;
    } catch (error) {
      const errMsg = (error as Error)?.message || String(error);
      const isRejected = errMsg.includes('REJECTED') || errMsg.includes('LOGIN_ERR');
      console.warn('[Agora RTM] Login failed:', errMsg);

      if (isRejected && rtmToken) {
        console.log('[Agora RTM] Retrying without token (unsecured project)...');
        try {
          await attemptLogin(undefined);
          console.log('[Agora RTM] Logged in without token for user:', uid);
          return true;
        } catch (retryErr) {
          console.warn('[Agora RTM] Retry without token failed:', retryErr);
        }
      }
      await this.cleanup();
      return false;
    }
  }

  /**
   * Cleanup - release engine without calling logout (avoids LOGOUT_ERR_USER_NOT_LOGGED_IN when login failed)
   */
  private async cleanup(): Promise<void> {
    const wasLoggedIn = this.isLoggedIn;
    this.remoteInvitationSubscription?.remove();
    this.remoteInvitationSubscription = null;
    this.currentLocalInvitation = null;
    this.pendingRemoteInvitation = null;
    this.currentUserId = null;
    this.incomingCallCallback = null;
    this.isLoggedIn = false;

    if (this.engine) {
      if (wasLoggedIn) {
        try {
          await this.engine.logout();
        } catch {
          // Ignore
        }
      }
      try {
        await this.engine.release();
      } catch (e) {
        console.warn('[Agora RTM] Release error:', e);
      }
      this.engine = null;
    }
  }

  /**
   * Logout and cleanup
   */
  async logout(): Promise<void> {
    try {
      if (this.engine && this.isLoggedIn) {
        await this.engine.logout();
      }
    } catch (error) {
      if (!String(error).includes('USER_NOT_LOGGED_IN')) {
        console.warn('[Agora RTM] Logout error:', error);
      }
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Set callback for incoming call invitations
   */
  setIncomingCallCallback(callback: IncomingCallCallback | null): void {
    this.incomingCallCallback = callback;
  }

  /**
   * Send call invitation to receiver
   */
  async sendInvitation(
    receiverId: string | number,
    payload: Omit<CallInvitationPayload, 'callerId'> & {callerId?: string},
  ): Promise<boolean> {
    try {
      if (!this.engine || !this.isLoggedIn) {
        console.warn('[Agora RTM] Not logged in, cannot send invitation (outgoing call will still work)');
        return false;
      }

      const receiverUid = String(receiverId);
      const messagePayload: CallInvitationPayload = {
        ...payload,
        callerId: payload.callerId ?? this.currentUserId ?? '',
      };

      const content = JSON.stringify(messagePayload);
      const localInvitation = await this.engine.createLocalInvitation(
        receiverUid,
        content,
        payload.channel,
      );

      this.currentLocalInvitation = localInvitation;
      await this.engine.sendLocalInvitationV2(localInvitation);

      console.log('[Agora RTM] Call invitation sent to:', receiverId);
      return true;
    } catch (error) {
      console.error('Failed to send call invitation:', error);
      return false;
    }
  }

  /**
   * Cancel the current outgoing invitation (when caller ends before answer)
   */
  async cancelInvitation(): Promise<boolean> {
    try {
      if (this.engine && this.currentLocalInvitation) {
        await this.engine.cancelLocalInvitationV2(this.currentLocalInvitation);
        this.currentLocalInvitation = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      return false;
    }
  }

  /**
   * Accept the pending remote invitation (call when user taps Accept)
   */
  async acceptPendingInvitation(): Promise<boolean> {
    if (this.pendingRemoteInvitation) {
      const result = await this.acceptRemoteInvitation(
        this.pendingRemoteInvitation,
      );
      this.pendingRemoteInvitation = null;
      return result;
    }
    return false;
  }

  /**
   * Refuse the pending remote invitation (call when user taps Decline)
   */
  async refusePendingInvitation(): Promise<boolean> {
    if (this.pendingRemoteInvitation) {
      const result = await this.refuseRemoteInvitation(
        this.pendingRemoteInvitation,
      );
      this.pendingRemoteInvitation = null;
      return result;
    }
    return false;
  }

  /**
   * Accept a remote invitation (receiver)
   */
  async acceptRemoteInvitation(remoteInvitation: any): Promise<boolean> {
    try {
      if (this.engine) {
        await this.engine.acceptRemoteInvitationV2(remoteInvitation);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      return false;
    }
  }

  /**
   * Refuse a remote invitation (receiver)
   */
  async refuseRemoteInvitation(remoteInvitation: any): Promise<boolean> {
    try {
      if (this.engine) {
        await this.engine.refuseRemoteInvitationV2(remoteInvitation);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refuse invitation:', error);
      return false;
    }
  }

  isLoggedInStatus(): boolean {
    return this.isLoggedIn;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export const agoraRtmService = new AgoraRtmService();
export default agoraRtmService;
