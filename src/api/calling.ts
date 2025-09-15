import axiosInstance from '.';
import endpoints from './endpoints';

/**
 * API functions for Agora calling functionality
 * Updated to work with the provided Agora backend APIs
 */

export interface AgoraTokenResponse {
  status: boolean;
  message: string;
  code: number;
  data: {
    agora_token: string;
    uid: number;
  };
}

export interface LiveStreamResponse {
  status: boolean;
  message: string;
  code: number;
  data: {
    live_stream: {
      id: number;
      user_id: number;
      stream_key: string;
      status: string;
      started_at: string;
      ended_at: string | null;
    };
    agora_token: string;
    channel_name: string;
  };
}

export interface ChannelUsersResponse {
  status: boolean;
  message: string;
  code: number;
  data: {
    channel_name: string;
    users: Array<{
      uid: number;
      user_id: number;
      name: string;
      role: string;
    }>;
    total_count: number;
  };
}

/**
 * Get Agora token for video calling using the provided API
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
 * Start a live stream and get Agora token for broadcasting
 * This creates a new live stream session for video calling
 */
export const startLiveStream = async (): Promise<LiveStreamResponse> => {
  return axiosInstance.post(endpoints.liveStream.createLiveStreams);
};

/**
 * Get Agora token for joining a live stream as audience
 * @param channelName - The channel name to join
 */
export const getAgoraTokenForAudience = async (
  channelName: string,
): Promise<AgoraTokenResponse> => {
  return axiosInstance.get(`${endpoints.liveStream.getToken}/${channelName}`);
};

/**
 * End the current live stream
 */
export const endLiveStream = async () => {
  return axiosInstance.get(endpoints.liveStream.endLiveStreams);
};

/**
 * Get users currently in a specific Agora channel
 * @param channelName - The channel name to get users for
 */
export const getChannelUsers = async (
  channelName: string,
): Promise<ChannelUsersResponse> => {
  return axiosInstance.get(`${endpoints.liveStream.getUsers}/${channelName}`);
};

/**
 * Get all live streams
 */
export const getLiveStreams = async () => {
  return axiosInstance.get(endpoints.liveStream.getLiveStreams);
};

/**
 * Create a new call session using live stream API
 * @param receiverId - ID of the user to call
 * @param callType - Type of call ('video' or 'audio')
 */
export const createCallSession = async (
  receiverId: string,
  callType: 'video' | 'audio' = 'video',
) => {
  try {
    // Start a live stream for the call
    const liveStreamResponse = await startLiveStream();

    if (liveStreamResponse.data.status) {
      return {
        status: true,
        message: 'Call session created successfully',
        data: {
          session_id: liveStreamResponse.data.live_stream.id,
          channel: liveStreamResponse.data.channel_name,
          agora_token: liveStreamResponse.data.agora_token,
          stream_key: liveStreamResponse.data.live_stream.stream_key,
        },
      };
    } else {
      throw new Error(
        liveStreamResponse.message || 'Failed to create call session',
      );
    }
  } catch (error) {
    console.error('Error creating call session:', error);
    throw error;
  }
};

/**
 * End a call session
 * @param sessionId - ID of the call session to end
 */
export const endCallSession = async (sessionId: string) => {
  try {
    const response = await endLiveStream();
    return {
      status: true,
      message: 'Call session ended successfully',
      data: response.data,
    };
  } catch (error) {
    console.error('Error ending call session:', error);
    throw error;
  }
};

/**
 * Get call history for a user (using live streams)
 */
export const getCallHistory = async () => {
  try {
    const response = await getLiveStreams();
    return {
      status: true,
      message: 'Call history retrieved successfully',
      data: response.data,
    };
  } catch (error) {
    console.error('Error getting call history:', error);
    throw error;
  }
};

/**
 * Update call status (using live stream status)
 * @param sessionId - ID of the call session
 * @param status - New status ('live', 'ended')
 */
export const updateCallStatus = async (
  sessionId: string,
  status: 'live' | 'ended',
) => {
  try {
    if (status === 'ended') {
      await endLiveStream();
    }
    return {
      status: true,
      message: 'Call status updated successfully',
      data: {session_id: sessionId, status},
    };
  } catch (error) {
    console.error('Error updating call status:', error);
    throw error;
  }
};
