import axiosInstance from '.';
import endpoints from './endpoints';

/**
 * API functions for calling - uses backend live stream APIs.
 * Zego Cloud handles call signaling and media.
 */

export interface LiveStreamResponse {
  status: number;
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
 * Start a live stream - creates a new live stream session
 */
export const startLiveStream = async (): Promise<LiveStreamResponse> => {
  return axiosInstance.post(endpoints.liveStream.createLiveStreams);
};

/**
 * End the current live stream
 */
export const endLiveStream = async () => {
  return axiosInstance.get(endpoints.liveStream.endLiveStreams);
};

/**
 * Get users currently in a channel
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

    if (
      liveStreamResponse?.data?.live_stream?.status &&
      liveStreamResponse?.status === 200
    ) {
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
