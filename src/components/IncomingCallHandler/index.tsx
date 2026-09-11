import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, Vibration} from 'react-native';
import {useSelector} from 'react-redux';
import {
  selectUserProfile,
  selectBearerToken,
} from '../../store/slices/authSlice';
import {getConversations} from '../../api/home';
import {connectSocket, listenMessage} from '../../utils/socket';
import {
  parseAlseCallMessage,
} from '../../utils/callPayload';
import CallIncomingModal from '../CallIncomingModal';
import chatSocket from '../../services/chatSocket';
import agoraRtmCallService from '../../services/agoraRtmCallService';
import callNotificationService from '../../services/callNotificationService';
import ringtoneService from '../../services/ringtoneService';
import {
  acceptIncomingCall,
  navigateToIncomingCall,
  rejectIncomingCall,
  setIncomingCallUiDismisser,
} from '../../services/incomingCallActions';
import {
  displayNativeIncomingCall,
  endNativeIncomingCall,
  setInAppCallUiActive,
} from '../../services/nativeCallKeepService';
import {generateCallUuid} from '../../utils/callUuid';

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
  return generateCallUuid();
}

const IncomingCallHandler: React.FC = () => {
  const user = useSelector(selectUserProfile);
  const token = useSelector(selectBearerToken);
  const [incoming, setIncoming] = useState<IncomingState>(null);
  // Socket callbacks are registered once per chat and outlive any given render,
  // so they read the live value here instead of a captured `incoming`.
  const incomingRef = useRef<IncomingState>(null);
  incomingRef.current = incoming;
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
      if (AppState.currentState !== 'active') {
        setInAppCallUiActive(false);
        displayNativeIncomingCall({
          uuid: payload.callId,
          call_id: payload.callId,
          chat_id: payload.chatId,
          caller_id: payload.callerId,
          name: payload.callerName,
          call_type: payload.callType,
          notification_type: 'incoming_call',
        }).catch(err =>
          console.warn('[IncomingCall] system UI failed', err),
        );
        return;
      }
      setIncoming(payload);
      Vibration.vibrate([0, 600, 400, 600], true);
      ringtoneService.start();
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
    ringtoneService.stop();
    try {
      callNotificationService.cancelIncomingCallNotification();
    } catch {
      /* ignore */
    }
    setIncoming(null);
  }, []);

  useEffect(() => {
    setIncomingCallUiDismisser(clearIncoming);
    return () => setIncomingCallUiDismisser(null);
  }, [clearIncoming]);

  /**
   * Tell the native layer whether this modal can ring. AppState alone is not
   * enough: it can report `active` inside the Android headless task, which
   * would suppress the system call UI when nothing is actually on screen.
   */
  useEffect(() => {
    const sync = (state: string) => setInAppCallUiActive(state === 'active');
    sync(AppState.currentState);
    const sub = AppState.addEventListener('change', sync);
    return () => {
      setInAppCallUiActive(false);
      sub.remove();
    };
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
      let callIdFromInvite = '';
      try {
        if (remoteInvitation.content) {
          const parsed = JSON.parse(remoteInvitation.content);
          if (parsed.chatId != null) {
            chatId = String(parsed.chatId);
          }
          if (parsed.callId != null) {
            callIdFromInvite = String(parsed.callId);
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
      const callId = callIdFromInvite || generateCallId();
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
    if (incomingRef.current?.callId) {
      endNativeIncomingCall(incomingRef.current.callId);
    }
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
        undefined,
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
          parsed?.type === 'call_ended' ||
          parsed?.type === 'call_declined' ||
          parsed?.type === 'call_rejected' ||
          parsed?.type === 'call_cancel'
        ) {
          const senderId = String(
            res?.user_id || res?.userId || res?.user?._id || parsed?.declinedBy || '',
          );
          if (senderId && senderId === userId) {
            return;
          }
          if (incomingRef.current?.callId) {
            endNativeIncomingCall(incomingRef.current.callId);
          }
          clearIncoming();
          return;
        }
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
      if (legacy?.type === 'call_ended' || legacy?.type === 'call_rejected') {
        clearIncoming();
        return;
      }
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
    [showIncoming, userId, clearIncoming],
  );

  /**
   * Stop ringing for a chat. While ringing, any end/decline/cancel for this
   * chat from the peer must dismiss us — callId equality is deliberately not
   * required, because the RTM and socket paths use different ids.
   */
  const dismissRinging = useCallback(
    (cid: string) => {
      const ringing = incomingRef.current;
      if (!ringing || String(ringing.chatId) !== cid) {
        return;
      }
      endNativeIncomingCall(ringing.callId);
      clearIncoming();
    },
    [clearIncoming],
  );

  const wireListeners = useCallback(async () => {
    if (!token || !userId) {
      unsubsRef.current.forEach(u => u());
      unsubsRef.current = [];
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

      // Build the new subscriptions before dropping the old ones. Tearing down
      // first would leave this device deaf for the whole getConversations round
      // trip, and a cancel arriving in that window would never stop the ring.
      const next: Array<() => void> = [];
      unique.forEach(cid => {
        next.push(
          listenMessage(cid, payload => handleSocketPayload(payload, cid)),
        );
        next.push(
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
              data.callerUserId ?? data.caller_id ?? row?.user_id ?? '',
            );
            if (!callerId || callerId === userId) {
              return;
            }
            const callerName = String(
              data.callerName || row?.name || row?.full_name || 'Someone',
            );
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
        next.push(
          chatSocket.onCallEndedByChat(cid, () => {
            dismissRinging(cid);
          }),
        );
        next.push(
          chatSocket.onCallCancelByChat(cid, () => {
            dismissRinging(cid);
          }),
        );
        // A decline can also arrive for a chat that is still ringing here (for
        // example the peer answered on another device), so it must dismiss too.
        next.push(
          chatSocket.onCallDeclineByChat(cid, () => {
            dismissRinging(cid);
          }),
        );
      });

      const previous = unsubsRef.current;
      unsubsRef.current = next;
      previous.forEach(u => u());
    } catch (e) {
      console.warn('[IncomingCallHandler] getConversations', e);
    }
  }, [token, userId, handleSocketPayload, showIncoming, dismissRinging]);

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
    if (!incoming) {
      clearIncoming();
      return;
    }
    lastDismissRef.current = {
      key: `${incoming.chatId}-${incoming.callerId}-${incoming.callId}`,
      at: Date.now(),
    };
    await rejectIncomingCall(incoming);
    clearIncoming();
  }, [clearIncoming, incoming]);

  const onAccept = useCallback(async () => {
    if (!incoming) {
      return;
    }
    lastDismissRef.current = {
      key: `${incoming.chatId}-${incoming.callerId}-${incoming.callId}`,
      at: Date.now(),
    };
    await acceptIncomingCall(incoming);
    setIncoming(null);
    navigateToIncomingCall(incoming);
  }, [incoming]);

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
