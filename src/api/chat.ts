import axiosInstance from '.';
import endpoints from './endpoints';

export const getChatList = () => {
  return axiosInstance.get(`${endpoints.chat.chatList}`);
};

export const getSignature = (session: string, user_id: string,role_type : number) => {
  return axiosInstance.get(
    `${endpoints.chat.getSignature}?session_name=${session}&chat_id=${user_id}&role=${role_type}`,
  );
};
