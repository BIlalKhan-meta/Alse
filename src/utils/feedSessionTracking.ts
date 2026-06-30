export const WELLNESS_THRESHOLDS_MINUTES = [15, 30, 45] as const;

export type WellnessThresholdMinutes =
  (typeof WELLNESS_THRESHOLDS_MINUTES)[number];

type WellnessThresholdConfig = {
  elapsedMs: number;
  minutes: WellnessThresholdMinutes;
};

const WELLNESS_THRESHOLDS: WellnessThresholdConfig[] = [
  {elapsedMs: 15 * 60 * 1000, minutes: 15},
  {elapsedMs: 30 * 60 * 1000, minutes: 30},
  {elapsedMs: 45 * 60 * 1000, minutes: 45},
];

export const getWellnessThresholds = (): WellnessThresholdConfig[] =>
  WELLNESS_THRESHOLDS;

type FeedSessionState = {
  cumulativeFeedMs: number;
  segmentStartAt: number | null;
  shownThresholds: Set<WellnessThresholdMinutes>;
  isFeedFocused: boolean;
  isAppActive: boolean;
};

const sessionState: FeedSessionState = {
  cumulativeFeedMs: 0,
  segmentStartAt: null,
  shownThresholds: new Set(),
  isFeedFocused: false,
  isAppActive: true,
};

const isTimerRunning = (state: FeedSessionState) =>
  state.isFeedFocused && state.isAppActive && state.segmentStartAt !== null;

const flushActiveSegment = (now = Date.now()) => {
  if (sessionState.segmentStartAt === null) {
    return;
  }

  sessionState.cumulativeFeedMs += now - sessionState.segmentStartAt;
  sessionState.segmentStartAt = null;
};

export const setFeedFocus = (focused: boolean) => {
  sessionState.isFeedFocused = focused;

  if (focused && sessionState.isAppActive) {
    if (sessionState.segmentStartAt === null) {
      sessionState.segmentStartAt = Date.now();
    }
    return;
  }

  flushActiveSegment();
};

export const setAppActive = (active: boolean) => {
  sessionState.isAppActive = active;

  if (!active) {
    flushActiveSegment();
    return;
  }

  if (sessionState.isFeedFocused && sessionState.segmentStartAt === null) {
    sessionState.segmentStartAt = Date.now();
  }
};

export const getFeedElapsedMs = (now = Date.now()): number => {
  if (!isTimerRunning(sessionState)) {
    return sessionState.cumulativeFeedMs;
  }

  return (
    sessionState.cumulativeFeedMs + (now - (sessionState.segmentStartAt ?? now))
  );
};

export const getCurrentSegmentMs = (now = Date.now()): number => {
  if (sessionState.segmentStartAt === null) {
    return 0;
  }

  return now - sessionState.segmentStartAt;
};

export const markThresholdShown = (minutes: WellnessThresholdMinutes) => {
  sessionState.shownThresholds.add(minutes);
};

export const getNextThresholdToShow = (
  elapsedMs: number,
): WellnessThresholdMinutes | null => {
  const orderedThresholds = [...getWellnessThresholds()].sort(
    (a, b) => b.minutes - a.minutes,
  );

  for (const {elapsedMs: thresholdMs, minutes} of orderedThresholds) {
    if (
      elapsedMs >= thresholdMs &&
      !sessionState.shownThresholds.has(minutes)
    ) {
      return minutes;
    }
  }

  return null;
};

export const resetFeedSessionForTests = () => {
  sessionState.cumulativeFeedMs = 0;
  sessionState.segmentStartAt = null;
  sessionState.shownThresholds = new Set();
  sessionState.isFeedFocused = false;
  sessionState.isAppActive = true;
};
