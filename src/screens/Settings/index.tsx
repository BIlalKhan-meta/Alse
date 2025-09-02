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
import {GetUserProfile, selectUserProfile} from '../../store/slices/authSlice';
import {images} from '../../utils/images';
import styles from './styles';
import {colors} from '../../utils/theme';
import SettingsItem from './components/settingsItem';
import {useAppDispatch} from '../../hooks/storeHooks';
import {
  fetchAllSettings,
  updateUserProfile,
  initializeProfile,
  selectProfileData,
  selectProfileUpdateLoading,
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
import {useRoute} from '@react-navigation/native';

interface RouteParams {
  isEditMode?: boolean;
}

const Settings = ({navigation}: any) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const profileData = useSelector(selectProfileData);
  const profileUpdateLoading = useSelector(selectProfileUpdateLoading);
  const {currentLanguage, t} = useAppTranslation();
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);

  useEffect(() => {
    dispatch(fetchAllSettings());
  }, [dispatch]);

  // Profile editing state
  const route = useRoute();
  const {isEditMode} = (route.params as RouteParams) ?? {};
  const [isEditing, setIsEditing] = useState(isEditMode || false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  console.log('User ======>', JSON.stringify(user, null, 2));

  // Initialize profile data from user when component mounts
  useEffect(() => {
    if (user && !profileData) {
      // ✅ Instead of mapping from auth.user, fetch full profile
      dispatch(GetUserProfile());
    }
  }, [user, profileData, dispatch]);

  useEffect(() => {
    dispatch(fetchAllSettings());
  }, [dispatch]);

  // Handle profile field updates
  const handleProfileUpdate = (field: string, value: string) => {
    dispatch(updateProfile({[field]: value}));
  };

  // Handle image selection
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
        setSelectedImage(selectedImage);

        // Immediately update the local avatar for preview
        dispatch(updateProfile({avatar: selectedImage.uri}));
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
  // Handle profile save (both image and form data)
  const handleProfileSave = async () => {
    if (!profileData) return;

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

      const response = await editProfile(formData);

      if (response.data) {
        // If your API returns the new avatar URL
        const newAvatarUrl = response.data.avatar;

        setAvatarUri(newAvatarUrl || image.uri); // fallback to local uri if API doesn't return URL

        Toast.show({
          type: 'success',
          text1: 'Profile image uploaded successfully',
      // Add image if selected
      if (selectedImage) {
        formData.append('avatar', {
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || `profile-${Date.now()}.jpg`,
        });
      }

      // Add profile fields
      if (profileData.description) {
        formData.append('bio', profileData.description);
      }
      if (profileData.location) {
        formData.append('location_name', profileData.location);
      }
      if (profileData.firstName) {
        formData.append('first_name', profileData.firstName);
      }
      if (profileData.lastName) {
        formData.append('last_name', profileData.lastName);
      }
      if (profileData.userName) {
        formData.append('username', profileData.userName);
      }
      if (profileData.pronouns) {
        formData.append('pronouns', profileData.pronouns);
      }

      // Dispatch the update
      const result = await dispatch(
        updateUserProfile({
          formData,
          profileFields: profileData,
        }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully!',
      });

      // Reset selected image and exit editing mode
      setSelectedImage(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile',
      });
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

  // Get display avatar URL
  const getDisplayAvatar = () => {
    if (profileData?.avatar) {
      return profileData.avatar;
    }
    return user?.avatar || null;
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
                getDisplayAvatar() ? {uri: getDisplayAvatar()} : images.profile
              }
              resizeMode="cover"
              style={styles.profileImage}
            />
            {isEditing && (
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={handleImagePick}>
                <PencilLine size={20} color={colors.themeColor} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.profileInfo}>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <InterBoldLabel style={styles.profileName}>
                  {profileData?.firstName && profileData?.lastName
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : user?.full_name || 'Alse'}
                </InterBoldLabel>
                <InterLight style={styles.profileUsername}>
                  _{user?.username || user?.email?.split('@')[0]}
                  {user?.email?.split('@')[0]}
                  _
                  {profileData?.userName ||
                    user?.username ||
                    user?.email?.split('@')[0]}
                </InterLight>
              </View>
              <InterLight style={styles.profileLocation}>
                {profileData?.location ||
                  user?.location_name ||
                  'New Jersey, USA'}
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

          {isEditing && profileData && (
            <ProfileForm
              profileData={profileData}
              handleProfileUpdate={handleProfileUpdate}
              onSave={handleProfileSave}
              loading={profileUpdateLoading}
              onCancel={() => {
                setIsEditing(false);
                setSelectedImage(null);
                // Reset profile data to original user data
                dispatch(initializeProfile(user));
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
