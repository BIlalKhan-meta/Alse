import axiosInstance from '.';
import endpoints from './endpoints';

export const getChatList = () => {
  return axiosInstance.get(`${endpoints.chat.chatList}`);
};
