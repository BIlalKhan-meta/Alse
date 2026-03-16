import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import {
  PencilLine,
  Bell,
  Globe,
  Gavel,
  ShoppingCart,
  Lock,
  Users,
} from 'lucide-react-native';
import InterLight from '../../components/Text/InterLight';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import {GetUserProfile, selectUserProfile} from '../../store/slices/authSlice';
import {selectProfileData} from '../../store/slices/settingsSlice';
import {images} from '../../utils/images';
import styles from './styles';
import {colors} from '../../utils/theme';
import SettingsItem from './components/settingsItem';
import {useAppDispatch} from '../../hooks/storeHooks';
import {
  fetchAllSettings,
  updateProfile,
} from '../../store/slices/settingsSlice';
import {useAppTranslation} from '../../i18n/hooks/useAppTranslation';
import GlobalHeader from '../../components/GlobalHeader';
import ProfileForm from './components/profileForm';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {updateUserType} from '../../api/settings';
import {useRoute} from '@react-navigation/native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {getAbsoluteAvatarUrl} from '../../utils/helpers';
import {BASE_URL} from '../../utils/baseurl';
import endpoints from '../../api/endpoints';
import store from '../../store';

interface RouteParams {
  isEditMode?: boolean;
}

const avatarUploadingStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

