import { io } from 'socket.io-client';

export const socket = io('https://custom-dev.onlinetestingserver.com:3030/', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

export const connectSocket = () => {
  if (socket && !socket?.connected) {
    socket.connect();
    socket.once('connect', () => {
      console.log('Socket Connected :: ', socket.id);
    });
  }
};

export const joinChatRoom = (chat_id: string | number | undefined) => {
  // Backend doesn't support rooms currently. Keep as no-op for compatibility.
  void chat_id;
};

export const leaveChatRoom = (chat_id: string | number | undefined) => {
  // Backend doesn't support rooms currently. Keep as no-op for compatibility.
  void chat_id;
};

/**
 * Listen for incoming messages. Server does io.emit(data.chat_id, data),
 * so event name = chat_id. Listen for that event.
 */
export const listenMessage = (
  chat_id: string | number | undefined,
  callback: (res: any) => void,
): (() => void) => {
  if (!chat_id) return () => {};
  const eventName = String(chat_id);
  const handler = (res: any) => {
    const payload = res?.data || res;
    // Since event name itself is chat_id on backend, accept payload even when chat_id is missing.
    if (!payload?.chat_id || String(payload?.chat_id) === eventName) {
      callback(payload);
    }
  };

  socket.on(eventName, handler);

  return () => {
    socket.off(eventName, handler);
  };
};

/**
 * Emit a message to the socket server for real-time delivery.
 * chat_id is normalized to string.
 */
export const emitMessage = (payload: {
  chat_id: string | number;
  message?: string;
  image?: string;
  video?: string;
  message_type?: 'text' | 'image' | 'video';
  created_at?: number;
  user?: { _id: string | number; avatar?: string };
}) => {
  const normalized = {
    ...payload,
    chat_id: String(payload.chat_id),
  };

  if (socket.connected) {
    socket.emit('sendMessage', normalized);
    return;
  }

  connectSocket();
  socket.once('connect', () => {
    socket.emit('sendMessage', normalized);
  });
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};