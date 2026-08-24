import {useCallback, useRef, useState} from 'react';
import {getPostComment, getVideoComments} from '../api/home';
import {getMessage} from '../utils/helpers';
import {cacheComments, getCachedComments} from '../utils/appCache';
import {Comment, normalizeCommentTree} from '../utils/commentTree';

export type CommentTarget = 'post' | 'video';

type CommentsState = {
  visible: boolean;
  comments: Comment[];
  id: number | null;
};

const emptyState = (): CommentsState => ({
  visible: false,
  comments: [],
  id: null,
});

const extractCommentsPage = (payload: any): {
  comments: Comment[];
  currentPage: number;
  lastPage: number;
} => {
  const pageData = payload?.data?.data ?? payload?.data ?? {};
  const list = pageData?.data ?? (Array.isArray(pageData) ? pageData : []);
  const meta = pageData?.meta ?? payload?.data?.meta ?? {};
  return {
    comments: normalizeCommentTree(Array.isArray(list) ? list : []),
    currentPage: Number(meta?.current_page ?? pageData?.current_page ?? 1),
    lastPage: Number(meta?.last_page ?? pageData?.last_page ?? 1),
  };
};

export const usePostComments = (target: CommentTarget = 'post') => {
  const [commentsVisible, setCommentsVisible] = useState<CommentsState>(
    emptyState,
  );
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const inFlightRef = useRef(false);
  const entityIdRef = useRef<number | null>(null);

  const closeComments = useCallback(() => {
    setCommentsVisible(emptyState());
    setIsLoadingComments(false);
    setIsLoadingMore(false);
    setCommentsError(null);
    setPage(1);
    setHasMore(false);
    inFlightRef.current = false;
    entityIdRef.current = null;
  }, []);

  const loadComments = useCallback(
    async (entityId: number, nextPage: number = 1, append: boolean = false) => {
      if (inFlightRef.current && nextPage === 1 && !append) {
        return;
      }
      inFlightRef.current = true;
      entityIdRef.current = entityId;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingComments(true);
        setCommentsError(null);
        const cached = getCachedComments(entityId, undefined, target);
        setCommentsVisible({
          visible: true,
          comments: cached
            ? normalizeCommentTree(cached as any[])
            : [],
          id: entityId,
        });
        if (cached?.length) {
          setIsLoadingComments(false);
        }
      }

      try {
        const res =
          target === 'video'
            ? await getVideoComments(entityId, nextPage)
            : await getPostComment(entityId, nextPage);
        if (entityIdRef.current !== entityId) {
          return;
        }
        const {comments, currentPage, lastPage} = extractCommentsPage(res);
        setPage(currentPage);
        setHasMore(currentPage < lastPage);
        setCommentsVisible(prev => ({
          visible: true,
          id: entityId,
          comments: append
            ? [...prev.comments, ...comments]
            : comments,
        }));
        if (!append) {
          cacheComments(entityId, comments, target);
        }
        setCommentsError(null);
      } catch (err: any) {
        if (entityIdRef.current !== entityId) {
          return;
        }
        const message = getMessage(err) || 'Failed to load comments';
        setCommentsError(message);
        if (!append) {
          setCommentsVisible({
            visible: true,
            comments: [],
            id: entityId,
          });
        }
      } finally {
        inFlightRef.current = false;
        setIsLoadingComments(false);
        setIsLoadingMore(false);
      }
    },
    [target],
  );

  const openComments = useCallback(
    (entityId: number) => {
      void loadComments(entityId, 1, false);
    },
    [loadComments],
  );

  const retryComments = useCallback(() => {
    if (commentsVisible.id != null) {
      void loadComments(commentsVisible.id, 1, false);
    }
  }, [commentsVisible.id, loadComments]);

  const loadMoreComments = useCallback(() => {
    if (
      !hasMore ||
      isLoadingComments ||
      isLoadingMore ||
      commentsVisible.id == null ||
      inFlightRef.current
    ) {
      return;
    }
    void loadComments(commentsVisible.id, page + 1, true);
  }, [
    commentsVisible.id,
    hasMore,
    isLoadingComments,
    isLoadingMore,
    loadComments,
    page,
  ]);

  return {
    commentsVisible,
    isLoadingComments,
    isLoadingMore,
    commentsError,
    hasMoreComments: hasMore,
    openComments,
    closeComments,
    retryComments,
    loadMoreComments,
  };
};

export default usePostComments;
