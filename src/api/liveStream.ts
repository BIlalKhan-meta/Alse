import axiosInstance from ".";
import endpoints from "./endpoints";

export const GetLiveStreams = () => {
  return axiosInstance.get(`${ endpoints.liveStream.getLiveStreams }`);
};

export const StartLiveStream = async () => {
  // Empty JSON body so OkHttp on Android actually sends the POST.
  return axiosInstance.post(`${endpoints.liveStream.createLiveStreams}`, {});
};

export const EndLiveStream = async () => {
  // POST so iOS does not cache this mutation (GET /live-stream/end was ignored).
  return axiosInstance.post(`${endpoints.liveStream.endLiveStreams}`, {});
};

export const GetLiveStreamToken = async (channel: string) => {
  return axiosInstance.get(
    `${endpoints.liveStream.getToken}/${encodeURIComponent(channel)}`,
  );
};

/** Publisher RTC token for 1:1 audio/video calls (uid = auth user). */
export const GetCallRtcToken = async (channel: string) => {
  return axiosInstance.get(
    `${endpoints.liveStream.getRtcToken}/${encodeURIComponent(channel)}`,
  );
};

export const GetAgoraRtmToken = async () => {
  return axiosInstance.get(endpoints.liveStream.getRtmToken);
};

export const GetLiveStreamUsers = async (channel: string) => {
  return axiosInstance.get(
    `${endpoints.liveStream.getUsers}/${encodeURIComponent(channel)}`,
  );
};