import { io } from 'socket.io-client';

export const socket = io('https://custom-dev.onlinetestingserver.com:3030/', {
  transports: ['websocket', 'polling'],
});

export const connectSocket = () => {
  if (socket && !socket?.connected) {
    socket.connect();
    socket.on('connect', () => {
      console.log('Socket Connected :: ', socket.id);
    });
  }
};

/**
 * Listen for incoming messages in a chat room.
 * chat_id is normalized to string for socket room consistency.
 * Returns cleanup function to remove the listener.
 */
export const listenMessage = (
  chat_id: string | number | undefined,
  callback: (res: any) => void,
): (() => void) => {
  if (!chat_id) return () => {};
  const roomId = String(chat_id);
  const handler = (res: any) => callback(res);
  socket.on(roomId, handler);
  return () => {
    socket.off(roomId, handler);
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
  socket.emit('sendMessage', normalized);
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.on('disconnect', () => {
      console.log('Socket Disconnected');
    });
  }
};