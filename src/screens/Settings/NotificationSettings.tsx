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

// Map UI toggles to Module 10 preference keys
const TOGGLE_MAP = {
  like: 'likes_enabled',
  comment: 'comments_enabled',
  follows: 'followers_enabled',
  newPosts: 'promotions_enabled',
  auctionUpdates: 'marketplace_enabled',
  push: 'push_enabled',
} as const;

const NotificationsSettings = () => {
  const dispatch = useAppDispatch();
  const notifications = useSelector(selectNotificationSettings);
  const {t} = useAppTranslation();

  const toBool = (v: unknown) => v === true || v === 1 || v === '1';
  const toggleLoading = useSelector(selectNotificationToggleLoading);

  const like = toBool(notifications?.likes_enabled);
  const comment = toBool(notifications?.comments_enabled);
  const follows = toBool(notifications?.followers_enabled);
  const newPosts = toBool(notifications?.promotions_enabled);
  const auctionUpdates = toBool(notifications?.marketplace_enabled);
  const pushEnabled = toBool(
    notifications?.push_enabled == null ? true : notifications.push_enabled,
  );

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
            {t('Notification')}
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>Push notifications</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={pushEnabled}
                onValueChange={v => handleToggle('push', v)}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>

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
