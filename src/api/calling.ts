import axiosInstance from '.';
import endpoints from './endpoints';

/**
 * API functions for Agora calling functionality
 */

export interface AgoraTokenResponse {
  token: string;
  channel: string;
  uid: number;
  expires_in: number;
}

/**
 * Get Agora token for video calling
 * @param channel - Channel name for the call
 * @param uid - User ID for the call
 * @param role - Role type (1 for caller, 2 for receiver)
 */
export const getAgoraToken = async (
  channel: string,
  uid: number,
  role: number = 1,
): Promise<AgoraTokenResponse> => {
  return axiosInstance.get(
    `${endpoints.chat.getSignature}?session_name=${channel}&chat_id=${uid}&role=${role}`,
  );
};

/**
 * Create a new call session
 * @param receiverId - ID of the user to call
 * @param callType - Type of call ('video' or 'audio')
 */
export const createCallSession = async (
  receiverId: string,
  callType: 'video' | 'audio' = 'video',
) => {
  return axiosInstance.post('/create-call-session', {
    receiver_id: receiverId,
    call_type: callType,
  });
};

/**
 * End a call session
 * @param sessionId - ID of the call session to end
 */
export const endCallSession = async (sessionId: string) => {
  return axiosInstance.post('/end-call-session', {
    session_id: sessionId,
  });
};

/**
 * Get call history for a user
 */
export const getCallHistory = async () => {
  return axiosInstance.get('/call-history');
};

/**
 * Update call status
 * @param sessionId - ID of the call session
 * @param status - New status ('ringing', 'answered', 'ended', 'missed')
 */
export const updateCallStatus = async (
  sessionId: string,
  status: 'ringing' | 'answered' | 'ended' | 'missed',
) => {
  return axiosInstance.post('/update-call-status', {
    session_id: sessionId,
    status,
  });
};
