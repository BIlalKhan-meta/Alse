import {useEffect, useRef} from 'react';
import {AppState, Linking, Platform} from 'react-native';
import {handleIncomingDeepLink} from '../../services/pushNotificationService';

/**
 * Listens for alse://… and HTTPS /u/{id} share links (cold start + warm).
 * Also re-checks the intent URL when Android resumes from background
 * (singleTask + browser "Open in app").
 */
export default function DeepLinkHandler() {
  const lastHandledUrlRef = useRef<string | null>(null);
  const lastHandledAtRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const handleUrl = (url: string | null | undefined) => {
      if (!mounted || !url) {
        return;
      }
      const trimmed = url.trim();
      if (!trimmed) {
        return;
      }
    // Avoid double-handling the same URL from getInitialURL + event within a short window.
    // Allow the same URL again later (user taps the link a second time).
    if (
      lastHandledUrlRef.current === trimmed &&
      Date.now() - lastHandledAtRef.current < 1500
    ) {
      return;
    }
    lastHandledUrlRef.current = trimmed;
    lastHandledAtRef.current = Date.now();
    handleIncomingDeepLink(trimmed);
  };

    Linking.getInitialURL()
      .then(handleUrl)
      .catch(err => console.warn('[DeepLink] getInitialURL failed', err));

    const sub = Linking.addEventListener('url', ({url}) => handleUrl(url));

    // Android singleTask: after returning from browser, Linking sometimes only
    // updates the activity intent — re-read it when app becomes active.
    const appStateSub = AppState.addEventListener('change', state => {
      if (state !== 'active' || Platform.OS !== 'android') {
        return;
      }
      Linking.getInitialURL()
        .then(url => {
          if (!url || url === lastHandledUrlRef.current) {
            return;
          }
          handleUrl(url);
        })
        .catch(() => {});
    });

    return () => {
      mounted = false;
      sub.remove();
      appStateSub.remove();
    };
  }, []);

  return null;
}
