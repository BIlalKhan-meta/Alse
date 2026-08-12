import {MMKV} from 'react-native-mmkv';

let storage: MMKV | null = null;

try {
  storage = new MMKV({id: 'alse-cache'});
} catch (error) {
  console.warn('[mmkv] unavailable, falling back to memory', error);
}

const memory = new Map<string, string>();

export const appCache = {
  set(key: string, value: string) {
    if (storage) {
      storage.set(key, value);
      return;
    }
    memory.set(key, value);
  },
  getString(key: string): string | undefined {
    if (storage) {
      return storage.getString(key);
    }
    return memory.get(key);
  },
  delete(key: string) {
    if (storage) {
      storage.delete(key);
      return;
    }
    memory.delete(key);
  },
  setJson(key: string, value: unknown) {
    this.set(key, JSON.stringify(value));
  },
  getJson<T>(key: string): T | null {
    const raw = this.getString(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
};

export const COMMENTS_CACHE_PREFIX = 'comments:';

export function cacheComments(postId: number, comments: unknown[]) {
  appCache.setJson(`${COMMENTS_CACHE_PREFIX}${postId}`, {
    comments,
    savedAt: Date.now(),
  });
}

export function getCachedComments(postId: number, maxAgeMs = 5 * 60 * 1000) {
  const cached = appCache.getJson<{comments: unknown[]; savedAt: number}>(
    `${COMMENTS_CACHE_PREFIX}${postId}`,
  );
  if (!cached?.comments) {
    return null;
  }
  if (Date.now() - cached.savedAt > maxAgeMs) {
    return null;
  }
  return cached.comments;
}
