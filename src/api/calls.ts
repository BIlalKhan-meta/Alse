import axiosInstance from '.';
import endpoints from './endpoints';

export type CallInvitePayload = {
  chat_id: string | number;
  call_id: string;
  call_type: 'audio' | 'video';
};

export const inviteCall = (payload: CallInvitePayload) => {
  return axiosInstance.post(endpoints.chat.callInvite, payload);
};

export const cancelCallInvite = (payload: CallInvitePayload) => {
  return axiosInstance.post(endpoints.chat.callCancel, payload);
};
