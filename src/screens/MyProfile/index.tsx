import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import {BlurView} from '@react-native-community/blur';
import Clipboard from '@react-native-clipboard/clipboard';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {images} from '../../utils/images';
import {
  selectUserProfile,
  GetUserProfile,
  logout,
  LogoutUser,
} from '../../store/slices/authSlice';
import {
  selectProfileData,
  initializeProfile,
} from '../../store/slices/settingsSlice';
import {
  fetchUserPosts,
  selectUserPosts,
  selectPostsLoading,
  setPostsFromProfile,
} from '../../store/slices/profileSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import Loader from '../../components/Loader';
import GlobalHeader from '../../components/GlobalHeader';
import GeneralModal from '../../components/GeneralModal';
import {shareProfile} from '../../api/profile';
import Toast from 'react-native-toast-message';
import MediaModal from '../../components/MediaModal';
import {timeFormat} from '../../utils';

import styles from './styles';
import {colors} from '../../utils/theme';
import {useTranslation} from 'react-i18next';
import {vw, vh} from '../../constant';

interface PostItem {
  id: string;
  uri: string;
  playbackUrl?: string;
  title?: string;
  isVideo?: boolean;
  userName?: string;
  date?: string;
}

/** Grid cell that falls back to a local image when the remote URL 404s. */
const ProfilePostThumb: React.FC<{
  item: PostItem;
  onPress: (item: PostItem) => void;
}> = ({item, onPress}) => {
  const [failed, setFailed] = useState(!item.uri);
  const showVideo = !!item.isVideo && !!item.uri && !failed;

  return (
    <TouchableOpacity
      style={styles.postItem}
      activeOpacity={0.85}
      onPress={() => onPress(item)}>
      {showVideo ? (
        <Video
          source={{uri: item.uri}}
          style={styles.postImage}
          paused
          muted
          resizeMode="cover"
          posterResizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Image
          source={failed || !item.uri ? images.pro1 : {uri: item.uri}}
          style={styles.postImage}
          onError={() => setFailed(true)}
        />
      )}
      {item.isVideo ? (
        <View style={styles.videoBadge}>
          <Text style={styles.videoBadgeText}>VIDEO</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const MyProfile: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const profileData = useSelector(selectProfileData); // Get profile data from settings
  const isFocused = useIsFocused();

  const {t} = useTranslation();

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  // Redux selectors
  const posts = useSelector(selectUserPosts);
  const postsLoading = useSelector(selectPostsLoading);

  const [avatarError, setAvatarError] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccessModal, setShareSuccessModal] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [mediaModal, setMediaModal] = useState<{
    visible: boolean;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    userName: string;
    postTime: string;
  }>({
    visible: false,
    mediaUrl: '',
    mediaType: 'image',
    userName: '',
    postTime: '',
  });

  // Initialize profile data when user is available
  useEffect(() => {
    if (user && !profileData) {
      dispatch(initializeProfile(user));
    }
  }, [user, profileData, dispatch]);

  // Get the most up-to-date profile information
  const getProfileInfo = useCallback(() => {
    // Priority: profileData from settings > user from auth > defaults
    return {
      fullName:
        profileData?.firstName && profileData?.lastName
          ? `${profileData.firstName} ${profileData.lastName}`.trim()
          : user?.full_name || 'User',

      username:
        profileData?.userName ||
        user?.username ||
        user?.email?.split('@')[0] ||
        'user',

      location:
        profileData?.location || user?.location_name || user?.city || '',

      bio:
        profileData?.description ||
        user?.bio ||
        '✨ Add a short bio to tell people about yourself! 🌟: \n 🌍 Traveler \n 🎨 Artist \n 💻 Developer',

      avatar: profileData?.avatar || user?.avatar,
    };
  }, [profileData, user]);

  // Get current profile info
  const currentProfile = getProfileInfo();

  const openPostMedia = useCallback(
    (item: PostItem) => {
      const url = item.playbackUrl || item.uri;
      if (!url) {
        return;
      }
      setMediaModal({
        visible: true,
        mediaUrl: url,
        mediaType: item.isVideo ? 'video' : 'image',
        userName: item.userName || currentProfile.fullName || '',
        postTime: item.date ? timeFormat(item.date, true) : '',
      });
    },
    [currentProfile.fullName],
  );

  // Reset avatar error when avatar changes
  useEffect(() => {
    if (currentProfile.avatar) {
      setAvatarError(false);
    }
  }, [currentProfile.avatar]);

  // Statistics derived from actual data
  const stats = {
    posts: posts.length || user?.posts?.length || 0,
    followers: user?.followers?.length || user?.followers_count || 0,
    following: user?.following?.length || user?.following_count || 0,
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const seedPostsFromProfilePayload = useCallback(
    (profilePayload: any) => {
      const embeddedPosts = profilePayload?.posts;
      if (Array.isArray(embeddedPosts) && embeddedPosts.length > 0) {
        dispatch(setPostsFromProfile(embeddedPosts));
      }
    },
    [dispatch],
  );

  // Initial data fetch - only runs once when component mounts
  const fetchInitialData = useCallback(async () => {
    if (!user || !user.id) {
      try {
        const userProfile = await dispatch(GetUserProfile()).unwrap();

        // Initialize profile data in settings slice
        if (userProfile?.data) {
          dispatch(initializeProfile(userProfile.data));
          seedPostsFromProfilePayload(userProfile.data);
        }

        // Fetch posts using the user ID
        if (userProfile?.data?.id) {
          await dispatch(fetchUserPosts(userProfile.data.id.toString()));
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    } else {
      seedPostsFromProfilePayload(user);
      if (posts.length === 0 && !(user.posts?.length > 0)) {
        try {
          await dispatch(fetchUserPosts(user.id.toString()));
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      } else if (user.id) {
        // Refresh from dedicated posts endpoint in background
        try {
          await dispatch(fetchUserPosts(user.id.toString()));
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      }
    }
    setInitialLoad(true);
  }, [dispatch, user, posts.length, seedPostsFromProfilePayload]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Always refetch profile data on manual refresh
      const userProfile = await dispatch(GetUserProfile()).unwrap();

      // Update profile data in settings slice
      if (userProfile?.data) {
        dispatch(initializeProfile(userProfile.data));
        seedPostsFromProfilePayload(userProfile.data);
      }

      // Refetch posts
      if (userProfile?.data?.id) {
        await dispatch(fetchUserPosts(userProfile.data.id.toString()));
      } else if (user?.id) {
        await dispatch(fetchUserPosts(user.id.toString()));
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, user?.id, seedPostsFromProfilePayload]);

  // Fetch posts only when screen comes into focus (if user exists but posts are missing)
  const handleFocusRefetch = useCallback(async () => {
    if (user?.id && posts.length === 0 && !postsLoading && initialLoad) {
      try {
        seedPostsFromProfilePayload(user);
        if (!(user.posts?.length > 0)) {
          await dispatch(fetchUserPosts(user.id.toString()));
        }
      } catch (error) {
        console.error('Error fetching posts on focus:', error);
      }
    }
  }, [
    dispatch,
    user,
    posts.length,
    postsLoading,
    initialLoad,
    seedPostsFromProfilePayload,
  ]);

  // Effect for initial data load
  useEffect(() => {
    if (!initialLoad) {
      fetchInitialData();
    }
  }, [fetchInitialData, initialLoad]);

  // Effect for focus-based refetch (only posts if needed)
  useEffect(() => {
    if (isFocused && initialLoad) {
      handleFocusRefetch();
    }
  }, [isFocused, handleFocusRefetch, initialLoad]);

  // Navigation handlers

  const handleEditProfile = useCallback(() => {
    (navigation as any).navigate('Settings', {isEditMode: true});
  }, [navigation]);

  const handleShareProfile = useCallback(async () => {
    setShareLoading(true);
    try {
      const response = await shareProfile();
      const data = response?.data?.data ?? response?.data ?? response;
      const link =
        data?.link ?? data?.share_url ?? data?.url ?? data?.share_link ?? '';
      if (link) {
        Clipboard.setString(link);
        setShareSuccessModal(true);
      } else {
        Toast.show({
          type: 'error',
          text1: t('profileScr.share'),
          text2: 'No share link received',
        });
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Toast.show({
        type: 'error',
        text1: t('profileScr.share'),
        text2: 'Failed to get share link',
      });
    } finally {
      setShareLoading(false);
    }
  }, [t]);

  // Helper function to get display avatar
  const getDisplayAvatar = useCallback(() => {
    const avatar = currentProfile.avatar;

    if (avatarError || !avatar) {
      return images.defaultDp;
    }

    return {uri: avatar};
  }, [currentProfile.avatar, avatarError]);

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(logout());
    dispatch(LogoutUser());
  };

  // Show loader only on initial load, rather than focus
  if (!initialLoad && (postsLoading || !user)) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.themeColor]} // Android
            tintColor={colors.themeColor} // iOS
          />
        }>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={getDisplayAvatar()}
                style={styles.profileImage}
                onError={_ => setAvatarError(true)}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{currentProfile.fullName}</Text>
              <Text style={styles.userHandle}>@{currentProfile.username}</Text>
              {currentProfile.location ? (
                <Text style={styles.location}>{currentProfile.location}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => setLogoutModalVisible(true)}
              style={{marginTop: 10}}>
              <View style={styles.cardContent5}>
                <View style={[styles.notifiCon, {width: vw * 8}]}>
                  <Image source={images.logout} style={styles.imageStyle} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{currentProfile.bio}</Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.posts}</Text>
            <Text style={styles.statLabel}>{t('profileScr.posts')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.followers}</Text>
            <Text style={styles.statLabel}>{t('profileScr.followers')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.following}</Text>
            <Text style={styles.statLabel}>{t('profileScr.following')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>{t('profileScr.edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareProfile}>
            <Text style={styles.shareButtonText}>{t('profileScr.share')}</Text>
          </TouchableOpacity>
        </View>

        {/* Posts grid — plain Views (not FlatList) so height works inside ScrollView on iOS */}
        <View style={styles.postsSection}>
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {postsLoading
                  ? t('profileScr.loading')
                  : t('profileScr.noPosts')}
              </Text>
            </View>
          ) : (
            <View style={styles.postsGrid}>
              {posts.map((item: PostItem) => (
                <ProfilePostThumb
                  key={item.id}
                  item={item}
                  onPress={openPostMedia}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Share loading overlay */}
      <Modal visible={shareLoading} transparent animationType="fade">
        <BlurView
          style={shareModalStyles.blur}
          blurType="dark"
          blurAmount={8}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.6)"
        />
        <View style={shareModalStyles.overlay}>
          <View style={shareModalStyles.loaderCard}>
            <Loader size="large" />
            <Text style={shareModalStyles.loaderText}>
              {t('profileScr.getShareLink')}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Profile link copied success modal */}
      <GeneralModal
        visible={shareSuccessModal}
        closeModal={() => setShareSuccessModal(false)}
        icon={images.checkedIcon}
        title={t('profileScr.share')}
        message={t('profileScr.linkCopied')}
        buttonText={t('ok')}
        onPress={() => setShareSuccessModal(false)}
        primaryBtn={true}
      />

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

      <MediaModal
        visible={mediaModal.visible}
        onClose={() =>
          setMediaModal(prev => ({
            ...prev,
            visible: false,
            mediaUrl: '',
          }))
        }
        mediaUrl={mediaModal.mediaUrl}
        mediaType={mediaModal.mediaType}
        userName={mediaModal.userName}
        postTime={mediaModal.postTime}
      />
    </View>
  );
};

const shareModalStyles = StyleSheet.create({
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    width: vw * 70,
    minHeight: vh * 18,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: vh * 3,
    paddingHorizontal: vw * 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }
      : {elevation: 8}),
  },
  loaderText: {
    marginTop: vh * 2,
    fontSize: 15,
    color: colors.inputText,
  },
});

export default MyProfile;
