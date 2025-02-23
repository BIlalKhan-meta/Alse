import axiosInstance from ".";
import endpoints from "./endpoints";

export const GetLiveStreams = () => {
  return axiosInstance.get(`${ endpoints.liveStream.getLiveStreams }`);
};

export const StartLiveStream = async () => {
  return axiosInstance.post(`${ endpoints.liveStream.createLiveStreams }`);
}

export const EndLiveStream = async () => {
    return axiosInstance.get(`${endpoints.liveStream.endLiveStreams}`);
}

export const GetLiveStreamToken = async (channel: string) => {
const path = `${endpoints.liveStream.getToken}/${channel}`;

console.log("PATH", path);

    return axiosInstance.get(path);
} 