import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Vibration} from 'react-native';
import {useSelector} from 'react-redux';
import {
  selectUserProfile,
  selectBearerToken,
} from '../../store/slices/authSlice';
import {getConversations} from '../../api/home';
import {connectSocket, emitMessage, listenMessage} from '../../utils/socket';
import {navigationRef} from '../../utils/navigationRef';
import {
  parseAlseCallMessage,
  serializeAlseCall,
} from '../../utils/callPayload';
import CallIncomingModal from '../CallIncomingModal';
import chatSocket from '../../services/chatSocket';
import agoraRtmCallService from '../../services/agoraRtmCallService';
import {AGORA_SIGNALING_TOKEN} from '../../config/agora';
import callNotificationService from '../../services/callNotificationService';

type IncomingState = null | {
  callId: string;
  chatId: string;
  callerId: string;
  callerName: string;
  callType: 'audio' | 'video';
  source: 'rtm' | 'socket';
};

const DEDUPE_MS = 3000;

function generateCallId(): string {
  return `call_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

const IncomingCallHandler: React.FC = () => {
  const user = useSelector(selectUserProfile);
  const token = useSelector(selectBearerToken);
  const [incoming, setIncoming] = useState<IncomingState>(null);
  const lastDismissRef = useRef<{key: string; at: number} | null>(null);
  const unsubsRef = useRef<Array<() => void>>([]);

  const userId = user?.id != null ? String(user.id) : null;

  const shouldIgnoreDuplicate = useCallback((key: string) => {
    const now = Date.now();
    const last = lastDismissRef.current;
    if (last && last.key === key && now - last.at < DEDUPE_MS) {
      return true;
    }
    return false;
  }, []);

  const showIncoming = useCallback(
    (payload: Omit<NonNullable<IncomingState>, never>) => {
      const key = `${payload.chatId}-${payload.callerId}-${payload.callId}`;
      if (shouldIgnoreDuplicate(key)) {
        return;
      }
      if (agoraRtmCallService.wasCallRecentlyHandled()) {
        return;
      }
      setIncoming(payload);
      Vibration.vibrate([0, 600, 400, 600], true);
      try {
        callNotificationService.initialize();
        callNotificationService.showIncomingCallNotification(
          payload.callerName || 'Incoming call',
          payload.callType,
          payload.chatId,
          Number(payload.callerId) || 0,
        );
      } catch (e) {
        console.warn('[IncomingCall] local notification failed', e);
      }
    },
    [shouldIgnoreDuplicate],
  );

  const clearIncoming = useCallback(() => {
    Vibration.cancel();
    setIncoming(null);
  }, []);

  const onRtmIncoming = useCallback(
    (remoteInvitation: {
      callerId: string;
      channelId?: string;
      content?: string;
    }) => {
      if (!userId) {
        return;
      }
      const callerId = String(remoteInvitation.callerId);
      let chatId = String(remoteInvitation.channelId || '').replace(
        /^chat_/,
        '',
      );
      let callType: 'audio' | 'video' = 'audio';
      let callerName = '';
      try {
        if (remoteInvitation.content) {
          const parsed = JSON.parse(remoteInvitation.content);
          if (parsed.chatId != null) {
            chatId = String(parsed.chatId);
          }
          if (parsed.callType === 'video') {
            callType = 'video';
          }
          if (parsed.name) {
            callerName = String(parsed.name);
          }
        }
      } catch {
        /* use channel-derived chatId */
      }
      if (!chatId) {
        return;
      }
      const callId = generateCallId();
      showIncoming({
        callId,
        chatId,
        callerId,
        callerName: callerName || 'Someone',
        callType,
        source: 'rtm',
      });
    },
    [showIncoming, userId],
  );

  const onRtmInvitationEnded = useCallback(() => {
    clearIncoming();
  }, [clearIncoming]);

  const onRtmIncomingRef = useRef(onRtmIncoming);
  onRtmIncomingRef.current = onRtmIncoming;
  const onRtmEndedRef = useRef(onRtmInvitationEnded);
  onRtmEndedRef.current = onRtmInvitationEnded;

  useEffect(() => {
    if (!userId || !token) {
      return;
    }
    let mounted = true;
    agoraRtmCallService
      .initAgoraRtm(
        userId,
        AGORA_SIGNALING_TOKEN || undefined,
        inv => {
          if (mounted) {
            onRtmIncomingRef.current(inv);
          }
        },
        () => {
          if (mounted) {
            onRtmEndedRef.current();
          }
        },
      )
      .catch(err => {
        console.warn('[IncomingCallHandler] Agora RTM init:', err);
      });
    return () => {
      mounted = false;
      // Do not release native RTM on unmount — Metro/App remount would emit
      // ConnectionStateChanged into a destroyed JS bridge (Android abort).
      // Logout still calls releaseAgoraRtm via callCleanupListener.
    };
  }, [userId, token]);

  const handleSocketPayload = useCallback(
    (res: any, chatIdFromListener: string) => {
      if (!userId) {
        return;
      }
      const text =
        typeof res?.message === 'string'
          ? res.message
          : typeof res?.text === 'string'
            ? res.text
            : '';
      try {
        const parsed = JSON.parse(text);
        if (
          parsed?.type === 'call_invite' &&
          parsed?.callId &&
          (parsed?.callType === 'audio' || parsed?.callType === 'video')
        ) {
          const senderId = String(
            res?.user_id || res?.userId || res?.user?._id || '',
          );
          if (senderId && senderId === userId) {
            return;
          }
          const chatId = String(parsed.chatId || chatIdFromListener);
          const callId = String(parsed.callId);
          const callerId =
            senderId || String(parsed.callerId || parsed.caller_id || '');
          if (!callerId) {
            return;
          }
          showIncoming({
            callId,
            chatId,
            callerId,
            callerName: String(parsed.name || parsed.caller_name || 'Someone'),
            callType: parsed.callType === 'video' ? 'video' : 'audio',
            source: 'socket',
          });
          return;
        }
      } catch {
        /* not JSON */
      }

      const legacy = parseAlseCallMessage(text);
      if (legacy?.type === 'call_invite' && legacy.call_id) {
        const senderId = String(res?.user_id || res?.user?._id || '');
        if (senderId && senderId === userId) {
          return;
        }
        const chatId = String(res?.chat_id || chatIdFromListener);
        showIncoming({
          callId: legacy.call_id,
          chatId,
          callerId: String(legacy.caller_id || senderId || ''),
          callerName: String(legacy.caller_name || 'Someone'),
          callType: legacy.call_type === 'video' ? 'video' : 'audio',
          source: 'socket',
        });
      }
    },
    [showIncoming, userId],
  );

  const wireListeners = useCallback(async () => {
    unsubsRef.current.forEach(u => u());
    unsubsRef.current = [];
    if (!token || !userId) {
      return;
    }
    try {
      connectSocket();
      const res = await getConversations({});
      const rows = res?.data?.data;
      const list = Array.isArray(rows) ? rows : [];
      const chatIds: string[] = list
        .map((r: {id?: string | number; chat_id?: string | number}) =>
          r?.id != null
            ? String(r.id)
            : r?.chat_id != null
              ? String(r.chat_id)
              : null,
        )
        .filter((id): id is string => id != null);
      const unique = [...new Set(chatIds)];

      unique.forEach(cid => {
        unsubsRef.current.push(
          listenMessage(cid, payload => handleSocketPayload(payload, cid)),
        );
        unsubsRef.current.push(
          chatSocket.onCallRequest(cid, (data: any) => {
            if (!data || String(data.chat_id || data.chatId) !== String(cid)) {
              return;
            }
            const callType =
              data.callType === 'audio' || data.callType === 'video'
                ? data.callType
                : 'video';
            const callId = String(data.callId || generateCallId());
            const row = list.find(
              (r: any) => String(r.id ?? r.chat_id) === String(cid),
            );
            const callerId = String(
              data.callerUserId ?? row?.user_id ?? '',
            );
            if (!callerId || callerId === userId) {
              return;
            }
            const callerName = String(row?.name || row?.full_name || 'Someone');
            showIncoming({
              callId,
              chatId: cid,
              callerId,
              callerName,
              callType,
              source: 'socket',
            });
          }),
        );
        unsubsRef.current.push(
          chatSocket.onCallEndedByChat(cid, (data: any) => {
            setIncoming(cur => {
              if (!cur || String(cur.chatId) !== String(cid)) {
                return cur;
              }
              const endedId = data?.callId;
              if (
                endedId &&
                cur.callId &&
                String(endedId) !== String(cur.callId)
              ) {
                return cur;
              }
              Vibration.cancel();
              return null;
            });
          }),
        );
      });
    } catch (e) {
      console.warn('[IncomingCallHandler] getConversations', e);
    }
  }, [token, userId, handleSocketPayload, showIncoming, clearIncoming]);

  useEffect(() => {
    if (!token || !userId) {
      unsubsRef.current.forEach(u => u());
      unsubsRef.current = [];
      return;
    }
    void wireListeners();
    const t = setInterval(() => {
      void wireListeners();
    }, 60000);
    return () => {
      clearInterval(t);
      unsubsRef.current.forEach(u => u());
      unsubsRef.current = [];
    };
  }, [token, userId, wireListeners]);

  const onReject = useCallback(async () => {
    if (!incoming || !user?.id) {
      clearIncoming();
      return;
    }
    agoraRtmCallService.markCallHandled();
    lastDismissRef.current = {
      key: `${incoming.chatId}-${incoming.callerId}-${incoming.callId}`,
      at: Date.now(),
    };
    connectSocket();
    try {
      await agoraRtmCallService.refuseRemoteInvitation();
    } catch {
      /* socket-only */
    }
    if (chatSocket.isSocketConnected()) {
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
    clearIncoming();
  }, [clearIncoming, incoming, user?.avatar, user?.id]);

  const onAccept = useCallback(async () => {
    if (!incoming || !user?.id) {
      return;
    }
    agoraRtmCallService.markCallHandled();
    lastDismissRef.current = {
      key: `${incoming.chatId}-${incoming.callerId}-${incoming.callId}`,
      at: Date.now(),
    };
    Vibration.cancel();
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
      /* socket-only path */
    }
    setIncoming(null);
    if (!navigationRef.isReady()) {
      return;
    }
    const navParams = {
      chatId: incoming.chatId,
      callId: incoming.callId,
      userName: String(incoming.callerName),
      name: String(incoming.callerName),
      otherUserId: incoming.callerId,
      isReceiver: true,
      isVideo: incoming.callType === 'video',
    };
    if (incoming.callType === 'audio') {
      (navigationRef as any).navigate('AudioCall', navParams);
    } else {
      (navigationRef as any).navigate('VideoCall', navParams);
    }
  }, [incoming, user?.avatar, user?.id]);

  if (!userId) {
    return null;
  }

  return (
    <CallIncomingModal
      visible={!!incoming}
      callerName={incoming?.callerName || 'Someone'}
      callType={incoming?.callType === 'audio' ? 'audio' : 'video'}
      onAccept={onAccept}
      onReject={onReject}
    />
  );
};

export default IncomingCallHandler;
