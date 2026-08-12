import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import GlobalHeader from '../../../components/GlobalHeader';
import {colors} from '../../../utils/theme';
import {getNotifications, markAllRead, markRead} from '../../../api/home';
import {trackNotificationClick} from '../../../api/notifications';
import {routeNotificationPayload} from '../../../services/pushNotificationService';
import {
  getAbsoluteAvatarUrl,
  getDateSection,
} from '../../../utils/helpers';
import {images} from '../../../utils/images';
import {refreshNotificationBadgeFromApi} from '../../../utils/notificationBadge';

type NotificationRow = {
  id: string;
  created_at: string;
  read_at: string | null;
  message: string;
  title: string;
  avatarUrl: string | null;
  thumbnailUrl: string | null;
  metaKind: string;
  objectType: string | null;
  objectId: string | null;
  deepLink: string | null;
  notificationType: string | null;
  rawData: Record<string, any>;
};

function extractNotificationsList(response: any): any[] {
  const body = response?.data;
  if (!body) {
    return [];
  }
  if (Array.isArray(body)) {
    return body;
  }
  if (Array.isArray(body.data)) {
    return body.data;
  }
  if (Array.isArray(body.data?.data)) {
    return body.data.data;
  }
  if (Array.isArray(body.notifications)) {
    return body.notifications;
  }
  return [];
}

function parseDataField(data: unknown): Record<string, any> {
  if (data == null) {
    return {};
  }
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {message: data};
    }
  }
  if (typeof data === 'object') {
    return data as Record<string, any>;
  }
  return {};
}

function inferKind(raw: any, data: Record<string, any>): string {
  const type = String(
    raw?.notification_type || data.notification_type || data.type || raw?.type || '',
  ).toLowerCase();
  if (type.includes('like')) {
    return 'like';
  }
  if (type.includes('mention')) {
    return 'mention';
  }
  if (type.includes('comment') || type.includes('reply')) {
    return 'comment';
  }
  if (type.includes('follow')) {
    return 'follow';
  }
  if (type.includes('message')) {
    return 'message';
  }
  if (type.includes('order') || type.includes('payment')) {
    return 'order';
  }
  if (type.includes('price')) {
    return 'price';
  }
  return 'default';
}

function metaLabelForKind(kind: string): string {
  switch (kind) {
    case 'like':
      return 'Like';
    case 'mention':
      return 'Mention';
    case 'comment':
      return 'Comment';
    case 'follow':
      return 'Follow';
    case 'message':
      return 'Message';
    case 'order':
      return 'Order';
    case 'price':
      return 'Deal';
    default:
      return 'Activity';
  }
}

