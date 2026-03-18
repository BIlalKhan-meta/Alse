import React, {useEffect, useCallback} from 'react';
import {View, ScrollView, Text, Switch, Modal, ActivityIndicator} from 'react-native';
import styles from './styles';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '../../hooks/storeHooks';
import {
  selectNotificationSettings,
  selectNotificationToggleLoading,
  fetchAllSettings,
  saveNotificationToggle,
  updateNotifications,
} from '../../store/slices/settingsSlice';
import {useAppTranslation} from '../../i18n/hooks/useAppTranslation';
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';

// Map UI toggles to API types
const TOGGLE_MAP = {
  like: 'social_likes',
  comment: 'social_comments',
  follows: 'social_follows',
  newPosts: 'seller_new_orders',
  auctionUpdates: 'marketplace_orders',
} as const;

const NotificationsSettings = () => {
  const dispatch = useAppDispatch();
  const notifications = useSelector(selectNotificationSettings);
  const {t} = useAppTranslation();

  // Use API values; default to false when not yet loaded (avoids assuming "on")
  // Coerce to boolean - API returns 0/1 or true/false
  const toBool = (v: unknown) => v === true || v === 1 || v === '1';
  const like = toBool(notifications?.types?.social_likes);
  const toggleLoading = useSelector(selectNotificationToggleLoading);
  const comment = toBool(notifications?.types?.social_comments);
  const follows = toBool(notifications?.types?.social_follows);
  const newPosts = toBool(notifications?.types?.seller_new_orders);
  const auctionUpdates = toBool(notifications?.types?.marketplace_orders);

  useEffect(() => {
    dispatch(fetchAllSettings());
  }, [dispatch]);

  const handleToggle = useCallback(
    (key: keyof typeof TOGGLE_MAP, value: boolean) => {
      const apiKey = TOGGLE_MAP[key];
      // Optimistic update: flip switch immediately
      dispatch(
        updateNotifications({
          types: {
            ...(notifications?.types ?? {}),
            [apiKey]: value,
          },
        }),
      );
      // POST only the updated toggle to API
      dispatch(saveNotificationToggle({typeKey: apiKey, value}));
    },
    [dispatch, notifications],
  );

  return (
    <View style={styles.container}>
      <Modal visible={toggleLoading} transparent>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
          <ActivityIndicator size="large" color={colors.themeColor} />
        </View>
      </Modal>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={{paddingHorizontal: 16, paddingTop: 6}}>
          <Text style={{fontSize: 18, fontWeight: '700', color: colors.black}}>
            {t('Notification')}
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Like */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>{t('Like')}</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={like}
                onValueChange={v => handleToggle('like', v)}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
          

          {/* Comment */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>{t('Comment')}</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={comment}
                onValueChange={v => handleToggle('comment', v)}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
          

          {/* Follows */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>{t('Follows')}</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={follows}
                onValueChange={v => handleToggle('follows', v)}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
          

          {/* New posts from followed stores */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>
              {t('New posts from followed stores')}
            </Text>
            <View style={styles.switchContainer}>
              <Switch
                value={newPosts}
                onValueChange={v => handleToggle('newPosts', v)}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
          

          {/* Auction updates */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>{t('Auction updates')}</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={auctionUpdates}
                onValueChange={v => handleToggle('auctionUpdates', v)}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsSettings;
