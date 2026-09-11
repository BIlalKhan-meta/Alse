import {Vibration} from 'react-native';
import store from '../store';
import {connectSocket, emitMessage} from '../utils/socket';
import {serializeAlseCall} from '../utils/callPayload';
import chatSocket from './chatSocket';
import agoraRtmCallService from './agoraRtmCallService';
import callNotificationService from './callNotificationService';
import ringtoneService from './ringtoneService';
import {navigationRef} from '../utils/navigationRef';

export type IncomingCallInfo = {
  callId: string;
  chatId: string;
  callerId: string;
  callerName: string;
  callType: 'audio' | 'video';
};

type DismissIncomingUi = () => void;

let dismissIncomingUi: DismissIncomingUi | null = null;

export function setIncomingCallUiDismisser(fn: DismissIncomingUi | null) {
  dismissIncomingUi = fn;
}

function currentUser(): {id?: string | number; avatar?: string} | null {
  return store.getState()?.auth?.user ?? null;
}

function stopLocalRing() {
  Vibration.cancel();
  ringtoneService.stop();
  try {
    callNotificationService.cancelIncomingCallNotification();
  } catch {
    /* ignore */
  }
  dismissIncomingUi?.();
}

export async function rejectIncomingCall(incoming: IncomingCallInfo): Promise<void> {
  const user = currentUser();
  agoraRtmCallService.markCallHandled();
  stopLocalRing();
  if (!user?.id) {
    return;
  }
  connectSocket();
  try {
    await agoraRtmCallService.refuseRemoteInvitation();
  } catch {
    /* socket-only */
  }
  if (chatSocket.isSocketConnected()) {
    chatSocket.sendCallDeclineToChat({
      chat_id: incoming.chatId,
      callId: incoming.callId,
      userId: String(user.id),
      callType: incoming.callType,
    });
    chatSocket.sendCallEndedToChat({
      chat_id: incoming.chatId,
      callId: incoming.callId,
      userId: String(user.id),
      callType: incoming.callType,
    });
    chatSocket.sendCallEnded({
      callId: incoming.callId,
      userId: String(user.id),
      otherUserId: incoming.callerId,
    });
  }
  emitMessage({
    chat_id: incoming.chatId,
    message: JSON.stringify({
      type: 'call_declined',
      callId: incoming.callId,
      declinedBy: String(user.id),
      chatId: incoming.chatId,
    }),
    message_type: 'call',
    user: {_id: user.id, avatar: user?.avatar} as {
      _id: string | number;
      avatar?: string;
    },
  });
}

export async function acceptIncomingCall(incoming: IncomingCallInfo): Promise<void> {
  const user = currentUser();
  agoraRtmCallService.markCallHandled();
  stopLocalRing();
  if (!user?.id) {
    return;
  }
  connectSocket();
  emitMessage({
    chat_id: incoming.chatId,
    message: serializeAlseCall({
      v: 1,
      type: 'call_accepted',
      call_id: incoming.callId,
    }),
    message_type: 'call',
    user: {_id: user.id, avatar: user?.avatar} as {
      _id: string | number;
      avatar?: string;
    },
  });
  try {
    await agoraRtmCallService.acceptRemoteInvitation();
  } catch {
    /* killed-state: no RTM invite to accept; RTC join is the answer signal */
  }
}

export function navigateToIncomingCall(incoming: IncomingCallInfo) {
  const navParams = {
    chatId: incoming.chatId,
    callId: incoming.callId,
    userName: String(incoming.callerName || 'Call'),
    name: String(incoming.callerName || 'Call'),
    otherUserId: incoming.callerId,
    isReceiver: true,
    isVideo: incoming.callType === 'video',
  };
  const tryNav = (attempt: number) => {
    if (navigationRef.isReady()) {
      if (incoming.callType === 'audio') {
        (navigationRef as any).navigate('AudioCall', navParams);
      } else {
        (navigationRef as any).navigate('VideoCall', navParams);
      }
      return;
    }
    if (attempt > 30) {
      return;
    }
    setTimeout(() => tryNav(attempt + 1), 500);
  };
  tryNav(0);
}
