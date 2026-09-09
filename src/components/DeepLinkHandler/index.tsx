import {useEffect} from 'react';
import {Linking} from 'react-native';
import {handleIncomingDeepLink} from '../../services/pushNotificationService';

/**
 * Listens for alse://… and HTTPS /u/{id} share links (cold start + warm).
 */
export default function DeepLinkHandler() {
  useEffect(() => {
    let mounted = true;

    const handleUrl = (url: string | null) => {
      if (!mounted || !url) {
        return;
      }
      handleIncomingDeepLink(url);
    };

    Linking.getInitialURL()
      .then(handleUrl)
      .catch(err => console.warn('[DeepLink] getInitialURL failed', err));

    const sub = Linking.addEventListener('url', ({url}) => handleUrl(url));

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return null;
}
