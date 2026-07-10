import {CommentTag, resolveCommentTag} from './commentTags';

export interface CommentUser {
  id?: number;
  avatar?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  is_private?: number;
}

export interface Comment {
  id: number;
  user: CommentUser;
  comment: string;
  is_liked: boolean;
  total_likes: number;
  tag?: CommentTag | string | null;
  comment_tag?: CommentTag | string | null;
  comment_type?: CommentTag | string | null;
  type?: CommentTag | string | null;
  parent_id?: number | null;
  depth?: 0 | 1 | 2;
  total_replies?: number;
  replies?: Comment[];
}

export function getCommentDepth(comment: Comment): number {
  if (comment.depth != null) {
    return comment.depth;
  }
  return comment.parent_id ? 1 : 0;
}

export function canReplyTo(comment: Comment): boolean {
  return getCommentDepth(comment) < 2;
}

export function normalizeComment(
  comment: Partial<Comment>,
  depth: 0 | 1 | 2 = 0,
): Comment {
  const normalizedDepth = (comment.depth ?? depth) as 0 | 1 | 2;
  const replies = (comment.replies ?? []).map(reply =>
    normalizeComment(reply, Math.min(normalizedDepth + 1, 2) as 1 | 2),
  );

  return {
    id: comment.id as number,
    user: comment.user ?? {},
    comment: comment.comment ?? '',
    is_liked: comment.is_liked ?? false,
    total_likes: comment.total_likes ?? 0,
    tag: resolveCommentTag(comment) ?? comment.tag ?? null,
    comment_tag: comment.comment_tag,
    comment_type: comment.comment_type,
    type: comment.type,
    parent_id: comment.parent_id ?? null,
    depth: normalizedDepth,
    total_replies: comment.total_replies ?? replies.length,
    replies,
  };
}

export function normalizeCommentTree(comments: Partial<Comment>[]): Comment[] {
  return comments.map(comment => normalizeComment(comment, 0));
}

export function updateCommentInTree(
  comments: Comment[],
  commentId: number,
  updater: (comment: Comment) => Comment,
): Comment[] {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return updater(comment);
    }
    if (comment.replies?.length) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, commentId, updater),
      };
    }
    return comment;
  });
}

export function appendReplyToComment(
  comments: Comment[],
  parentId: number,
  reply: Comment,
): Comment[] {
  return updateCommentInTree(comments, parentId, parent => ({
    ...parent,
    total_replies: (parent.total_replies ?? 0) + 1,
    replies: [...(parent.replies ?? []), reply],
  }));
}

export function replaceCommentInTree(
  comments: Comment[],
  tempId: number,
  nextComment: Comment,
): Comment[] {
  return comments.map(comment => {
    if (comment.id === tempId) {
      return {...nextComment, replies: comment.replies ?? nextComment.replies};
    }
    if (comment.replies?.length) {
      return {
        ...comment,
        replies: replaceCommentInTree(comment.replies, tempId, nextComment),
      };
    }
    return comment;
  });
}
