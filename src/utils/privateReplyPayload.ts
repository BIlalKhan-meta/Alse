export const ALSE_REPLY_PREFIX = '__ALSE_REPLY__';

export type PrivateReplyPayload = {
  v: 1;
  type: 'private_reply';
  quote_text: string;
  quote_author: string;
  quote_message_id?: string | number;
  /** Group chat the quoted message belongs to (for jump-back). */
  group_chat_id?: string | number;
  group_name?: string;
  body: string;
};

export type PrivateReplyQuote = {
  quote_text: string;
  quote_author: string;
  quote_message_id?: string | number;
  group_chat_id?: string | number;
  group_name?: string;
};

export function serializePrivateReply(payload: PrivateReplyPayload): string {
  return `${ALSE_REPLY_PREFIX}${JSON.stringify({
    v: 1,
    type: 'private_reply',
    quote_text: String(payload.quote_text || '').trim(),
    quote_author: String(payload.quote_author || '').trim() || 'User',
    quote_message_id: payload.quote_message_id,
    group_chat_id: payload.group_chat_id,
    group_name: payload.group_name
      ? String(payload.group_name).trim()
      : undefined,
    body: String(payload.body || ''),
  })}`;
}

export function parsePrivateReplyMessage(
  message: string | undefined | null,
): PrivateReplyPayload | null {
  if (!message || typeof message !== 'string') {
    return null;
  }
  if (!message.startsWith(ALSE_REPLY_PREFIX)) {
    return null;
  }

  try {
    const raw = JSON.parse(
      message.slice(ALSE_REPLY_PREFIX.length),
    ) as Partial<PrivateReplyPayload>;

    if (raw?.v === 1 && raw.type === 'private_reply') {
      return {
        v: 1,
        type: 'private_reply',
        quote_text: String(raw.quote_text || ''),
        quote_author: String(raw.quote_author || '').trim() || 'User',
        quote_message_id: raw.quote_message_id,
        group_chat_id: raw.group_chat_id,
        group_name: raw.group_name
          ? String(raw.group_name).trim()
          : undefined,
        body: String(raw.body || ''),
      };
    }
  } catch {
    /* ignore malformed reply payloads */
  }

  return null;
}

/** Body text for inbox / notifications; falls through for normal messages. */
export function getPrivateReplyDisplayText(
  message: string | undefined | null,
): string {
  const parsed = parsePrivateReplyMessage(message);
  if (parsed) {
    return parsed.body || 'Private reply';
  }
  return message || '';
}
