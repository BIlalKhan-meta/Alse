export type PostSharePayload = {
  v: 1;
  type: 'post_share' | 'video_share';
  post_id?: number;
  video_id?: number;
  title?: string;
  description?: string;
  image?: string;
  author?: string;
};

const PREFIX = 'ALSE_SHARE:';

export function serializePostShare(payload: PostSharePayload): string {
  return `${PREFIX}${JSON.stringify(payload)}`;
}

export function parsePostShareMessage(
  text?: string | null,
): PostSharePayload | null {
  if (!text || typeof text !== 'string') {
    return null;
  }
  const raw = text.startsWith(PREFIX) ? text.slice(PREFIX.length) : text;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.v === 1 &&
      (parsed.type === 'post_share' || parsed.type === 'video_share')
    ) {
      return parsed as PostSharePayload;
    }
  } catch {
    // ignore
  }
  return null;
}
