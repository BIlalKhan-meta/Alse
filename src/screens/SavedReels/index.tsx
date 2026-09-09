import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Clapperboard, Play} from 'lucide-react-native';
import {getSavedItems, removeSavedItem} from '../../api/menu';
import Loader from '../../components/Loader';
import InterRegular from '../../components/Text/InterRegular';
import {getMessage, Toast} from '../../utils/helpers';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import styles from './styles';

type SavedReelRow = {
  savedId: number;
  videoId: number;
  title?: string;
  content?: string;
  video?: string;
  userName?: string;
  avatar?: string;
};

const STILL_IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif)(\?|$)/i;

const truncate = (value: string, max = 64) => {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
};

const mapSavedVideo = (item: any): SavedReelRow | null => {
  const savable = item?.savable_item;
  if (!savable) return null;
  const videoId = Number(savable.id ?? item.savable_id);
  if (!Number.isFinite(videoId)) return null;

  const rawCaption =
    savable.content?.trim() ||
    savable.title?.trim() ||
    '';

  return {
    savedId: Number(item.id),
    videoId,
    title: rawCaption || 'Reel & video',
    content: savable.content,
    video: savable.video || savable.video_url || savable.url,
    userName:
      savable.fullname ||
      savable.user?.full_name ||
      savable.user?.name ||
      'Creator',
    avatar: savable.avatar || savable.user?.avatar,
  };
};

const SavedReelTile: React.FC<{
  item: SavedReelRow;
  unsaving: boolean;
  onOpen: () => void;
  onUnsave: () => void;
}> = ({item, unsaving, onOpen, onUnsave}) => {
  const [thumbFailed, setThumbFailed] = useState(false);
  const showThumb =
    !!item.video && STILL_IMAGE_EXT.test(item.video) && !thumbFailed;

  return (
    <Pressable
      style={styles.tile}
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}>
      <View style={styles.tileMedia}>
        {showThumb ? (
          <Image
            source={{uri: item.video}}
            style={styles.tileImage}
            resizeMode="cover"
            onError={() => setThumbFailed(true)}
          />
        ) : (
          <View style={styles.tilePlaceholder}>
            <View style={styles.playCircle}>
              <Play size={20} color="#fff" fill="#fff" />
            </View>
          </View>
        )}
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.82)']}
        style={styles.gradient}>
        <View style={styles.userRow}>
          <Image
            source={item.avatar ? {uri: item.avatar} : images.user}
            style={styles.avatar}
          />
          <Text style={styles.userName} numberOfLines={1}>
            {item.userName}
          </Text>
        </View>
        <Text style={styles.tileCaption} numberOfLines={2}>
          {truncate(item.title || 'Reel & video')}
        </Text>
      </LinearGradient>

      <View style={styles.tileTopRow} pointerEvents="box-none">
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>REEL</Text>
        </View>
        <TouchableOpacity
          style={styles.unsaveBtn}
          onPress={onUnsave}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          disabled={unsaving}
          accessibilityRole="button"
          accessibilityLabel="Remove from saved">
          {unsaving ? (
            <ActivityIndicator size="small" color={colors.themeColor} />
          ) : (
            <Image
              source={images.unsave}
              style={styles.unsaveIcon}
              tintColor={colors.themeColor}
            />
          )}
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const SavedReels: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<SavedReelRow[]>([]);
  const [unsaveId, setUnsaveId] = useState<number | null>(null);

  const fetchSavedReels = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await getSavedItems({type: 'video'});
      const rows = res?.data?.data?.data ?? res?.data?.data ?? [];
      const list = (Array.isArray(rows) ? rows : [])
        .map(mapSavedVideo)
        .filter(Boolean) as SavedReelRow[];
      setItems(list);
    } catch (e) {
      Toast.error(getMessage(e as any) || 'Failed to load reels & videos');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedReels();
    }, [fetchSavedReels]),
  );

  const openReel = useCallback(
    (videoId: number) => {
      navigation.navigate('TabNavigation', {
        screen: 'Videos',
        params: {videoId},
      });
    },
    [navigation],
  );

  const handleUnsave = useCallback(async (row: SavedReelRow) => {
    setUnsaveId(row.videoId);
    try {
      await removeSavedItem({item_type: 'video', item_id: row.videoId});
      setItems(prev => prev.filter(r => r.videoId !== row.videoId));
      Toast.success('Removed from reels & videos');
    } catch (e) {
      Toast.error(getMessage(e as any) || 'Failed to remove saved item');
    } finally {
      setUnsaveId(null);
    }
  }, []);

  const countLabel = useMemo(() => {
    const n = items.length;
    return n === 1 ? '1 saved' : `${n} saved`;
  }, [items.length]);

  const renderHeader = () => (
    <View style={styles.introCard}>
      <View style={styles.introIconWrap}>
        <Clapperboard size={22} color={colors.themeColor} strokeWidth={2.2} />
      </View>
      <View style={styles.introTextWrap}>
        <Text style={styles.introTitle}>Reels & Videos</Text>
        <InterRegular style={styles.introSubtitle}>
          Tap any tile to watch. Bookmark removes it from this list.
        </InterRegular>
      </View>
      {items.length > 0 ? (
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{countLabel}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Clapperboard size={32} color={colors.themeColor} strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>No reels & videos saved yet</Text>
      <InterRegular style={styles.emptySubtitle}>
        Save reels from the Videos tab and they will appear here in a grid you
        can revisit anytime.
      </InterRegular>
    </View>
  );

  const renderItem = ({item}: {item: SavedReelRow}) => (
    <SavedReelTile
      item={item}
      unsaving={unsaveId === item.videoId}
      onOpen={() => openReel(item.videoId)}
      onUnsave={() => handleUnsave(item)}
    />
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => String(item.savedId || item.videoId)}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
        }
        ListHeaderComponent={items.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={() => fetchSavedReels(true)}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default SavedReels;
