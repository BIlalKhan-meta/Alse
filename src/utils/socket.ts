import chatSocket from '../services/chatSocket';
import store from '../store';

function ensureAuthConnect(): {userId: string; token: string | undefined} | null {
  const state = store.getState();
  const user = state.auth.user;
  const userId = user?.id != null ? String(user.id) : '';
  const token = state.auth.token ?? undefined;
  if (!userId) {
    return null;
  }
  chatSocket.connect(userId, token);
  return {userId, token};
}

export const connectSocket = () => {
  ensureAuthConnect();
};

export const joinChatRoom = (chat_id: string | number | undefined) => {
  if (!chat_id) {
    return;
  }
  if (chatSocket.isSocketConnected()) {
    chatSocket.joinRoom(String(chat_id));
  } else {
    ensureAuthConnect();
    chatSocket.onceConnected(() => chatSocket.joinRoom(String(chat_id)));
  }
};

export const leaveChatRoom = (chat_id: string | number | undefined) => {
  if (!chat_id) {
    return;
  }
  if (chatSocket.isSocketConnected()) {
    chatSocket.leaveRoom(String(chat_id));
  }
};

export const listenMessage = (
  chat_id: string | number | undefined,
  callback: (res: any) => void,
): (() => void) => {
  if (!chat_id) {
    return () => {};
  }
  ensureAuthConnect();
  const eventName = String(chat_id);
  const handler = (data: any) => {
    const payload = data?.data ?? data;
    const normalized = {
      ...payload,
      message: payload?.message ?? payload?.text,
      chat_id: payload?.chat_id ?? eventName,
    };
    if (
      !payload?.chat_id ||
      String(payload?.chat_id) === eventName
    ) {
      callback(normalized);
    }
  };
  return chatSocket.onMessageReceived(eventName, handler);
};

export const emitMessage = (payload: {
  chat_id: string | number;
  message?: string;
  image?: string;
  video?: string;
  message_type?: 'text' | 'image' | 'video' | 'call';
  created_at?: number;
  user?: {_id: string | number; avatar?: string};
}) => {
  const auth = ensureAuthConnect();
  if (!auth) {
    console.warn('[Socket] emitMessage: no logged-in user');
    return;
  }
  const send = () => {
    chatSocket.emitAlseChatMessage(payload);
  };
  if (chatSocket.isSocketConnected()) {
    send();
  } else {
    chatSocket.onceConnected(send);
  }
};

export const disconnectSocket = () => {
  chatSocket.disconnect();
};

export default chatSocket;
