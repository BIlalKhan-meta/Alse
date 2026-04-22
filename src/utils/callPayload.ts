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

/** User-visible line in chat bubble */
export function getCallMessageDisplayText(message: string | undefined | null): string {
  const p = parseAlseCallMessage(message);
  if (!p) {
    return message || '';
  }
  if (p.type === 'call_invite') {
    return p.call_type === 'audio' ? 'Audio call' : 'Video call';
  }
  if (p.type === 'call_accepted') {
    return 'Call accepted';
  }
  if (p.type === 'call_rejected') {
    return 'Call declined';
  }
  if (p.type === 'call_ended') {
    return 'Call ended';
  }
  return 'Call';
}
