import React, {useCallback, useMemo, useState} from 'react';
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
import {getNotifications, markRead} from '../../../api/home';
import {vh} from '../../../constant';
import {
  getAbsoluteAvatarUrl,
  getDateSection,
} from '../../../utils/helpers';
import {images} from '../../../utils/images';

type NotificationRow = {
  id: string;
  created_at: string;
  read_at: string | null;
  message: string;
  avatarUrl: string | null;
  thumbnailUrl: string | null;
  metaKind: string;
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
  const hay = `${String(data.type || '').toLowerCase()} ${String(raw.type || '').toLowerCase()}`;
  if (hay.includes('like')) {
    return 'like';
  }
  if (hay.includes('mention')) {
    return 'mention';
  }
  if (hay.includes('comment')) {
    return 'comment';
  }
  if (hay.includes('follow')) {
    return 'follow';
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
    default:
      return 'Activity';
  }
}

function normalizeNotification(raw: any, fallbackIndex: number): NotificationRow {
  const data = parseDataField(raw?.data);
  const id = String(raw?.id ?? raw?.uuid ?? raw?.notification_id ?? `n-${fallbackIndex}`);
  const kind = inferKind(raw, data);

  const userName =
    data.user_name ??
    data.full_name ??
    data.sender_name ??
    raw?.user?.full_name ??
    raw?.sender?.full_name ??
    '';

  let message =
    (typeof data.message === 'string' && data.message.trim()) ||
    (typeof raw?.message === 'string' && raw.message.trim()) ||
    '';

  if (!message) {
    const name = userName.trim() || 'Someone';
    if (kind === 'like') {
      message = `${name} liked your post`;
    } else if (kind === 'mention') {
      message = `${name} mentioned you`;
    } else if (kind === 'comment') {
      message = `${name} commented on your post`;
    } else if (kind === 'follow') {
      message = `${name} started following you`;
    } else {
      message = `${name} sent you a notification`;
    }
  }

  const avatarRaw =
    data.avatar ??
    data.user_avatar ??
    data.sender_avatar ??
    raw?.user?.avatar ??
    raw?.sender?.avatar ??
    raw?.avatar;

  const thumbRaw =
    data.post_image ??
    data.thumbnail ??
    data.image ??
    data.content_image ??
    raw?.content_image ??
    raw?.post?.media?.[0]?.path;

  const readAt = raw?.read_at ?? raw?.readAt ?? null;

  return {
    id,
    created_at: raw?.created_at || raw?.createdAt || '',
    read_at: readAt,
    message,
    avatarUrl: avatarRaw ? getAbsoluteAvatarUrl(String(avatarRaw)) : null,
    thumbnailUrl: thumbRaw ? getAbsoluteAvatarUrl(String(thumbRaw)) : null,
    metaKind: metaLabelForKind(kind),
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
      const response = await getNotifications();
      const list = extractNotificationsList(response);
      setNotifications(list.map((raw, i) => normalizeNotification(raw, i)));
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

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
    } catch (error) {
      console.log('Error marking notification read:', error);
    }
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
          onPress={() => handleMarkAsRead(item.id)}
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
    marginTop: vh * 3,
  },
  notificationCounter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  notificationCounterText: {
    fontSize: 14,
    color: '#333',
  },
  notificationCounterNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.themeColor,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  notificationItemUnread: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationMetaText: {
    fontSize: 12,
    color: '#777',
  },
  contentImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 6,
    overflow: 'hidden',
    marginLeft: 12,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  contentImage: {
    width: '100%',
    height: '100%',
  },
  listContentContainer: {
    paddingBottom: vh * 10,
  },
  listEmptyContent: {
    flexGrow: 1,
    paddingBottom: vh * 10,
  },
  emptyWrap: {
    paddingHorizontal: 24,
    paddingTop: vh * 8,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});

export default Notifications;
