import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useFocusEffect, NavigationProp, ParamListBase} from '@react-navigation/native';
import {
  getCurrentSegmentMs,
  getFeedElapsedMs,
  getNextThresholdToShow,
  markThresholdShown,
  setAppActive,
  setFeedFocus,
  WellnessThresholdMinutes,
} from '../utils/feedSessionTracking';

const TICK_MS = 1000;

export const useFeedSessionTracking = (
  navigation: NavigationProp<ParamListBase>,
) => {
  const [activeThreshold, setActiveThreshold] =
    useState<WellnessThresholdMinutes | null>(null);
  const [totalFeedMs, setTotalFeedMs] = useState(0);
  const [currentSegmentMs, setCurrentSegmentMs] = useState(0);
  const isFeedFocusedRef = useRef(false);
  const isAppActiveRef = useRef(AppState.currentState === 'active');

  const syncElapsed = useCallback(() => {
    const now = Date.now();
    setTotalFeedMs(getFeedElapsedMs(now));
    setCurrentSegmentMs(getCurrentSegmentMs(now));

    const nextThreshold = getNextThresholdToShow(getFeedElapsedMs(now));
    if (nextThreshold !== null && isFeedFocusedRef.current && isAppActiveRef.current) {
      setActiveThreshold(nextThreshold);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFeedFocusedRef.current = true;
      setFeedFocus(true);
      syncElapsed();

      return () => {
        isFeedFocusedRef.current = false;
        setFeedFocus(false);
        setActiveThreshold(null);
        syncElapsed();
      };
    }, [syncElapsed]),
  );

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const isActive = nextState === 'active';
      isAppActiveRef.current = isActive;
      setAppActive(isActive);

      if (!isActive) {
        setActiveThreshold(null);
      }

      syncElapsed();
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [syncElapsed]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isFeedFocusedRef.current || !isAppActiveRef.current) {
        return;
      }

      syncElapsed();
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [syncElapsed]);

  const dismissWarning = useCallback(() => {
    if (activeThreshold !== null) {
      markThresholdShown(activeThreshold);
    }
    setActiveThreshold(null);
    syncElapsed();
  }, [activeThreshold, syncElapsed]);

  const closeFeed = useCallback(() => {
    if (activeThreshold !== null) {
      markThresholdShown(activeThreshold);
    }
    setActiveThreshold(null);

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [activeThreshold, navigation]);

  return {
    activeThreshold,
    totalFeedMs,
    currentSegmentMs,
    dismissWarning,
    closeFeed,
    isWarningVisible: activeThreshold !== null,
  };
};
