import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {images} from '../../../utils/images';
import {
  selectUserProfile,
  GetUserProfile,
} from '../../../store/slices/authSlice';
import {
  fetchUserPosts,
  selectUserPosts,
  selectPostsLoading,
  selectPostsError,
} from '../../../store/slices/profileSlice';
import {useAppDispatch} from '../../../hooks/storeHooks';
import Loader from '../../../components/Loader';
import GlobalHeader from '../../../components/GlobalHeader';
import {
  MessageCircle,
  Bookmark,
} from 'lucide-react-native';

import styles from './styles';

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

  const [loading, setLoading] = useState(false);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  
  // Redux selectors
  const posts = useSelector(selectUserPosts);
  const postsLoading = useSelector(selectPostsLoading);
  const postsError = useSelector(selectPostsError);

  // Mock data for statistics (replace with actual API calls)
  const [stats, setStats] = useState({
    posts: 21,
    followers: 582,
    following: 321,
  });



  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);



  const getData = async () => {
    setLoading(true);
    try {
      // Get user profile data
      const userProfile = await dispatch(GetUserProfile()).unwrap();
      
      // Get user's posts using their ID
      if (userProfile?.data?.id) {
        await dispatch(fetchUserPosts(userProfile.data.id.toString()));
      }

      // Update stats with actual data (replace with actual API calls)
      setStats({
        posts: posts.length || 21, // Use actual posts count
        followers: 582, // Replace with actual followers count
        following: 321, // Replace with actual following count
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getData();
    }
  }, [isFocused]);

  // Update stats when posts are loaded
  useEffect(() => {
    if (posts.length >= 0) {
      setStats(prevStats => ({
        ...prevStats,
        posts: posts.length,
      }));
    }
  }, [posts]);

  const renderPostItem = ({item}: {item: PostItem}) => (
    <TouchableOpacity style={styles.postItem}>
      <Image
        source={{uri: item.uri}}
        style={styles.postImage}
        defaultSource={images.pro1}
      />
    </TouchableOpacity>
  );



  if (loading || postsLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
                    : images.user2
                }
                style={styles.profileImage}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name || 'Alse'}</Text>
              <Text style={styles.userHandle}>
                @{user?.username || user?.email?.split('@')[0] || 'alsealse'}
              </Text>
              <Text style={styles.location}>{user?.city || 'Jersey, NY'}</Text>
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.bioText}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
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
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid Section */}
        <View style={styles.postsSection}>
          <FlatList
            data={posts}
            numColumns={2}
            renderItem={renderPostItem}
            keyExtractor={(item: PostItem) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            columnWrapperStyle={styles.postsRow}
            contentContainerStyle={styles.postsContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {postsError ? `Error: ${postsError}` : 'No posts found'}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setFabMenuVisible(!fabMenuVisible)}>
        <MessageCircle size={24} color="#fff" />
      </TouchableOpacity>

      {/* FAB Menu */}
      <Modal
        visible={fabMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFabMenuVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFabMenuVisible(false)}>
          <View style={styles.fabMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setFabMenuVisible(false);
                // navigation.navigate('ChatScreen');
                console.log('Navigate to ChatScreen');
              }}>
              <MessageCircle size={20} color="#0C959B" />
              <Text style={styles.menuItemText}>Chats</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setFabMenuVisible(false);
                // navigation.navigate('Saved');
                console.log('Navigate to Saved');
              }}>
              <Bookmark size={20} color="#0C959B" />
              <Text style={styles.menuItemText}>Saved Items</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MyProfile;
