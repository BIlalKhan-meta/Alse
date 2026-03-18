import firestore from '@react-native-firebase/firestore';

const ACTIVE_STREAMS_COLLECTION = 'activeZegoStreams';
const STREAM_STALE_AFTER_MS = 5 * 60 * 1000;

export interface ActiveStreamInfo {
  stream_key: string;
  live_id: string;
  channel_name: string;
  user_id: number;
  user_name: string;
  started_at: number;
}

/**
 * Save active stream to Firestore when host starts.
 * Stores live_id (Zego room ID) so viewer uses exact same identifier.
 */
export const saveActiveStream = async (
  streamKey: string,
  liveId: string,
  channelName: string,
  userId: number,
  userName: string,
): Promise<void> => {
  if (!streamKey || !liveId) return;
  try {
    const docId = liveId || streamKey.replace(/[^a-zA-Z0-9_]/g, '_') || `stream_${Date.now()}`;
    await firestore()
      .collection(ACTIVE_STREAMS_COLLECTION)
      .doc(docId)
      .set({
        stream_key: streamKey,
        live_id: liveId,
        channel_name: channelName,
        user_id: userId,
        user_name: userName,
        started_at: Date.now(),
        active: true,
      });
  } catch (err) {
    console.error('[activeStreamService] saveActiveStream error:', err);
    throw err;
  }
};

/**
 * Remove active stream from Firestore when host ends.
 * Uses liveId (doc ID) for reliable deletion.
 */
export const removeActiveStream = async (
  streamKeyOrLiveId: string,
): Promise<void> => {
  if (!streamKeyOrLiveId) return;
  try {
    const docId =
      streamKeyOrLiveId.replace(/[^a-zA-Z0-9_]/g, '_') ||
      `stream_${Date.now()}`;
    await firestore()
      .collection(ACTIVE_STREAMS_COLLECTION)
      .doc(docId)
      .delete();
  } catch (err) {
    console.error('[activeStreamService] removeActiveStream error:', err);
  }
};

const normalizeStreamKey = (v: string) =>
  String(v || '').replace(/^live\./, '').trim();

/**
 * Get live_id for a stream_key from Firestore.
 * Use this when viewer joins to ensure exact same room ID as host.
 */
export const getLiveIdByStreamKey = async (
  streamKey: string,
): Promise<string | null> => {
  if (!streamKey) return null;
  try {
    const streams = await getActiveStreamsFromFirestore();
    const normalized = normalizeStreamKey(streamKey);
    const match = streams.find(
      s =>
        s.stream_key === streamKey ||
        s.live_id === streamKey ||
        normalizeStreamKey(s.stream_key) === normalized ||
        normalizeStreamKey(s.channel_name) === normalized,
    );
    return match?.live_id ?? null;
  } catch {
    return null;
  }
};

/**
 * Get all active streams from Firestore.
 * Used when viewer taps "Join Running Stream" - works across devices.
 */
export const getActiveStreamsFromFirestore = async (): Promise<
  ActiveStreamInfo[]
> => {
  try {
    const snapshot = await firestore()
      .collection(ACTIVE_STREAMS_COLLECTION)
      .where('active', '==', true)
      .get();

    const now = Date.now();
    const streams: ActiveStreamInfo[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const liveId = data?.live_id ?? data?.stream_key;
      const startedAt = Number(data?.started_at) || 0;
      if (data?.stream_key && liveId && now - startedAt <= STREAM_STALE_AFTER_MS) {
        streams.push({
          stream_key: data.stream_key,
          live_id: liveId,
          channel_name: data.channel_name ?? data.stream_key,
          user_id: data.user_id ?? 0,
          user_name: data.user_name ?? `User ${data.user_id ?? ''}`,
          started_at: startedAt,
        });
      }
    });
    return streams.sort((a, b) => b.started_at - a.started_at);
  } catch (err) {
    console.error('[activeStreamService] getActiveStreams error:', err);
    return [];
  }
};
