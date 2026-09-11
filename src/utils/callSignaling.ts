/**
 * Outgoing "this call is over" signalling, shared by VideoCall and AudioCall.
 *
 * A ringing peer is dismissed by IncomingCallHandler, which listens on three
 * independent transports. The per-chat socket events (callCancel-/callEnded-)
 * only reach a device that is already subscribed to this chat, and that
 * subscription is rebuilt on a timer, so it can briefly be absent. The chat
 * message is the transport IncomingCallHandler always has wired, so an
 * unanswered call must send both or the callee can keep ringing.
 */
import chatSocket from '../services/chatSocket';
import {connectSocket, emitMessage} from './socket';
import {cancelCallInvite} from '../api/calls';
import {endNativeIncomingCall} from '../services/nativeCallKeepService';

type BroadcastCallEndArgs = {
  chatId?: string | number | null;
  callId?: string | null;
  currentUserId: string;
  otherUserId?: string | number | null;
  callType: 'audio' | 'video';
  /** The peer never answered, so their device may still be ringing. */
  unanswered: boolean;
  userAvatar?: string;
};

export function broadcastCallEnd({
  chatId,
  callId,
  currentUserId,
  otherUserId,
  callType,
  unanswered,
  userAvatar,
}: BroadcastCallEndArgs): void {
  if (!chatId) {
    return;
  }
  connectSocket();

  const resolvedCallId = callId || `ended_${Date.now()}`;
  const payload = {
    chat_id: String(chatId),
    callId: resolvedCallId,
    userId: currentUserId,
    callType,
  };

  if (chatSocket.isSocketConnected()) {
    if (unanswered) {
      chatSocket.sendCallCancelToChat(payload);
    }
    chatSocket.sendCallEndedToChat(payload);
    if (otherUserId) {
      chatSocket.sendCallEnded({
        callId: resolvedCallId,
        userId: currentUserId,
        otherUserId: String(otherUserId),
      });
    }
  }

  endNativeIncomingCall(resolvedCallId);

  if (!unanswered) {
    // An answered call ends on both call screens via callEnded-<chatId>;
    // emitting a chat message here would only add noise to the thread.
    return;
  }

  emitMessage({
    chat_id: String(chatId),
    message: JSON.stringify({
      type: 'call_cancel',
      callId: resolvedCallId,
      chatId: String(chatId),
      cancelledBy: currentUserId,
    }),
    message_type: 'call',
    user: {_id: currentUserId, avatar: userAvatar},
  });

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedCallId)) {
    cancelCallInvite({
      chat_id: String(chatId),
      call_id: resolvedCallId,
      call_type: callType,
    }).catch(() => {});
  }
  endNativeIncomingCall(resolvedCallId);
}
