import {useEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';

/**
 * True only while the app process is foreground-active.
 * Navigation focus alone is not enough — backgrounded tabs stay "focused"
 * and would keep ExoPlayer/AVPlayer decoding (ANR / App Hang / thermal abort).
 */
export function useAppIsActive(): boolean {
  const [isActive, setIsActive] = useState(
    () => AppState.currentState === 'active',
  );

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      setIsActive(next === 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  return isActive;
}

export default useAppIsActive;
