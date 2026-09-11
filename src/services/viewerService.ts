import firestore from '@react-native-firebase/firestore';

const STATS_COLLECTION = 'liveStreamStats';
const VIEWER_STALE_AFTER_MS = 90_000;
const STALE_CHECK_INTERVAL_MS = 30_000;

export type ViewerIdentity = {
  userId: string | number;
  username: string;
  avatarUrl?: string | null;
};

export type ViewerActivityType = 'joined' | 'left';

export type ViewerActivityEvent = ViewerIdentity & {
  id: string;
  type: ViewerActivityType;
  createdAt: Date | null;
};

type FirestoreDateValue = {
  toDate?: () => Date;
  toMillis?: () => number;
};

const statsRef = (streamId: string) =>
  firestore().collection(STATS_COLLECTION).doc(streamId);

const viewerRef = (streamId: string, userId: string | number) =>
  statsRef(streamId).collection('viewers').doc(String(userId));

const toDate = (value: FirestoreDateValue | Date | null | undefined) => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value.toMillis === 'function') {
    return new Date(value.toMillis());
  }
  return null;
};

const writeLeaveTransition = async (
  streamId: string,
  identity: ViewerIdentity,
) => {
  const userViewerRef = viewerRef(streamId, identity.userId);
  const eventRef = statsRef(streamId).collection('events').doc();

  await firestore().runTransaction(async transaction => {
    const current = await transaction.get(userViewerRef);
    if (!current.exists || current.data()?.active !== true) {
      return;
    }

    const timestamp = firestore.FieldValue.serverTimestamp();
    transaction.set(
      userViewerRef,
      {
        active: false,
        leftAt: timestamp,
        lastActive: timestamp,
      },
      {merge: true},
    );
    transaction.set(eventRef, {
      userId: identity.userId,
      username: identity.username,
      avatarUrl: identity.avatarUrl ?? null,
      type: 'left',
      createdAt: timestamp,
    });
  });
};

/**
 * Initializes host-side tracking and returns a cleanup function for the stale
 * viewer sweep. Ending the stream is handled separately by endViewerTracking.
 */
