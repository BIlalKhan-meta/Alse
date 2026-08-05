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
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';

// Map UI toggles to Module 10 preference keys
const TOGGLE_MAP = {
  push: 'push_enabled',
  likes: 'likes_enabled',
  comments: 'comments_enabled',
  followers: 'followers_enabled',
  promotions: 'promotions_enabled',
  marketplace: 'marketplace_enabled',
  messages: 'messages_enabled',
  replies: 'replies_enabled',
  mentions: 'mentions_enabled',
  priceDrop: 'price_drop_enabled',
  localActivity: 'local_activity_enabled',
  announcements: 'announcements_enabled',
  orders: 'orders_enabled',
  email: 'email_enabled',
} as const;

const TOGGLE_ROWS: Array<{
  key: keyof typeof TOGGLE_MAP;
  label: string;
  defaultOn?: boolean;
}> = [
  {key: 'push', label: 'Push notifications', defaultOn: true},
  {key: 'likes', label: 'Likes'},
  {key: 'comments', label: 'Comments'},
  {key: 'replies', label: 'Replies'},
  {key: 'mentions', label: 'Mentions'},
  {key: 'followers', label: 'Followers'},
  {key: 'messages', label: 'Messages'},
  {key: 'promotions', label: 'Promotions'},
  {key: 'marketplace', label: 'Marketplace'},
  {key: 'priceDrop', label: 'Price drops'},
  {key: 'localActivity', label: 'Local activity'},
  {key: 'announcements', label: 'Announcements'},
  {key: 'orders', label: 'Orders'},
  {key: 'email', label: 'Email notifications', defaultOn: true},
];

const NotificationsSettings = () => {
  const dispatch = useAppDispatch();
  const notifications = useSelector(selectNotificationSettings);
  const toggleLoading = useSelector(selectNotificationToggleLoading);

  const toBool = (v: unknown, defaultOn = false) => {
    if (v == null) {
      return defaultOn;
    }
    return v === true || v === 1 || v === '1';
  };

  useEffect(() => {
    dispatch(fetchAllSettings());
  }, [dispatch]);

  const handleToggle = useCallback(
    (key: keyof typeof TOGGLE_MAP, value: boolean) => {
      const apiKey = TOGGLE_MAP[key];
      dispatch(
        updateNotifications({
          ...(notifications ?? {}),
          [apiKey]: value,
        }),
      );
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
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={{paddingHorizontal: 16, paddingTop: 6}}>
          <Text style={{fontSize: 18, fontWeight: '700', color: colors.black}}>
            Notification
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {TOGGLE_ROWS.map(row => {
            const apiKey = TOGGLE_MAP[row.key];
            const value = toBool(
              notifications?.[apiKey as keyof typeof notifications],
              row.defaultOn ?? false,
            );
            return (
              <View key={row.key} style={styles.settingsItem}>
                <Text style={styles.settingsItemText}>{row.label}</Text>
                <View style={styles.switchContainer}>
                  <Switch
                    value={value}
                    onValueChange={v => handleToggle(row.key, v)}
                    trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                    thumbColor={'#FFFFFF'}
                    ios_backgroundColor={'#E5E7EB'}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsSettings;
