import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
  RefreshControl,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {images} from '../../utils/images';
import {selectUserProfile, GetUserProfile} from '../../store/slices/authSlice';
import {
  fetchUserPosts,
  selectUserPosts,
  selectPostsLoading,
  selectPostsError,
} from '../../store/slices/profileSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import Loader from '../../components/Loader';
import GlobalHeader from '../../components/GlobalHeader';
import {MessageCircle, Bookmark} from 'lucide-react-native';

import styles from './styles';
import {colors} from '../../utils/theme';

interface PostItem {
  id: string;
  uri: string;
  title?: string;
}

const MyProfile: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const isFocused = useIsFocused();

  // Local state
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  // Redux selectors
  const posts = useSelector(selectUserPosts);
  const postsLoading = useSelector(selectPostsLoading);
  const postsError = useSelector(selectPostsError);

  // Statistics derived from actual data
  const stats = {
    posts: posts.length,
    followers: user?.followers_count ?? 0, // Use actual data or fallback
    following: user?.following_count ?? 0, // Use actual data or fallback
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
    // navigation.navigate('EditProfile');
    console.log('Navigate to EditProfile');
  }, []);

  const handleShareProfile = useCallback(() => {
    // Implement share functionality
    console.log('Share Profile');
  }, []);

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
              <Image
                source={
                  user?.avatar &&
                  user?.avatar !==
                    'http://aabcndbkji.us-east-1.awsapprunner.com/storage/default.png'
                    ? {uri: user.avatar}
                    : images.user2 // TODO replace with avatar placeholder
                }
                style={styles.profileImage}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
              <Text style={styles.userHandle}>
                @{user?.username || user?.email?.split('@')[0]}
              </Text>
              <Text style={styles.location}>{user?.city}</Text>
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.bioText}>
              {user?.bio ||
                '✨ Add a short bio to tell people about yourself! 🌟: \n 🌍 Traveler \n 🎨 Artist \n 💻 Developer'}
            </Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareProfile}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
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
                    ? 'Loading Posts..'
                    : 'No posts yet.'}
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