function normalizeNotification(raw: any, fallbackIndex: number): NotificationRow {
  const data = parseDataField(raw?.data);
  // Module 10 nests title/message in data; also support flat columns
  const nested = parseDataField(data?.data);
  const id = String(raw?.id ?? raw?.uuid ?? raw?.notification_id ?? `n-${fallbackIndex}`);
  const kind = inferKind(raw, data);

  const title =
    (typeof data.title === 'string' && data.title.trim()) ||
    (typeof raw?.title === 'string' && raw.title.trim()) ||
    '';

  let message =
    (typeof data.message === 'string' && data.message.trim()) ||
    (typeof raw?.message === 'string' && raw.message.trim()) ||
    '';

  if (!message) {
    message = title || 'You have a new notification';
  }

  const avatarRaw =
    data.avatar ??
    data.user_avatar ??
    data.sender_avatar ??
    nested.avatar ??
    raw?.image ??
    raw?.sender?.avatar;

  const thumbRaw =
    raw?.image ??
    data.image ??
    data.post_image ??
    data.thumbnail ??
    nested.image;

  const objectType =
    raw?.object_type || data.object_type || nested.object_type || null;
  const objectId = String(
    raw?.object_id ?? data.object_id ?? nested.object_id ?? '',
  ) || null;
  const deepLink = raw?.deep_link || data.deep_link || null;
  const notificationType =
    raw?.notification_type || data.notification_type || null;

  return {
    id,
    created_at: raw?.created_at || raw?.createdAt || '',
    read_at: raw?.read_at ?? raw?.readAt ?? null,
    message,
    title,
    avatarUrl: avatarRaw ? getAbsoluteAvatarUrl(String(avatarRaw)) : null,
    thumbnailUrl: thumbRaw ? getAbsoluteAvatarUrl(String(thumbRaw)) : null,
    metaKind: metaLabelForKind(kind),
    objectType: objectType ? String(objectType) : null,
    objectId,
    deepLink: deepLink ? String(deepLink) : null,
    notificationType: notificationType ? String(notificationType) : null,
    rawData: {
      ...data,
      notification_id: id,
      notification_type: notificationType,
      object_type: objectType,
      object_id: objectId,
      deep_link: deepLink,
    },
  };
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter(n => n.read_at == null).length,
    [notifications],
  );

  const fetchNotifications = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getNotifications({per_page: 50});
      const list = extractNotificationsList(response);
      setNotifications(list.map((raw, i) => normalizeNotification(raw, i)));
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const item = notifications.find(n => n.id === id);
    if (item?.read_at != null) {
      return;
    }
    try {
      await markRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? {...n, read_at: new Date().toISOString()} : n,
        ),
      );
      refreshNotificationBadgeFromApi().catch(() => {});
    } catch (error) {
      console.log('Error marking notification read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      const now = new Date().toISOString();
      setNotifications(prev =>
        prev.map(n => (n.read_at == null ? {...n, read_at: now} : n)),
      );
      refreshNotificationBadgeFromApi().catch(() => {});
    } catch (error) {
      console.log('Error marking all notifications read:', error);
    }
  };

  const handlePress = async (item: NotificationRow) => {
    await handleMarkAsRead(item.id);
    trackNotificationClick(item.id).catch(() => {});
    routeNotificationPayload(item.rawData, {
      fromUserPress: true,
      title: item.title,
    });
  };

  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) {
      return '';
    }
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.max(
      0,
      Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60)),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    }
    return `${Math.floor(diffInMinutes / (60 * 24))}d ago`;
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const shouldShowSectionHeader = (currentItem: NotificationRow, index: number) => {
    if (index === 0) {
      return true;
    }
    if (!currentItem.created_at || !notifications[index - 1]?.created_at) {
      return false;
    }
    const currentSection = getDateSection(currentItem.created_at);
    const previousSection = getDateSection(notifications[index - 1].created_at);
    return currentSection !== previousSection;
  };

  const renderNotificationItemWithHeader = (
    item: NotificationRow,
    index: number,
  ) => {
    const unread = item.read_at == null;

    return (
      <View>
        {shouldShowSectionHeader(item, index) &&
          item.created_at &&
          renderSectionHeader(getDateSection(item.created_at))}

        <TouchableOpacity
          style={[styles.notificationItem, unread && styles.notificationItemUnread]}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                item.avatarUrl
                  ? {uri: item.avatarUrl}
                  : images.defaultDp
              }
              style={styles.profileImage}
            />
          </View>

          <View style={styles.notificationContent}>
            <Text style={styles.notificationText}>{item.message}</Text>
            <View style={styles.notificationMeta}>
              <Text style={styles.notificationMetaText}>
                {item.metaKind} • {getTimeAgo(item.created_at)}
              </Text>
            </View>
          </View>

          {item.thumbnailUrl ? (
            <View style={styles.contentImageContainer}>
              <Image
                source={{uri: item.thumbnailUrl}}
                style={styles.contentImage}
              />
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  const listEmpty = (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyHint}>Pull down to refresh and load updates.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <View style={styles.notificationCounter}>
        <Text style={styles.notificationCounterText}>
          {notifications.length === 0 ? (
            'Pull down to load notifications.'
          ) : unreadCount > 0 ? (
            <>
              <Text style={styles.notificationCounterNumber}>{unreadCount}</Text>
              {' unread · '}
              {notifications.length} total
            </>
          ) : (
            <>
              {"You're all caught up · "}
              {notifications.length} notification
              {notifications.length !== 1 ? 's' : ''}
            </>
          )}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} hitSlop={8}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        renderItem={({item, index}) =>
          renderNotificationItemWithHeader(item, index)
        }
        refreshing={refreshing}
        onRefresh={fetchNotifications}
        ListEmptyComponent={listEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          notifications.length === 0 ? styles.listEmptyContent : styles.listContentContainer
        }
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginBottom: 4,
  },
  notificationCounter: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationCounterText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  notificationCounterNumber: {
    fontWeight: '700',
    color: colors.themeColor,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.themeColor,
    marginLeft: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  notificationItemUnread: {
    backgroundColor: '#F8FAFC',
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  notificationMeta: {
    marginTop: 4,
  },
  notificationMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  contentImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  contentImage: {
    width: '100%',
    height: '100%',
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContentContainer: {
    paddingBottom: 24,
  },
  listEmptyContent: {
    flexGrow: 1,
  },
});

export default Notifications;
