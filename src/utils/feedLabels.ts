export type FeedLabelType = 'new' | 'following' | 'recommended';

const NEW_VALUES = new Set([
  'new',
  'new_post',
  'new_posts',
  'new post',
  'new posts',
]);

const FOLLOWING_VALUES = new Set([
  'following',
  'followed',
  'following_post',
  'following_posts',
  'following post',
  'following posts',
]);

const RECOMMENDED_VALUES = new Set([
  'recommended',
  'suggested',
  'suggestion',
  'suggested_post',
  'suggested_posts',
  'suggested post',
  'suggested posts',
]);

const normalizeFeedValue = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

const resolveFromString = (value: unknown): FeedLabelType | null => {
  const normalized = normalizeFeedValue(value);
  if (!normalized) {
    return null;
  }

  if (NEW_VALUES.has(normalized)) {
    return 'new';
  }
  if (FOLLOWING_VALUES.has(normalized)) {
    return 'following';
  }
  if (RECOMMENDED_VALUES.has(normalized)) {
    return 'recommended';
  }

  return null;
};

const readTruthyFlag = (post: Record<string, unknown>, keys: string[]) =>
  keys.some(key => post[key] === true || post[key] === 1 || post[key] === '1');

/**
 * Maps a newsfeed post payload to a smart-feed label.
 * Supports multiple backend field names until the API contract is finalized.
 */
export const resolveFeedLabel = (post: unknown): FeedLabelType | null => {
  if (!post || typeof post !== 'object') {
    return null;
  }

  const record = post as Record<string, unknown>;
  const nestedFeed =
    record.feed && typeof record.feed === 'object'
      ? (record.feed as Record<string, unknown>)
      : null;

  const directCandidates = [
    record.feed_type,
    record.feed_label,
    record.feed_source,
    record.smart_feed_type,
    record.post_source,
    record.source_type,
    nestedFeed?.type,
    nestedFeed?.label,
    nestedFeed?.source,
  ];

  for (const candidate of directCandidates) {
    const resolved = resolveFromString(candidate);
    if (resolved) {
      return resolved;
    }
  }

  if (readTruthyFlag(record, ['is_new_post', 'is_new', 'is_newest'])) {
    return 'new';
  }
  if (
    readTruthyFlag(record, [
      'is_following',
      'user_is_following',
      'from_following',
      'is_followed',
    ])
  ) {
    return 'following';
  }
  if (
    readTruthyFlag(record, [
      'is_recommended',
      'is_suggested',
      'is_recommendation',
      'is_suggestion',
    ])
  ) {
    return 'recommended';
  }

  return null;
};
