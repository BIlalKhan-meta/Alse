import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {images} from '../../utils/images';
import {selectUserProfile, GetUserProfile} from '../../store/slices/authSlice';
import {
  selectProfileData,
  initializeProfile,
} from '../../store/slices/settingsSlice';
import {
  fetchUserPosts,
  selectUserPosts,
  selectPostsLoading,
  selectPostsError,
} from '../../store/slices/profileSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import Loader from '../../components/Loader';
import GlobalHeader from '../../components/GlobalHeader';

import styles from './styles';
import {colors} from '../../utils/theme';
import {useTranslation} from 'react-i18next';

interface PostItem {
  id: string;
  uri: string;
  title?: string;
}

const MyProfile: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const profileData = useSelector(selectProfileData); // Get profile data from settings
  const isFocused = useIsFocused();

  const {t} = useTranslation();

  // Local state
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  // Redux selectors
  const posts = useSelector(selectUserPosts);
  const postsLoading = useSelector(selectPostsLoading);
  const postsError = useSelector(selectPostsError);

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

  // Statistics derived from actual data
  const stats = {
    posts: posts.length,
    followers: user?.followers?.length || user?.followers_count || 0,
    following: user?.following?.length || user?.following_count || 0,
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Initial data fetch - only runs once when component mounts
  const fetchInitialData = useCallback(async () => {
    if (!user || !user.id) {
      try {
        const userProfile = await dispatch(GetUserProfile()).unwrap();

        // Initialize profile data in settings slice
        if (userProfile?.data) {
          dispatch(initializeProfile(userProfile.data));
        }

        // Fetch posts using the user ID
        if (userProfile?.data?.id) {
          await dispatch(fetchUserPosts(userProfile.data.id.toString()));
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    } else if (user.id && posts.length === 0) {
      // If we have user but no posts, fetch posts only
      try {
        await dispatch(fetchUserPosts(user.id.toString()));
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
    setInitialLoad(true);
  }, [dispatch, user, posts.length]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Always refetch profile data on manual refresh
      const userProfile = await dispatch(GetUserProfile()).unwrap();

      // Update profile data in settings slice
      if (userProfile?.data) {
        dispatch(initializeProfile(userProfile.data));
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
  }, [dispatch, user?.id]);

  // Fetch posts only when screen comes into focus (if user exists but posts are missing)
  const handleFocusRefetch = useCallback(async () => {
    if (user?.id && posts.length === 0 && !postsLoading && initialLoad) {
      try {
        await dispatch(fetchUserPosts(user.id.toString()));
      } catch (error) {
        console.error('Error fetching posts on focus:', error);
      }
    }
  }, [dispatch, user?.id, posts.length, postsLoading, initialLoad]);

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
  const handleChatNavigation = useCallback(() => {
    setFabMenuVisible(false);
    // navigation.navigate('ChatScreen');
    console.log('Navigate to ChatScreen');
  }, []);

  const handleSavedNavigation = useCallback(() => {
    setFabMenuVisible(false);
    // navigation.navigate('Saved');
    console.log('Navigate to Saved');
  }, []);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('Settings', {isEditMode: true});
  }, [navigation]);

  const handleShareProfile = useCallback(() => {
    // Implement share functionality
    console.log('Share Profile');
  }, []);

  // Helper function to get display avatar
  const getDisplayAvatar = useCallback(() => {
    const avatar = currentProfile.avatar;

    if (
      !avatar ||
      avatar ===
        'http://aabcndbkji.us-east-1.awsapprunner.com/storage/default.png'
    ) {
      return images.profile;
    }

    return {uri: avatar};
  }, [currentProfile.avatar]);

  const renderPostItem = useCallback(
    ({item}: {item: PostItem}) => (
      <TouchableOpacity style={styles.postItem}>
        <Image
          source={{uri: item.uri}}
          style={styles.postImage}
          defaultSource={images.pro1}
        />
      </TouchableOpacity>
    ),
    [],
  );

  const keyExtractor = useCallback((item: PostItem) => item.id, []);

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
              <Image source={getDisplayAvatar()} style={styles.profileImage} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{currentProfile.fullName}</Text>
              <Text style={styles.userHandle}>@{currentProfile.username}</Text>
              {currentProfile.location ? (
                <Text style={styles.location}>{currentProfile.location}</Text>
              ) : null}
            </View>
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

        {/* Posts Grid Section */}
        <View style={styles.postsSection}>
          <FlatList
            data={posts}
            numColumns={2}
            renderItem={renderPostItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            columnWrapperStyle={styles.postsRow}
            contentContainerStyle={styles.postsContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {postsLoading && posts.length !== 0
                    ? t('profileScr.loading')
                    : t('profileScr.noPosts')}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default MyProfile;
