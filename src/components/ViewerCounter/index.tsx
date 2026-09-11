import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {X} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {images} from '../../utils/images';
import {
  subscribeToActiveViewerCount,
  subscribeToViewerActivity,
  ViewerActivityEvent,
} from '../../services/viewerService';

const ViewerCounter = ({
  isLive,
  channelId,
  style,
}: {
  isLive: boolean;
  channelId: string;
  style?: object;
}) => {
  const [viewerCount, setViewerCount] = useState(0);
  const [events, setEvents] = useState<ViewerActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isLive || !channelId) {
      setViewerCount(0);
      setEvents([]);
      setIsLoading(false);
      setVisible(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribeCount = subscribeToActiveViewerCount(
      channelId,
      count => {
        setViewerCount(count);
        setIsLoading(false);
      },
      listenerError => {
        console.error('[ViewerCounter] Count listener failed', listenerError);
        setError('Unable to load viewers');
        setIsLoading(false);
      },
    );
    const unsubscribeEvents = subscribeToViewerActivity(
      channelId,
      nextEvents => {
        setEvents(nextEvents);
      },
      listenerError => {
        console.error('[ViewerCounter] Activity listener failed', listenerError);
        setError('Unable to load viewer activity');
      },
    );

    return () => {
      unsubscribeCount();
      unsubscribeEvents();
    };
  }, [channelId, isLive]);

  if (!isLive) {
    return null;
  }

  const formatTime = (date: Date | null) => {
    if (!date) {
      return 'Just now';
    }
    const elapsedSeconds = Math.max(
      0,
      Math.floor((Date.now() - date.getTime()) / 1000),
    );
    if (elapsedSeconds < 60) {
      return 'Just now';
    }
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
  };

  const renderEvent = ({item}: {item: ViewerActivityEvent}) => (
    <View style={styles.eventRow}>
      <Image
        source={item.avatarUrl ? {uri: item.avatarUrl} : images.profile}
        style={styles.avatar}
      />
      <View style={styles.eventCopy}>
        <Text style={styles.username} numberOfLines={1}>
          {item.username}
        </Text>
        <Text
          style={[
            styles.eventStatus,
            item.type === 'joined' ? styles.joinedText : styles.leftText,
          ]}>
          {item.type === 'joined' ? 'Joined the livestream' : 'Left the livestream'}
        </Text>
      </View>
      <Text style={styles.eventTime}>{formatTime(item.createdAt)}</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.counter, style]}
        onPress={() => setVisible(true)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${viewerCount} viewers. Open viewer activity`}>
        <Image source={images.EyeIcon} style={styles.eyeIcon} />
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" style={styles.loader} />
        ) : (
          <Text style={styles.viewerCount}>{error ? '--' : viewerCount}</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close viewer activity"
          />
          <View
            style={[
              styles.sheet,
              {paddingBottom: Math.max(insets.bottom, 16)},
            ]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Viewer activity</Text>
                <Text style={styles.sheetSubtitle}>
                  {viewerCount} {viewerCount === 1 ? 'person is' : 'people are'} watching
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close viewer activity">
                <X size={22} color="#202124" />
              </TouchableOpacity>
            </View>

            {error && events.length === 0 ? (
              <View style={styles.centerState}>
                <Text style={styles.stateText}>{error}</Text>
              </View>
            ) : isLoading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#0C959B" />
              </View>
            ) : (
              <FlatList
                data={events}
                keyExtractor={item => item.id}
                renderItem={renderEvent}
                contentContainerStyle={
                  events.length === 0
                    ? styles.emptyListContent
                    : styles.listContent
                }
                ListEmptyComponent={
                  <Text style={styles.stateText}>No viewer activity yet</Text>
                }
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  counter: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eyeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  viewerCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  loader: {
    marginLeft: 6,
    transform: [{scale: 0.7}],
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    height: '52%',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  sheetHeader: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E6EB',
  },
  sheetTitle: {
    color: '#202124',
    fontSize: 18,
    fontWeight: '700',
  },
  sheetSubtitle: {
    color: '#65676B',
    fontSize: 13,
    marginTop: 3,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2F5',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventRow: {
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4E6EB',
  },
  eventCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  username: {
    color: '#202124',
    fontSize: 15,
    fontWeight: '600',
  },
  eventStatus: {
    marginTop: 3,
    fontSize: 13,
  },
  joinedText: {
    color: '#198754',
  },
  leftText: {
    color: '#C43D3D',
  },
  eventTime: {
    color: '#8A8D91',
    fontSize: 12,
    marginLeft: 8,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    color: '#65676B',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ViewerCounter;
