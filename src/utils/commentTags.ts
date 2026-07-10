export type CommentTag = 'question' | 'answer' | 'experience';

export const COMMENT_TAGS: CommentTag[] = ['question', 'answer', 'experience'];

export const COMMENT_TAG_CONFIG: Record<
  CommentTag,
  {label: string; color: string}
> = {
  question: {label: 'Question', color: '#20B2AA'},
  answer: {label: 'Answer', color: '#4CD964'},
  experience: {label: 'Experience', color: '#169BD5'},
};

const TAG_ALIASES: Record<string, CommentTag> = {
  question: 'question',
  answer: 'answer',
  experience: 'experience',
};

/** Normalizes API / form values to a supported comment tag. */
export function normalizeCommentTag(value: unknown): CommentTag | null {
  if (value == null || value === '') {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  return TAG_ALIASES[normalized] ?? null;
}

/** Value sent in POST /post/{id}/comment FormData. */
export function commentTagToApiValue(tag: CommentTag): string {
  return tag;
}

/** Reads tag from comment payload once backend includes it on GET responses. */
export function resolveCommentTag(comment: {
  tag?: unknown;
  comment_tag?: unknown;
  comment_type?: unknown;
  type?: unknown;
}): CommentTag | null {
  return (
    normalizeCommentTag(comment.tag) ??
    normalizeCommentTag(comment.comment_tag) ??
    normalizeCommentTag(comment.comment_type) ??
    normalizeCommentTag(comment.type)
  );
}
