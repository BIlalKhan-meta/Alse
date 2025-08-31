import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {useSelector} from 'react-redux';
import {
  LocationEdit,
  PencilLine,
  Shield,
  Bell,
  Globe,
  User,
  Gavel,
  ShoppingCart,
  Lock,
  Users,
} from 'lucide-react-native';
import InterRegular from '../../components/Text/InterRegular';
import InterLight from '../../components/Text/InterLight';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import {selectUserProfile} from '../../store/slices/authSlice';
import {images} from '../../utils/images';
import styles from './styles';
import {colors} from '../../utils/theme';
import SettingsItem from './components/settingsItem';
import {useAppDispatch} from '../../hooks/storeHooks';
import {fetchAllSettings} from '../../store/slices/settingsSlice';
import {useAppTranslation} from '../../i18n/hooks/useAppTranslation';
import GlobalHeader from '../../components/GlobalHeader';

const Settings = ({navigation}: any) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const userRole = user?.role || 'buyer';
  const {currentLanguage, t} = useAppTranslation();

  useEffect(() => {
    dispatch(fetchAllSettings());
  }, [dispatch]);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || user?.full_name?.split(' ')[0] || '',
    lastName: user?.last_name || user?.full_name?.split(' ')[1] || '',
    userName: user?.username || user?.full_name || '',
    location: user?.location || '',
    description: user?.bio || '',
    pronouns: user?.pronouns || '',
    storeName: user?.store_name || '',
    storeDescription: user?.store_description || '',
  });

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Profile Form Component
  const ProfileForm = () => (
    <View style={styles.profileForm}>
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <InterRegular style={styles.inputLabel}>
            {t('settings.firstName')}
          </InterRegular>
          <TextInput
            style={styles.textInput}
            value={profileData.firstName}
            onChangeText={text => handleProfileUpdate('firstName', text)}
            placeholder={t('settings.firstName')}
          />
        </View>
        <View style={styles.inputContainer}>
          <InterRegular style={styles.inputLabel}>
            {t('settings.lastName')}
          </InterRegular>
          <TextInput
            style={styles.textInput}
            value={profileData.lastName}
            onChangeText={text => handleProfileUpdate('lastName', text)}
            placeholder={t('settings.lastName')}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>
          {t('settings.userName')}
        </InterRegular>
        <TextInput
          style={styles.textInput}
          value={profileData.userName}
          onChangeText={text => handleProfileUpdate('userName', text)}
          placeholder={t('settings.userName')}
        />
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>
          {t('settings.pronouns')}
        </InterRegular>
        <TextInput
          style={styles.textInput}
          value={profileData.pronouns}
          onChangeText={text => handleProfileUpdate('pronouns', text)}
          placeholder={t('settings.pronounsPlaceholder')}
        />
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>
          {t('settings.location')}
        </InterRegular>
        <View style={styles.textInputWithIcon}>
          <TextInput
            style={[styles.textInput, styles.textInputWithIconInput]}
            value={profileData.location}
            onChangeText={text => handleProfileUpdate('location', text)}
            placeholder={t('settings.location')}
          />
          <TouchableOpacity style={styles.inputIcon}>
            <LocationEdit size={20} color={colors.inputText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>
          {t('settings.bio')}
        </InterRegular>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profileData.description}
          onChangeText={text => handleProfileUpdate('description', text)}
          placeholder={t('settings.bioPlaceholder')}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {userRole === 'seller' && (
        <>
          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>
              {t('settings.storeName')}
            </InterRegular>
            <TextInput
              style={styles.textInput}
              value={profileData.storeName}
              onChangeText={text => handleProfileUpdate('storeName', text)}
              placeholder={t('settings.storeNamePlaceholder')}
            />
          </View>

          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>
              {t('settings.storeDescription')}
            </InterRegular>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={profileData.storeDescription}
              onChangeText={text =>
                handleProfileUpdate('storeDescription', text)
              }
              placeholder={t('settings.storeDescriptionPlaceholder')}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </>
      )}
    </View>
  );

  // Get current language display name
  const getCurrentLanguageName = () => {
    switch (currentLanguage) {
      case 'en':
        return 'English';
      case 'sw':
        return 'Kiswahili';
      default:
        return 'English';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={user?.avatar ? {uri: user.avatar} : images.profile}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileTextContainer}>
              <InterBoldLabel style={styles.profileName}>
                {user?.full_name || 'Alse'}
              </InterBoldLabel>
              <InterLight style={styles.profileUsername}>
                {user?.username || '_alsepereze'}
              </InterLight>
              <InterLight style={styles.profileLocation}>
                {user?.location || 'New jersey, NY'}
              </InterLight>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}>
              <PencilLine size={20} color={colors.themeColor} />
            </TouchableOpacity>
          </View>

          {isEditing && <ProfileForm />}
        </View>

        {!isEditing && (
          <View style={styles.settingsContainer}>
            {/* Notification */}
            <SettingsItem
              title={t('settings.notification')}
              icon={Bell}
              type="navigation"
              onPress={() => {
                /* Navigate to notification settings */
              }}
            />

            {/* Language */}
            <SettingsItem
              title={t('settings.language')}
              subtitle={getCurrentLanguageName()}
              icon={Globe}
              type="navigation"
              onPress={() => {
                navigation.navigate('LanguageSelection');
              }}
            />

            {/* Profile Setting */}
            <SettingsItem
              title={t('settings.profileSetting')}
              icon={User}
              type="navigation"
              onPress={() => {
                /* Navigate to profile settings */
              }}
            />

            {/* Social Activity */}
            <SettingsItem
              title={t('settings.socialActivity')}
              icon={Users}
              type="navigation"
              onPress={() => {
                /* Navigate to social activity */
              }}
            />

            {/* Advance protection */}
            <SettingsItem
              title={t('settings.advanceProtection')}
              icon={Shield}
              value={true}
              onToggle={() => {}}
            />

            {/* Separator */}
            <View style={styles.separator} />

            {/* Bidding & Auction Setting */}
            <SettingsItem
              title={t('settings.biddingAuctionSetting')}
              icon={Gavel}
              type="navigation"
              onPress={() => {
                /* Navigate to bidding settings */
              }}
            />

            {/* Marketplace Activity */}
            <SettingsItem
              title={t('settings.marketplaceActivity')}
              icon={ShoppingCart}
              type="navigation"
              onPress={() => {
                /* Navigate to marketplace activity */
              }}
            />

            {/* Security & Privacy */}
            <SettingsItem
              title={t('settings.securityPrivacy')}
              icon={Lock}
              type="navigation"
              onPress={() => {
                /* Navigate to security settings */
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Settings;
