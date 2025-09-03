import React, {useState, useEffect} from 'react';
import {View, ScrollView, Alert} from 'react-native';
import styles from './styles';
import {useSelector, useDispatch} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useAppTranslation} from '../../i18n/hooks/useAppTranslation';
import GlobalHeader from '../../components/GlobalHeader';
import SettingsItem from './components/settingsItem';
import {
  savePrivacySettings,
  updateSecurity,
} from '../../store/slices/settingsSlice';
import Toast from 'react-native-toast-message';

const SocialActivity = () => {
  const dispatch = useDispatch();
  const {t} = useAppTranslation();

  // Get settings from Redux store with proper typing
  const securitySettings = useSelector(state => state.settings?.security);
  // Local state for managing settings - initialized with defaults matching your interface
  const [localSettings, setLocalSettings] = useState({
    post_visibility: 'public' as 'public' | 'followers' | 'private',
    allow_tags: false,
    comment_permissions: 'everyone' as 'everyone' | 'followers' | 'private',
    auto_filter_offensive: true,
    story_visibility: 'everyone' as 'everyone' | 'followers' | 'private',
    story_replies: 'everyone' as 'everyone' | 'followers' | 'off',
    profile_visibility: 'public' as 'public' | 'private',
    message_requests: 'everyone' as 'everyone' | 'followers' | 'off',
  });

  // Update local state when Redux state changes
  useEffect(() => {
    if (securitySettings) {
      setLocalSettings({
        post_visibility: securitySettings.post_visibility || 'public',
        allow_tags: securitySettings.allow_tags || false,
        comment_permissions: securitySettings.comment_permissions || 'everyone',
        auto_filter_offensive: securitySettings.auto_filter_offensive ?? true,
        story_visibility: securitySettings.story_visibility || 'everyone',
        story_replies: securitySettings.story_replies || 'everyone',
        profile_visibility: securitySettings.profile_visibility || 'public',
        message_requests: securitySettings.message_requests || 'everyone',
      });
    }
  }, [securitySettings]);

  const profileVisibilityOptions = [
    {label: 'Public', value: 'public'},
    {label: 'Buyers Only', value: 'buyers_only'}, // Updated to match your interface
  ];

  const postVisibilityOptions = [
    {label: 'Public', value: 'public'},
    {label: 'Followers', value: 'followers'},
    {label: 'Private', value: 'private'},
  ];

  const commentOptions = [
    {label: t('everyone'), value: 'everyone'},
    {label: t('followers'), value: 'followers'},
    {label: t('private'), value: 'private'}, // Updated to match your interface
  ];

  const storyReplyOptions = [
    {label: t('everyone'), value: 'everyone'},
    {label: t('followers'), value: 'followers'},
    {label: t('off'), value: 'off'},
  ];

  const msgRequestOptions = [
    {label: t('everyone'), value: 'everyone'},
    {label: t('followers'), value: 'followers'},
    {label: t('off'), value: 'off'}, // Updated to match your interface
  ];

  // Handle settings update
  const handleSettingChange = async (key, value) => {
    try {
      // Optimistically update local state
      const updatedSettings = {
        ...localSettings,
        [key]: value,
      };
      setLocalSettings(updatedSettings);
      dispatch(updateSecurity({[key]: value}));

      // Create JSON data
      const jsonData = {
        post_visibility: updatedSettings.post_visibility,
        allow_tags: updatedSettings.allow_tags,
        comment_permissions: updatedSettings.comment_permissions,
        auto_filter_offensive: updatedSettings.auto_filter_offensive,
        story_visibility: updatedSettings.story_visibility,
        story_replies: updatedSettings.story_replies,
        profile_visibility: updatedSettings.profile_visibility,
        message_requests: updatedSettings.message_requests,
      };

      console.log('Sending data to PUT endpoint:', jsonData);

      // Dispatch without ID parameter
      const result = await dispatch(savePrivacySettings(jsonData)).unwrap();

      console.log('Settings updated successfully:', result);
    } catch (error) {
      console.error('Full error:', error);
      setLocalSettings(prev => ({
        ...prev,
        [key]: securitySettings?.[key] || prev[key],
      }));
      dispatch(updateSecurity({[key]: securitySettings?.[key]}));
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update settings. Please try again.',
      });
    }
  };

  // Handle toggle switches
  const handleToggle = key => {
    const newValue = !localSettings[key];
    handleSettingChange(key, newValue);
  };

  // Handle dropdown selections
  const handleSelectChange = (key, value) => {
    handleSettingChange(key, value);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView style={{marginHorizontal: 16}}>
        <SettingsItem
          title={'Profile Visibility'}
          type="select"
          value={localSettings.profile_visibility}
          options={profileVisibilityOptions}
          onValueChange={value =>
            handleSelectChange('profile_visibility', value)
          }
        />

        <SettingsItem
          title={'Post visibility'}
          type="select"
          value={localSettings.post_visibility}
          options={postVisibilityOptions}
          onValueChange={value => handleSelectChange('post_visibility', value)}
        />

        <SettingsItem
          title={'Allow Tags'}
          value={localSettings.allow_tags}
          onToggle={() => handleToggle('allow_tags')}
        />

        <SettingsItem
          title={'Auto filter offensive words'}
          value={localSettings.auto_filter_offensive}
          onToggle={() => handleToggle('auto_filter_offensive')}
        />

        <SettingsItem
          title={'Who can send a message'}
          type="select"
          value={localSettings.message_requests}
          options={msgRequestOptions}
          onValueChange={value => handleSelectChange('message_requests', value)}
        />

        <SettingsItem
          title={'Who can comment'}
          type="select"
          value={localSettings.comment_permissions}
          options={commentOptions}
          onValueChange={value =>
            handleSelectChange('comment_permissions', value)
          }
        />

        <SettingsItem
          title={'Story Visibility'}
          type="select"
          value={localSettings.story_visibility}
          options={postVisibilityOptions} // Reusing same options since they match
          onValueChange={value => handleSelectChange('story_visibility', value)}
        />

        <SettingsItem
          title={'Who can reply to your story'}
          type="select"
          value={localSettings.story_replies}
          options={storyReplyOptions}
          onValueChange={value => handleSelectChange('story_replies', value)}
        />

        <SettingsItem title={'Blocked users'} type="navigation" />
      </ScrollView>
    </View>
  );
};

export default SocialActivity;
