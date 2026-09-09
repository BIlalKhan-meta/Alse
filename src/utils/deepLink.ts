export type DeepLinkRoute = {
  routeName: string;
  params?: object;
};

/**
 * Parse backend / push deep_link values like alse://chat/123, alse://user/9.
 * Also accepts HTTPS share URLs ending in /u/{id}.
 */
export function parseDeepLink(deepLink: string | null | undefined): DeepLinkRoute | null {
  if (!deepLink || typeof deepLink !== 'string') {
    return null;
  }
  const trimmed = deepLink.trim();
  if (!trimmed) {
    return null;
  }

  // HTTPS profile share: https://host/.../u/123
  const httpsProfile = trimmed.match(/\/u\/(\d+)(?:[/?#]|$)/i);
  if (
    httpsProfile &&
    (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
  ) {
    return {
      routeName: 'Profile',
      params: {id: Number(httpsProfile[1]) || httpsProfile[1]},
    };
  }

  const match = trimmed.match(/^alse:\/\/([^/?#]+)\/?([^/?#]*)/i);
  if (!match) {
    return null;
  }
  const kind = match[1].toLowerCase();
  const id = match[2] || '';

  switch (kind) {
    case 'chat':
      return id
        ? {
            routeName: 'ChatOngoing',
            params: {id: Number(id) || id, name: 'Chat'},
          }
        : null;
    case 'call':
      return id
        ? {
            routeName: 'AcknowledgeCall',
            params: {chat_id: id, role: '0'},
          }
        : null;
    case 'order':
      return id
        ? {
            routeName: 'MyOrderDetail',
            params: {id: Number(id) || id},
          }
        : null;
    case 'product':
      return id
        ? {
            routeName: 'ProductView',
            params: {productId: Number(id) || id},
          }
        : null;
    case 'shop':
      return id
        ? {
            routeName: 'Shop',
            params: {shopId: Number(id) || id},
          }
        : null;
    case 'user':
      return id
        ? {
            routeName: 'Profile',
            params: {id: Number(id) || id},
          }
        : null;
    case 'post':
    case 'video':
    case 'story':
    case 'live':
    case 'notifications':
      return {routeName: 'Notifications'};
    default:
      return null;
  }
}
