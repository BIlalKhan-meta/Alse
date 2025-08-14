import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../../store/slices/authSlice';
import {getAllShop} from '../../../api/shop';
import {getOrders} from '../../../api/product';
import Loader from '../../../components/Loader';
import {Subscribe} from '../../../components/Subscribe';
import {MapPin, Search, ChevronRight, Plus, Package} from 'lucide-react-native';
import {images} from '../../../utils/images';
import {vh, vw} from '../../../constant';
import {getSimilarProducts} from '../../../api/product';

// Define Product type for API data
interface Product {
  id: number;
  name?: string;
  image?: string;
  price?: string | number;
  oldPrice?: string | number;
  description?: string;
  soldBy?: string;
}

interface Order {
  order_id: string;
  product: {
    title: string;
    images: Array<{path: string}>;
    banner: string;
  };
  total_amount: string;
  status: string;
  tracking_number?: string;
  carrier?: string;
  expected_delivery?: string;
}

const Marketplace: React.FC = () => {
  const navigation: any = useNavigation();
  const user = useSelector(selectUserProfile);

  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // Typed products
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // FAB state
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [fabAnimation] = useState(new Animated.Value(0));
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getData();
    getProductData();
    getOrdersData();
  }, [isFocused]);

  useEffect(() => {
    const filterOrders = () => {
      let filtered = [...shops];
      setFilteredData(filtered);
    };

    filterOrders();
  }, [shops]);

  const getData = async () => {
    setLoading(true);
    const res = await getAllShop();
    setLoading(false);
    setShops(res.data?.data?.data);
  };

  // New function to get recommended products
  const getProductData = async () => {
    try {
      // Use a demo product ID to get similar products as recommendation
      // Or you could use another API endpoint based on what's available
      const res = await getSimilarProducts(1); // Using ID 1 as example
      setProducts(res.data?.data || []);
      console.log('Recommended products:', res.data?.data);
    } catch (error) {
      console.log('Error fetching recommended products:', error);
      // No fallback dummy data, just leave products empty
      setProducts([]);
    }
  };

  // Function to get orders data
  const getOrdersData = async () => {
    try {
      const res = await getOrders();
      setOrders(res?.data?.data?.data || []);
      console.log('Orders data:', res?.data?.data?.data);
    } catch (error) {
      console.log('Error fetching orders:', error);
      setOrders([]);
    }
  };

  // FAB animation functions
  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;
    Animated.spring(fabAnimation, {
      toValue,
      useNativeDriver: true,
    }).start();
    setIsFabOpen(!isFabOpen);
  };

  const handleTrackOrder = () => {
    setIsFabOpen(false);
    Animated.spring(fabAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    // Navigate to tracking screen with orders data
    navigation.navigate('OrderTracking', {orders});
  };

  if (!user?.has_subscription && !user.is_child) {
    return <Subscribe />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* Header Section (includes title, icons, location, and search) */}
      <View style={styles.headerSection}>
        {/* Title and Icons Row */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alse</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Image source={images.bellIcon} style={styles.notificationicon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Image
                source={images.settingsIcon}
                style={styles.notificationicon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Image source={images.smsIcon} style={styles.notificationicon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Bar (inside header section) */}
        <View style={styles.locationBar}>
          <View style={styles.locationLeft}>
            {/* <Ionicons name="location-outline" size={20} color="white" /> */}
            <MapPin size={20} color="white" />
            <Text style={styles.locationText}>
              Street, #43 EII New jersey, New york
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Image source={images.shoppingBag} style={styles.shoppingBagIcon} />
          </TouchableOpacity>
        </View>

        {/* Search Bar (inside header section) */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TouchableOpacity
            style={styles.searchInput}
            onPress={() => navigation.navigate('Search')}>
            <Text style={styles.searchPlaceholder}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content area with white background */}
      <ScrollView
        style={styles.contentArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {/* Featured Stores Section */}

        {/* Featured Stores Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Featured stores</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}>
            {filteredData.length > 0 ? (
              filteredData.map((store, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.storeCard}
                  onPress={() => {
                    if (user.id === store.userId) {
                      (navigation as any).navigate('MyShop', {
                        shopId: store.id,
                      });
                    } else {
                      (navigation as any).navigate('Shop', {
                        shopId: store.id,
                      });
                    }
                  }}>
                  <View style={[styles.storeLogoContainer]}>
                    <Image source={images.shop11} style={styles.storeLogo} />
                  </View>
                  <Text style={styles.storeName} numberOfLines={1}>
                    {store.shop_name || 'Store'}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              // Placeholder when no stores are available
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No stores available</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Socially Recommended Products Section */}
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Socially recommended products
            </Text>
            <ChevronRight size={20} color="#333" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productCarouselContainer}>
            {products.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={styles.productCard}
                onPress={() =>
                  (navigation as any).navigate('ProductView', {
                    productId: product.id,
                  })
                }>
                <Image
                  source={product.image ? {uri: product.image} : images.avatar}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <View style={styles.productNameRow}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name || 'Product'}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.oldPrice}>
                        ${product.oldPrice ?? ''}
                      </Text>
                      <Text style={styles.price}>${product.price ?? ''}</Text>
                    </View>
                  </View>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description || 'No description available.'}
                  </Text>
                  <Text style={styles.soldBy}>
                    Sold by:{' '}
                    <Text style={styles.sellerName}>
                      {product.soldBy || 'Unknown'}
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* FAB Button */}
      <View style={styles.fabContainer}>
        {/* Options Menu */}
        {isFabOpen && (
          <View style={styles.fabOptions}>
            <TouchableOpacity
              style={styles.fabOption}
              onPress={handleTrackOrder}>
              <Package size={16} color="white" style={styles.fabOptionIcon} />
              <Text style={styles.fabOptionText}>
                Track Order {orders.length > 0 ? `(${orders.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main FAB Button */}
        <TouchableOpacity style={styles.fabButton} onPress={toggleFab}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Add Shop Button (moved to bottom of screen) */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => (navigation as any).navigate('AddStore')}>
        <Text style={styles.addButtonText}>Create Shop/My Shop</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerSection: {
    backgroundColor: '#00A19D',
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 100, // Add padding to ensure scrolling content doesn't get hidden behind button
  },
  notificationicon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  shoppingBagIcon: {
    width: vh * 2,
    height: vh * 2,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  iconButton: {
    marginLeft: 15,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    color: '#999',
  },
  contentArea: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
  },
  featuredSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  carouselContainer: {
    paddingRight: 16,
    paddingBottom: 10,
  },
  storeCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  storeLogoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    // backgroundColor: '#FF6700', // Xiaomi orange color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  storeLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 35,
    // tintColor: 'white', // Make the logo white
  },
  storeName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    maxWidth: 80,
  },

  // Socially Recommended Products styles
  recommendedSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 80, // Space for the button at bottom
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productCarouselContainer: {
    paddingBottom: 10,
  },
  productCard: {
    marginBottom: 15,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    width: vw * 90,
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    backgroundColor: '#121212',
  },
  productInfo: {
    padding: 12,
  },
  productNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 16,
  },
  soldBy: {
    fontSize: 12,
    color: '#888',
  },
  sellerName: {
    color: '#00A19D',
  },
  emptyContainer: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#00A19D',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // FAB Styles
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'flex-end',
  },
  fabOptions: {
    marginBottom: 10,
  },
  fabOption: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabOptionIcon: {
    marginRight: 8,
  },
  fabOptionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A19D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Marketplace;
