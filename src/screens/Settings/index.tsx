import React, {useEffect, useState} from 'react';
import {View, ScrollView, TouchableOpacity, Image} from 'react-native';
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
import {selectUserProfile} from '../../store/slices/authSlice';
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
import {editProfile} from '../../api/profile';
import {updateUserType} from '../../api/settings';
import {useRoute} from '@react-navigation/native';

interface RouteParams {
  isEditMode?: boolean;
}

const Settings = ({navigation}: any) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const profileData = useSelector(selectProfileData);
  const {currentLanguage, t} = useAppTranslation();
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);
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
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
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
    if (!image.uri) {
      return;
    }

    try {
      const formData = new FormData();

      // Append the image file
      formData.append('avatar', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `profile-${Date.now()}.jpg`,
      } as any);

      // Log the FormData contents for debugging
      console.log('Image FormData contents:');
      console.log('Avatar URI:', image.uri);
      console.log('Avatar type:', image.type);
      console.log('Avatar name:', image.fileName);

      // Update Redux store with the new avatar
      const newAvatarUrl = image.uri;
      dispatch(updateProfile({avatar: newAvatarUrl}));
      setAvatarUri(newAvatarUrl);

      // Call the API to upload the image
      const response = await editProfile(formData);

      if (response.data) {
        // Update with the server response if available
        const serverAvatarUrl = response.data.avatar;
        if (serverAvatarUrl) {
          dispatch(updateProfile({avatar: serverAvatarUrl}));
          setAvatarUri(serverAvatarUrl);
        }

        Toast.show({
          type: 'success',
          text1: 'Profile image uploaded successfully',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to upload profile image',
      });
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
              source={
                profileData?.avatar || avatarUri
                  ? {uri: profileData?.avatar || avatarUri}
                  : images.profile
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
                  {user?.full_name || 'Alse'}
                </InterBoldLabel>
                <InterLight style={styles.profileUsername}>
                  _{user?.username || user?.email?.split('@')[0]}
                  {user?.email?.split('@')[0]}
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
