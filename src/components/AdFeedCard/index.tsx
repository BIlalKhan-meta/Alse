import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MoreHorizontal} from 'lucide-react-native';
import {colors} from '../../utils/theme';
import {
  hideAd,
  notInterested,
  recordClick,
  recordImpression,
  reportAd,
} from '../../api/advertising';
import {Toast, getMessage} from '../../utils/helpers';

export type AdFeedItem = {
  id?: string | number;
  feed_item_type?: string;
  type?: string;
  advertisement_id: number;
  title?: string;
  description?: string;
  media_url?: string | null;
  cta_text?: string | null;
  destination_type?: 'product' | 'shop' | 'post' | 'url' | string | null;
  destination_id?: number | null;
  destination_url?: string | null;
  is_ad?: boolean;
};

type AdFeedCardProps = {
  item: AdFeedItem;
  onRemoved?: (advertisementId: number) => void;
  recordView?: boolean;
};

const AdFeedCard: React.FC<AdFeedCardProps> = ({
  item,
  onRemoved,
  recordView = false,
}) => {
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);
  const impressionSent = useRef(false);
  const adId = Number(item.advertisement_id);

  const sendImpression = useCallback(() => {
    if (!adId || impressionSent.current) {
      return;
    }
    impressionSent.current = true;
    recordImpression(adId).catch(() => {
      impressionSent.current = false;
    });
  }, [adId]);

  React.useEffect(() => {
    if (recordView) {
      sendImpression();
    }
  }, [recordView, sendImpression]);

  const handleCta = async () => {
    if (!adId) {
      return;
    }
    try {
      await recordClick(adId);
    } catch {
      // still navigate
    }

    const destType = String(item.destination_type || '').toLowerCase();
    if (destType === 'product' && item.destination_id) {
      navigation.navigate('ProductView', {productId: item.destination_id});
      return;
    }
    if (destType === 'shop' && item.destination_id) {
      navigation.navigate('MyShop', {shopId: item.destination_id});
      return;
    }
    if (destType === 'url' && item.destination_url) {
      Linking.openURL(item.destination_url).catch(() =>
        Toast.error('Unable to open link'),
      );
      return;
    }
    if (item.destination_url) {
      Linking.openURL(item.destination_url).catch(() =>
        Toast.error('Unable to open link'),
      );
    }
  };

  const runAction = async (
    action: 'hide' | 'not_interested' | 'report',
  ) => {
    setMenuVisible(false);
    if (!adId) {
      return;
    }
    try {
      if (action === 'hide') {
        await hideAd(adId);
        Toast.success('Ad hidden');
      } else if (action === 'not_interested') {
        await notInterested(adId);
        Toast.success('Marked as not interested');
      } else {
        await reportAd(adId, 'inappropriate');
        Toast.success('Ad reported');
      }
      onRemoved?.(adId);
    } catch (err: any) {
      Toast.error(getMessage(err?.response?.data ?? err?.message ?? err));
    }
  };

  const confirmReport = () => {
    Alert.alert('Report ad', 'Report this advertisement as inappropriate?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Report', style: 'destructive', onPress: () => runAction('report')},
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsored</Text>
        </View>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          accessibilityLabel="Ad options">
          <MoreHorizontal size={22} color="#666" />
        </TouchableOpacity>
      </View>

      {item.media_url ? (
        <Image
          source={{uri: item.media_url}}
          style={styles.media}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.body}>
        {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
        {item.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}
        <TouchableOpacity style={styles.ctaButton} onPress={handleCta}>
          <Text style={styles.ctaText}>{item.cta_text || 'Learn more'}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuSheet}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => runAction('hide')}>
              <Text style={styles.menuItemText}>Hide</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => runAction('not_interested')}>
              <Text style={styles.menuItemText}>Not interested</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={confirmReport}>
              <Text style={[styles.menuItemText, styles.reportText]}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sponsoredBadge: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sponsoredText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  media: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 12,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.themeColor,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.black,
  },
  reportText: {
    color: '#DC2626',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AdFeedCard;
