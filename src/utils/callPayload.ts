/** Embeds structured call data in chat `message` text (survives socket + DB as plain string). */
export const ALSE_CALL_PREFIX = '__ALSE_CALL__';

export type AlseCallPayloadType =
  | 'call_invite'
  | 'call_accepted'
  | 'call_rejected'
  | 'call_ended';

export interface AlseCallInvitePayload {
  v: 1;
  type: 'call_invite';
  call_id: string;
  room_id: string;
  call_type: 'video' | 'audio';
  caller_id: string;
  caller_name: string;
  /** Token for the callee to join 100ms */
  callee_token: string;
}

export interface AlseCallSimplePayload {
  v: 1;
  type: 'call_accepted' | 'call_rejected' | 'call_ended';
  call_id: string;
}

export type AlseCallPayload = AlseCallInvitePayload | AlseCallSimplePayload;

export function serializeAlseCall(payload: AlseCallPayload): string {
  return `${ALSE_CALL_PREFIX}${JSON.stringify(payload)}`;
}

export function parseAlseCallMessage(
  message: string | undefined | null,
): AlseCallPayload | null {
  if (!message || typeof message !== 'string') {
    return null;
  }
  if (!message.startsWith(ALSE_CALL_PREFIX)) {
    return null;
  }
  try {
    const raw = JSON.parse(message.slice(ALSE_CALL_PREFIX.length)) as AlseCallPayload;
    if (raw && raw.v === 1 && raw.type) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Decline/reject signaling should not appear as a chat bubble (socket may send JSON or objects).
 */
export function shouldOmitCallDeclineFromChat(
  message: string | undefined | null | object,
): boolean {
  if (message == null) {
    return false;
  }
  if (typeof message === 'object') {
    const o = message as {type?: string};
    return o.type === 'call_declined';
  }
  if (typeof message !== 'string') {
    return false;
  }
  const parsedAlse = parseAlseCallMessage(message);
  if (parsedAlse?.type === 'call_rejected') {
    return true;
  }
  const t = message.trim();
  if (t.startsWith('{')) {
    try {
      const j = JSON.parse(t) as {type?: string};
      if (j?.type === 'call_declined') {
        return true;
      }
    } catch {
      /* ignore */
    }
  }
  return false;
}

/** Normalize API/socket message body to a string for GiftedChat. */
export function normalizeChatMessageText(
  message: unknown,
  textFallback?: unknown,
): string {
  const raw = message ?? textFallback;
  if (raw == null) {
    return '';
  }
  if (typeof raw === 'string') {
    return raw;
  }
  if (typeof raw === 'object') {
    const o = raw as {type?: string; message?: string; text?: string};
    if (o.type === 'call_declined') {
      return '';
    }
    if (typeof o.message === 'string') {
      return o.message;
    }
    if (typeof o.text === 'string') {
      return o.text;
    }
    try {
      return JSON.stringify(raw);
    } catch {
      return '';
    }
  }
  return String(raw);
}

/** User-visible line in chat bubble */
export function getCallMessageDisplayText(message: string | undefined | null): string {
  const p = parseAlseCallMessage(message);
  if (!p) {
    if (
      typeof message === 'string' &&
      shouldOmitCallDeclineFromChat(message)
    ) {
      return '';
    }
    return message || '';
  }
  if (p.type === 'call_invite') {
    return p.call_type === 'audio' ? 'Audio call' : 'Video call';
  }
  if (p.type === 'call_accepted') {
    return 'Call accepted';
  }
  if (p.type === 'call_rejected') {
    return '';
  }
  if (p.type === 'call_ended') {
    return 'Call ended';
  }
  return 'Call';
}
