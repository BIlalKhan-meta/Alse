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
import {useAppDispatch} from '../../../hooks/storeHooks';
import {getSavedItems} from '../../../api/menu';
import {getOrders} from '../../../api/product';
import Loader from '../../../components/Loader';
import GlobalHeader from '../../../components/GlobalHeader';
import {
  Search,
  MoreVertical,
  MessageCircle,
  Bookmark,
} from 'lucide-react-native';
import styles from './styles';

interface OrderItem {
  order_id: string;
  product: {
    title: string;
    images: Array<{path: string}>;
    banner: string;
  };
  total_amount: string;
  status: string;
}

const MyProfile: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>([]);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);

  // Mock data for statistics (replace with actual API calls)
  const [stats, setStats] = useState({
    savedItems: 12,
    followingStores: 26,
    reviewsGiven: 16,
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
      await dispatch(GetUserProfile()).unwrap();

      // Get saved items
      const savedRes = await getSavedItems();

      // Get orders
      const ordersRes = await getOrders();
      setOrders(ordersRes?.data?.data?.data || []);
      console.log('ordersRes==========>', ordersRes);

      // Update stats with actual data
      setStats({
        savedItems: savedRes?.data?.data?.length || 12,
        followingStores: 26, // Replace with actual API call
        reviewsGiven: 16, // Replace with actual API call
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

  useEffect(() => {
    // Filter orders based on search query
    const filtered = orders.filter(
      order =>
        order?.product?.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order?.order_id?.toString().includes(searchQuery),
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const renderOrderItem = ({item}: {item: OrderItem}) => (
    <View style={styles.orderItem}>
      <Image
        source={
          item?.product?.images?.length > 0
            ? {uri: item.product.images[0].path}
            : item?.product?.banner
            ? {uri: item.product.banner}
            : images.pro1
        }
        style={styles.orderImage}
      />
      <View style={styles.orderInfo}>
        <Text style={styles.orderTitle} numberOfLines={1}>
          {item?.product?.title || 'BlackShark_'} #{item?.order_id}
        </Text>
        <Text style={styles.orderPrice}>${item?.total_amount || '430'}</Text>
      </View>
      <View style={styles.orderStatus}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item?.status || 'Shipped'}</Text>
        </View>
        <Text style={styles.orderCategory}>Leopards</Text>
      </View>
    </View>
  );

  if (loading) {
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
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={styles.locationSection}>
              <Text style={styles.address} numberOfLines={1}>
                {user?.address ||
                  'Hilton Business Park, Besides Amazon Tower New Jersey, New York, USA'}
              </Text>
              <Text style={styles.location}>{user?.city || 'Jersey, NY'}</Text>
            </View>
            <View style={styles.addressActions}>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MoreVertical size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.savedItems}</Text>
            <Text style={styles.statLabel}>Save Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.followingStores}</Text>
            <Text style={styles.statLabel}>Following Stores</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.reviewsGiven}</Text>
            <Text style={styles.statLabel}>Reviews Given</Text>
          </View>
        </View>

        {/* My Orders Section */}
        <View style={styles.ordersSection}>
          <Text style={styles.ordersTitle}>My Orders</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {/* Orders List */}
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No orders found</Text>
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
                navigation.navigate('ChatScreen');
              }}>
              <MessageCircle size={20} color="#0C959B" />
              <Text style={styles.menuItemText}>Chats</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setFabMenuVisible(false);
                navigation.navigate('Saved');
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