export const initializeViewerTracking = (
  streamId: string,
  hostId?: string | number,
): (() => void) => {
  if (!streamId) {
    return () => {};
  }

  statsRef(streamId)
    .set(
      {
        streamId,
        hostId: hostId ?? null,
        active: true,
        trackingStarted: firestore.FieldValue.serverTimestamp(),
        lastUpdated: firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    )
    .catch(error =>
      console.error('[ViewerPresence] Failed to initialize tracking', error),
    );

  const removeStaleViewers = async () => {
    try {
      const snapshot = await statsRef(streamId).collection('viewers').get();
      const staleBefore = Date.now() - VIEWER_STALE_AFTER_MS;

      await Promise.all(
        snapshot.docs.map(async document => {
          const data = document.data();
          const lastActive = toDate(data.lastActive)?.getTime() ?? 0;
          if (data.active !== true || lastActive >= staleBefore) {
            return;
          }
          await writeLeaveTransition(streamId, {
            userId: data.userId ?? document.id,
            username: data.username || 'Viewer',
            avatarUrl: data.avatarUrl ?? null,
          });
        }),
      );
    } catch (error) {
      console.error('[ViewerPresence] Stale viewer cleanup failed', error);
    }
  };

  const intervalId = setInterval(removeStaleViewers, STALE_CHECK_INTERVAL_MS);
  return () => clearInterval(intervalId);
};

export const joinViewer = async (
  streamId: string,
  identity: ViewerIdentity,
): Promise<void> => {
  if (!streamId || !identity.userId) {
    return;
  }

  const userViewerRef = viewerRef(streamId, identity.userId);
  const eventRef = statsRef(streamId).collection('events').doc();
  await firestore().runTransaction(async transaction => {
    const current = await transaction.get(userViewerRef);
    const timestamp = firestore.FieldValue.serverTimestamp();

    if (current.exists && current.data()?.active === true) {
      transaction.set(
        userViewerRef,
        {
          username: identity.username,
          avatarUrl: identity.avatarUrl ?? null,
          lastActive: timestamp,
        },
        {merge: true},
      );
      return;
    }

    transaction.set(
      userViewerRef,
      {
        userId: identity.userId,
        username: identity.username,
        avatarUrl: identity.avatarUrl ?? null,
        active: true,
        joinedAt: timestamp,
        lastActive: timestamp,
        leftAt: null,
      },
      {merge: true},
    );
    transaction.set(eventRef, {
      userId: identity.userId,
      username: identity.username,
      avatarUrl: identity.avatarUrl ?? null,
      type: 'joined',
      createdAt: timestamp,
    });
  });
};

export const leaveViewer = async (
  streamId: string,
  identity: ViewerIdentity,
): Promise<void> => {
  if (!streamId || !identity.userId) {
    return;
  }
  await writeLeaveTransition(streamId, identity);
};

export const updateViewerActivity = async (
  streamId: string,
  userId: string | number,
): Promise<void> => {
  if (!streamId || !userId) {
    return;
  }
  try {
    await viewerRef(streamId, userId).set(
      {
        lastActive: firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );
  } catch (error) {
    console.error('[ViewerPresence] Heartbeat failed', error);
  }
};

export const subscribeToActiveViewerCount = (
  streamId: string,
  onCount: (count: number) => void,
  onError?: (error: Error) => void,
) =>
  statsRef(streamId)
    .collection('viewers')
    .onSnapshot(
      snapshot => {
        const activeCount = snapshot.docs.reduce(
          (count, document) => count + (document.data().active === true ? 1 : 0),
          0,
        );
        onCount(activeCount);
      },
      error => onError?.(error),
    );

export const subscribeToViewerActivity = (
  streamId: string,
  onEvents: (events: ViewerActivityEvent[]) => void,
  onError?: (error: Error) => void,
) =>
  statsRef(streamId)
    .collection('events')
    .orderBy('createdAt', 'desc')
    .limit(100)
    .onSnapshot(
      snapshot => {
        onEvents(
          snapshot.docs.map(document => {
            const data = document.data();
            return {
              id: document.id,
              userId: data.userId,
              username: data.username || 'Viewer',
              avatarUrl: data.avatarUrl ?? null,
              type: data.type === 'left' ? 'left' : 'joined',
              createdAt: toDate(data.createdAt),
            };
          }),
        );
      },
      error => onError?.(error),
    );

export const endViewerTracking = async (streamId: string): Promise<void> => {
  if (!streamId) {
    return;
  }

  try {
    const viewers = await statsRef(streamId).collection('viewers').get();
    await Promise.all(
      viewers.docs.map(document => {
        const data = document.data();
        if (data.active !== true) {
          return Promise.resolve();
        }
        return writeLeaveTransition(streamId, {
          userId: data.userId ?? document.id,
          username: data.username || 'Viewer',
          avatarUrl: data.avatarUrl ?? null,
        });
      }),
    );
    await statsRef(streamId).set(
      {
        active: false,
        endedAt: firestore.FieldValue.serverTimestamp(),
        lastUpdated: firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );
  } catch (error) {
    console.error('[ViewerPresence] Failed to end tracking', error);
  }
};

export const archiveStreamStats = async (
  streamId: string,
  hostId: string | number,
): Promise<void> => {
  if (!streamId) {
    return;
  }
  const statsDocument = await statsRef(streamId).get();
  const viewers = await statsRef(streamId).collection('viewers').get();
  await firestore()
    .collection('streamArchives')
    .add({
      streamId,
      hostId,
      archivedAt: firestore.FieldValue.serverTimestamp(),
      stats: statsDocument.data() || {},
      uniqueViewerCount: viewers.size,
    });
  await endViewerTracking(streamId);
};
