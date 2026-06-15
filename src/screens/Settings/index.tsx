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
  SafeAreaView,
} from 'react-native';
import {useSelector} from 'react-redux';
import {PencilLine, Shield} from 'lucide-react-native';
import InterLight from '../../components/Text/InterLight';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import InterRegular from '../../components/Text/InterRegular';
import InterMedium from '../../components/Text/InterMedium';
import Card from '../../components/Card';
import GeneralModal from '../../components/GeneralModal';
import {GetUserProfile, selectUserProfile, logout, LogoutUser} from '../../store/slices/authSlice';
import {selectProfileData} from '../../store/slices/settingsSlice';
import {images} from '../../utils/images';
import styles from './styles';
import {colors} from '../../utils/theme';
import {useAppDispatch} from '../../hooks/storeHooks';
import {fetchAllSettings, updateProfile} from '../../store/slices/settingsSlice';
import ProfileForm from './components/profileForm';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {useRoute} from '@react-navigation/native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {getAbsoluteAvatarUrl} from '../../utils/helpers';
import {BASE_URL} from '../../utils/baseurl';
import endpoints from '../../api/endpoints';
import store from '../../store';
import {vw} from '../../constant';

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

interface MenuIconRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  iconWidth?: number;
}

interface MenuHeaderProps {
  onBackPress: () => void;
}

const MenuHeader = ({onBackPress}: MenuHeaderProps) => (
  <View style={styles.menuHeader}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={onBackPress}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <Image source={images.backicon} style={styles.backIcon} />
    </TouchableOpacity>
    <InterBoldLabel style={styles.menuTitle}>Menu</InterBoldLabel>
  </View>
);

const MenuIconRow = ({icon, label, onPress, iconWidth}: MenuIconRowProps) => (
  <Card style={styles.cardContainer}>
    <TouchableOpacity onPress={onPress}>
      <View style={styles.cardContent5}>
        <View style={[styles.notifiCon, iconWidth ? {width: iconWidth} : null]}>
          {icon}
        </View>
        <InterMedium style={styles.cardHeading}>{label}</InterMedium>
      </View>
    </TouchableOpacity>
  </Card>
);

