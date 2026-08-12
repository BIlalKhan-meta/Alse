import notifee from '@notifee/react-native';
import {getUnreadNotificationCount} from '../api/notifications';
import eventEmitter, {EVENT_TYPES} from '../utils/EventEmitter';

function parseUnreadCount(res: any): number {
  const data = res?.data?.data ?? res?.data;
  if (typeof data?.total === 'number') {
    return data.total;
  }
  if (typeof data?.count === 'number') {
    return data.count;
  }
  if (typeof data === 'number') {
    return data;
  }
  return 0;
}

export async function syncNotificationBadgeCount(
  countOverride?: number,
): Promise<number> {
  let count = countOverride;
  if (typeof count !== 'number') {
    try {
      const res = await getUnreadNotificationCount();
      count = parseUnreadCount(res);
    } catch {
      return 0;
    }
  }

  const safeCount = Math.max(0, count);
  try {
    await notifee.setBadgeCount(safeCount);
  } catch (error) {
    console.warn('[FCM] setBadgeCount failed:', error);
  }
  eventEmitter.emit(EVENT_TYPES.NOTIFICATION_BADGE_UPDATED, safeCount);
  return safeCount;
}

export async function refreshNotificationBadgeFromApi(): Promise<number> {
  return syncNotificationBadgeCount();
}