const Settings = ({navigation}: any) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const profileData = useSelector(selectProfileData);
  const {currentLanguage, t} = useAppTranslation();
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);
  const [avatarKey, setAvatarKey] = useState(0); // Force Image remount after upload
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentUserType, setCurrentUserType] = useState(user?.user_type || 'buyer');
  const [userTypeLoading, setUserTypeLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllSettings());
  }, [dispatch]);

  // Update currentUserType when user data changes
  useEffect(() => {
    if (user?.user_type && user.user_type !== currentUserType) {
      setCurrentUserType(user.user_type);
    }
  }, [user?.user_type]);

  // Sync local profile data and avatar when user is updated (e.g. after profile save + refetch)
  useEffect(() => {
    if (user) {
      setLocalProfileData({
        firstName: user?.first_name || user?.full_name?.split(' ')[0] || '',
        lastName: user?.last_name || user?.full_name?.split(' ')[1] || '',
        userName: user?.username || user?.full_name || '',
        location: user?.location || user?.location_name || '',
        description: user?.bio || '',
        pronouns: user?.pronouns || '',
        storeName: user?.store_name || '',
        storeDescription: user?.store_description || '',
      });
      if (user?.avatar) {
        setAvatarUri(user.avatar);
      }
    }
  }, [user?.id, user?.first_name, user?.last_name, user?.username, user?.location, user?.location_name, user?.bio, user?.pronouns, user?.store_name, user?.store_description, user?.avatar]);

  // Profile editing state
  const route = useRoute();
  const {isEditMode} = (route.params as RouteParams) ?? {};
  const [isEditing, setIsEditing] = useState(isEditMode || false);
  const [localProfileData, setLocalProfileData] = useState({
    firstName: user?.first_name || user?.full_name?.split(' ')[0] || '',
    lastName: user?.last_name || user?.full_name?.split(' ')[1] || '',
    userName: user?.username || user?.full_name || '',
    location: user?.location || '',
    description: user?.bio || '',
    pronouns: user?.pronouns || '',
    storeName: user?.store_name || '',
    storeDescription: user?.store_description || '',
  });

  console.log('User ======>', JSON.stringify(user, null, 2));

  const handleProfileUpdate = (field: string, value: string) => {
    setLocalProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Upload image functions
  const handleImagePick = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 800,
      ...(Platform.OS === 'android' && {assetRepresentationMode: 'compatible'}),
    };

    try {
      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to pick image',
        });
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await uploadProfileImage(selectedImage);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
      });
    }
  };

  const uploadProfileImage = async (image: Asset) => {
    if (!image.uri) return;

    setAvatarUploading(true);
    setAvatarUri(image.uri);

    const fileName = image.fileName || `profile-${Date.now()}.jpg`;
    const fileType = image.type || 'image/jpeg';

    let filePath: string;
    let isTempFile = false;

    if (Platform.OS === 'android' && image.uri.startsWith('content://')) {
      try {
        filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.copyFile(image.uri, filePath);
        isTempFile = true;
      } catch {
        Toast.show({type: 'error', text1: 'Error', text2: 'Could not prepare image'});
        setAvatarUploading(false);
        return;
      }
    } else {
      filePath = image.originalPath?.startsWith('/')
        ? image.originalPath
        : image.uri.replace(/^file:\/\//, '');
    }

    const url = `${BASE_URL.replace(/\/$/, '')}${endpoints.profile.editProfile}`;
    const token = store.getState().auth.token;

    try {
      const response = await ReactNativeBlobUtil.fetch(
        'POST',
        url,
        {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          ...(token && {Authorization: `Bearer ${token}`}),
        },
        [{name: 'image', filename: fileName, type: fileType, data: ReactNativeBlobUtil.wrap(filePath)}],
      );

      const status = response.respInfo?.status ?? 0;
      const text = await Promise.resolve(response.text?.() ?? '{}');
      const data = (() => {
        try {
          return JSON.parse(typeof text === 'string' ? text : '{}');
        } catch {
          return {};
        }
      })();

      const avatarUrl =
        data?.data?.avatar ?? data?.data?.image ?? data?.avatar ?? data?.image;

      if (status >= 200 && status < 300 && avatarUrl) {
        dispatch(updateProfile({avatar: avatarUrl}));
        setAvatarUri(avatarUrl);
        setAvatarKey(k => k + 1);
        await dispatch(GetUserProfile());
        Toast.show({type: 'success', text1: 'Profile image uploaded successfully'});
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data?.message || `Upload failed (${status})`,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to upload',
      });
    } finally {
      if (isTempFile) RNFS.unlink(filePath).catch(() => {});
      setAvatarUploading(false);
    }
  };

  // Handle user type change
  const handleUserTypeChange = async (newUserType: string) => {
    if (newUserType === currentUserType || userTypeLoading) {
      return;
    }

    try {
      setUserTypeLoading(true);
      console.log('🔄 Updating user type to:', newUserType);
      
      const response = await updateUserType(newUserType as 'buyer' | 'seller' | 'rider');
      
      console.log('📡 Full API Response:', JSON.stringify(response.data, null, 2));
      
      // Check for both 'status' and 'success' fields to handle different API response formats
      if (response.data?.status === true || response.data?.success === true) {
        const updatedUserType = response.data?.data?.user_type || newUserType;
        setCurrentUserType(updatedUserType);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `User type updated to ${getUserTypeDisplayName(updatedUserType)}`,
        });
        console.log('✅ User type updated successfully:', response.data);
      } else {
        throw new Error(response.data?.message || 'Failed to update user type');
      }
    } catch (error: any) {
      console.error('❌ Error updating user type:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update user type',
      });
    } finally {
      setUserTypeLoading(false);
    }
  };

  // Get current language display name
  const getCurrentLanguageName = () => {
    switch (currentLanguage) {
      case 'en':
        return 'English';
      case 'sw':
        return 'Swahili';
      case 'zh':
        return '中文';
      case 'fr':
        return 'Français';
      case 'hi':
        return 'हिंदी';
      case 'pt':
        return 'Português';
      case 'es':
        return 'Español';
      default:
        return 'English';
    }
  };

  // Get display name for user type
  const getUserTypeDisplayName = (userType: string) => {
    switch (userType) {
      case 'buyer':
        return 'Buyer';
      case 'seller':
        return 'Seller';
      case 'rider':
        return 'Rider';
      default:
        return 'Buyer';
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={avatarUploading} transparent>
        <View style={avatarUploadingStyles.overlay}>
          <View style={avatarUploadingStyles.box}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <InterLight style={avatarUploadingStyles.text}>Uploading profile image...</InterLight>
          </View>
        </View>
      </Modal>
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
              key={`avatar-${avatarKey}-${profileData?.avatar || avatarUri || user?.avatar || 'default'}`}
              source={
                (() => {
                  const u =
                    profileData?.avatar || avatarUri || user?.avatar;
                  const uri = getAbsoluteAvatarUrl(u);
                  // Add cache-bust when avatarKey > 0 (after upload) to force reload
                  const finalUri = uri && avatarKey > 0
                    ? `${uri}${uri.includes('?') ? '&' : '?'}v=${avatarKey}`
                    : uri;
                  return finalUri ? {uri: finalUri} : images.profile;
                })()
              }
              resizeMode="cover"
              style={styles.profileImage}
            />
            {isEditing && (
              <TouchableOpacity
                style={styles.editIconContainer}
                // TODO image upload functionality
                onPress={() => handleImagePick()}>
                <PencilLine size={20} color={colors.themeColor} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.profileInfo}>
            <View>
              <View style={styles.profileNameContainer}>
                <InterBoldLabel style={styles.profileName}>
                  {user?.first_name || user?.last_name
                    ? [user?.first_name, user?.last_name].filter(Boolean).join(' ')
                    : user?.full_name || 'Alse'}
                </InterBoldLabel>
                <InterLight style={styles.profileUsername}>
                  @{user?.username || user?.email?.split('@')[0]}
                </InterLight>
              </View>
              <InterLight style={styles.profileLocation}>
                {user?.location || 'New Jersey, USA'}
              </InterLight>
            </View>
            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}>
                <PencilLine size={20} color={colors.themeColor} />
              </TouchableOpacity>
            )}
          </View>

          {isEditing && (
            <ProfileForm
              profileData={localProfileData}
              handleProfileUpdate={handleProfileUpdate}
              setIsEditing={() => {
                setIsEditing(false);
              }}
              onProfileUpdateSuccess={() => {
                dispatch(GetUserProfile());
              }}
            />
          )}
        </View>

        {!isEditing && (
          <View style={styles.settingsContainer}>
            {/* Social Activity */}
            <SettingsItem
              title={t('settings.socialActivity')}
              icon={Users}
              type="navigation"
              onPress={() => navigation.navigate('SocialActivity')}
            />

            {/* User Type */}
            <SettingsItem
              title="User Type"
              subtitle={getUserTypeDisplayName(currentUserType)}
              icon={Users}
              type="select"
              value={currentUserType}
              onValueChange={handleUserTypeChange}
              options={[
                { label: 'Buyer', value: 'buyer' },
                { label: 'Seller', value: 'seller' },
                { label: 'Rider', value: 'rider' },
              ]}
              loading={userTypeLoading}
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
            {/* Notification */}
            <SettingsItem
              title={t('settings.notification')}
              icon={Bell}
              type="navigation"
              onPress={() => {
                navigation.navigate('NotificationSettings');
              }}
            />

            {/* Separator */}
            <View style={styles.separator} />

            {/* Bidding & Auction Setting */}
            <SettingsItem
              title={t('settings.biddingAuctionSetting')}
              icon={Gavel}
              type="navigation"
              onPress={() => {
                navigation.navigate('BiddingAuctionSetting');
              }}
            />

            {/* Marketplace Activity */}
            <SettingsItem
              title={t('settings.marketplaceActivity')}
              icon={ShoppingCart}
              type="navigation"
              onPress={() => {
                navigation.navigate('MarketplaceActivity');
              }}
            />

            {/* Security & Privacy */}
            <SettingsItem
              title={t('settings.securityPrivacy')}
              icon={Lock}
              type="navigation"
              onPress={() => {
                navigation.navigate('SecurityPrivacy');
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Settings;