const Settings = ({navigation}: any) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const profileData = useSelector(selectProfileData);
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);
  const [avatarKey, setAvatarKey] = useState(0);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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

  useEffect(() => {
    dispatch(fetchAllSettings());
  }, [dispatch]);

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
  }, [
    user?.id,
    user?.first_name,
    user?.last_name,
    user?.username,
    user?.location,
    user?.location_name,
    user?.bio,
    user?.pronouns,
    user?.store_name,
    user?.store_description,
    user?.avatar,
  ]);

  const handleProfileUpdate = (field: string, value: string) => {
    setLocalProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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
        await uploadProfileImage(result.assets[0]);
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

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(logout());
    dispatch(LogoutUser());
  };

  const displayName =
    user?.first_name || user?.last_name
      ? [user?.first_name, user?.last_name].filter(Boolean).join(' ')
      : user?.full_name || 'Alse';

  const avatarSource = (() => {
    const u = profileData?.avatar || avatarUri || user?.avatar;
    const uri = getAbsoluteAvatarUrl(u);
    const finalUri =
      uri && avatarKey > 0
        ? `${uri}${uri.includes('?') ? '&' : '?'}v=${avatarKey}`
        : uri;
    return finalUri ? {uri: finalUri} : images.profile;
  })();

  const renderMenuItem = (label: string, onPress: () => void) => (
    <TouchableOpacity key={label} onPress={onPress}>
      <InterRegular style={styles.cardText}>{label}</InterRegular>
    </TouchableOpacity>
  );

  const handleBackPress = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <Modal visible={avatarUploading} transparent>
          <View style={avatarUploadingStyles.overlay}>
            <View style={avatarUploadingStyles.box}>
              <ActivityIndicator size="large" color={colors.themeColor} />
              <InterLight style={avatarUploadingStyles.text}>
                Uploading profile image...
              </InterLight>
            </View>
          </View>
        </Modal>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            <MenuHeader onBackPress={handleBackPress} />

            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  key={`avatar-${avatarKey}-${profileData?.avatar || avatarUri || user?.avatar || 'default'}`}
                  source={avatarSource}
                  resizeMode="cover"
                  style={styles.profileImage}
                />
                <TouchableOpacity
                  style={styles.editIconContainer}
                  onPress={handleImagePick}>
                  <PencilLine size={20} color={colors.themeColor} />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <View>
                  <View style={styles.profileNameContainer}>
                    <InterBoldLabel style={styles.profileName}>
                      {displayName}
                    </InterBoldLabel>
                    <InterLight style={styles.profileUsername}>
                      @{user?.username || user?.email?.split('@')[0]}
                    </InterLight>
                  </View>
                  <InterLight style={styles.profileLocation}>
                    {user?.location || user?.location_name || 'New Jersey, USA'}
                  </InterLight>
                </View>
              </View>

              <ProfileForm
                profileData={localProfileData}
                handleProfileUpdate={handleProfileUpdate}
                setIsEditing={() => setIsEditing(false)}
                onProfileUpdateSuccess={() => {
                  dispatch(GetUserProfile());
                }}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <>
      <Modal visible={avatarUploading} transparent>
        <View style={avatarUploadingStyles.overlay}>
          <View style={avatarUploadingStyles.box}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <InterLight style={avatarUploadingStyles.text}>
              Uploading profile image...
            </InterLight>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.menuContent}>
            <MenuHeader onBackPress={handleBackPress} />

            <Card style={styles.cardContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MyProfile')}>
                <View style={styles.contentCon}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={avatarSource}
                      style={styles.imageStyle}
                      resizeMode="cover"
                    />
                  </View>
                  <InterRegular style={styles.userName}>{displayName}</InterRegular>
                </View>
              </TouchableOpacity>
            </Card>

            <Card style={styles.cardContainer}>
              <View style={styles.cardContent2}>
                <InterMedium style={styles.cardHeading}>
                  - &nbsp;&nbsp;&nbsp;Social Interactivity
                </InterMedium>
                <View style={styles.btnCon}>
                  {renderMenuItem('Home', () => navigation.navigate('Home'))}
                  {renderMenuItem('Create Post', () =>
                    navigation.navigate('CreatePost'),
                  )}
                  {renderMenuItem('Drafts', () =>
                    navigation.navigate('PostDrafts'),
                  )}
                  {renderMenuItem('My Posts', () =>
                    navigation.navigate('MyPosts'),
                  )}
                  {renderMenuItem('Blocked Users', () =>
                    navigation.navigate('BlockedUsers'),
                  )}
                  {renderMenuItem('Chats and Groups', () =>
                    navigation.navigate('ChatScreen'),
                  )}
                  {renderMenuItem('Recordings', () =>
                    navigation.navigate('SavedChat'),
                  )}
                  {renderMenuItem('Scripts', () =>
                    navigation.navigate('SavedScripts'),
                  )}
                </View>
              </View>
            </Card>

            <Card style={styles.cardContainer}>
              <View style={styles.cardContent2}>
                <InterMedium style={styles.cardHeading}>
                  - &nbsp;&nbsp;&nbsp;Marketplace
                </InterMedium>
                <View style={styles.btnCon}>
                  {renderMenuItem('Shops', () =>
                    navigation.navigate('MarketPlaceNavigation'),
                  )}
                  {renderMenuItem('My Cart', () => navigation.navigate('Cart'))}
                  {renderMenuItem('Manage Bank Account Details', () =>
                    navigation.navigate('BankDetail'),
                  )}
                  {renderMenuItem('Payment Logs', () =>
                    navigation.navigate('MarketPlaceNavigation', {
                      screen: 'PaymentLogs',
                    }),
                  )}
                  {renderMenuItem('Order Logs', () =>
                    navigation.navigate('MyOrders'),
                  )}
                  {renderMenuItem('Offer Logs', () =>
                    navigation.navigate('MarketPlaceNavigation', {
                      screen: 'AuctionBidding',
                    }),
                  )}
                </View>
              </View>
            </Card>

            <Card style={styles.cardContainer}>
              <View style={styles.cardContent2}>
                <InterMedium style={styles.cardHeading}>
                  - &nbsp;&nbsp;&nbsp;Educational Library
                </InterMedium>
                <View style={styles.btnCon}>
                  {renderMenuItem('View Content', () =>
                    navigation.navigate('Blogs'),
                  )}
                  {renderMenuItem('Subscription Logs', () =>
                    navigation.navigate('SubscriptionLogs'),
                  )}
                  {renderMenuItem('Games', () => navigation.navigate('Videos'))}
                </View>
              </View>
            </Card>

            <MenuIconRow
              label="Security Settings"
              onPress={() => navigation.navigate('SecurityPrivacy')}
              icon={<Shield size={22} color={colors.themeColor} />}
            />

            <MenuIconRow
              label="Notification"
              onPress={() => navigation.navigate('NotificationSettings')}
              icon={
                <Image
                  source={images.notifi}
                  style={styles.iconImage}
                />
              }
            />

            <MenuIconRow
              label="Requests"
              onPress={() => navigation.navigate('RequestScreen')}
              icon={
                <Image
                  source={images.request}
                  style={styles.iconImage}
                />
              }
            />

            <MenuIconRow
              label="Subscription Plan"
              onPress={() => navigation.navigate('SubscriptionPlan')}
              icon={
                <Image
                  source={images.plan}
                  style={styles.iconImage}
                />
              }
              iconWidth={vw * 9}
            />

            <MenuIconRow
              label="Blogs"
              onPress={() => navigation.navigate('Blogs')}
              icon={
                <Image
                  source={images.blogs}
                  style={styles.iconImage}
                />
              }
              iconWidth={vw * 8}
            />

            <View style={styles.bottomCon}>
              <Card style={styles.cardContainer2}>
                <TouchableOpacity onPress={() => navigation.navigate('Saved')}>
                  <View style={styles.cardContent5}>
                    <View style={styles.notifiCon}>
                      <Image
                        source={images.save}
                        style={styles.iconImage}
                      />
                    </View>
                    <InterMedium style={styles.cardHeading}>
                      Saved Items
                    </InterMedium>
                  </View>
                </TouchableOpacity>
              </Card>

              <Card style={styles.cardContainer2}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ContactUs')}>
                  <View style={styles.cardContent5}>
                    <View style={[styles.notifiCon, {width: vw * 8}]}>
                      <Image
                        source={images.phone}
                        style={styles.iconImage}
                      />
                    </View>
                    <InterMedium style={styles.cardHeading}>Contact</InterMedium>
                  </View>
                </TouchableOpacity>
              </Card>
            </View>

            <View style={styles.bottomCon}>
              <Card style={styles.cardContainer2}>
                <TouchableOpacity onPress={() => navigation.navigate('AboutUs')}>
                  <View style={styles.cardContent5}>
                    <View style={[styles.notifiCon, {width: vw * 8}]}>
                      <Image
                        source={images.help}
                        style={styles.iconImage}
                      />
                    </View>
                    <InterMedium style={styles.cardHeading}>About Us</InterMedium>
                  </View>
                </TouchableOpacity>
              </Card>

              <Card style={styles.cardContainer2}>
                <TouchableOpacity onPress={() => setLogoutModalVisible(true)}>
                  <View style={styles.cardContent5}>
                    <View style={[styles.notifiCon, {width: vw * 8}]}>
                      <Image
                        source={images.logout}
                        style={styles.iconImage}
                      />
                    </View>
                    <InterMedium style={styles.cardHeading}>Log out</InterMedium>
                  </View>
                </TouchableOpacity>
              </Card>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <GeneralModal
        visible={logoutModalVisible}
        closeModal={() => setLogoutModalVisible(false)}
        icon={images.logout}
        title="Log out?"
        message="Are you sure you want to log out?"
        buttonText="Yes"
        onPress={confirmLogout}
        primaryBtn={false}
        secondaryBtn
        SecondaryText1="Yes"
        SecondaryText2="No"
      />
    </>
  );
};

export default Settings;
