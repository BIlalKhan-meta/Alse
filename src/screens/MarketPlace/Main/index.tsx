// // Home.tsx
// import React, {useEffect, useState} from 'react';
// import {View} from 'react-native';
// import Card from '../../../components/Card';
// import {useIsFocused, useNavigation} from '@react-navigation/native';
// import styles from './styles';
// import WishlistScreen from '../../../components/WishList';
// import SearchComponent from '../../../components/SearchComponent';
// import CustomButton from '../../../components/CustomButton';
// import {getAllShop} from '../../../api/shop';
// import {useSelector} from 'react-redux';
// import {selectUserProfile} from '../../../store/slices/authSlice';
// import Loader from '../../../components/Loader';
// import {Subscribe} from '../../../components/Subscribe';

// const Marketplace: React.FC = () => {
//   const navigation = useNavigation();
//   const user = useSelector(selectUserProfile);

//   const [shops, setShops] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const isFocused = useIsFocused();
//   const [filteredData, setFilteredData] = useState([]);

//   const handleSearch = (query: string) => {
//     let filtered = shops.filter((item: any) =>
//       item?.shop_name?.includes(query),
//     );
//     setFilteredData(filtered);
//   };

//   useEffect(() => {
//     getData();
//   }, [isFocused]);

//   useEffect(() => {
//     const filterOrders = () => {
//       let filtered = [...shops];
//       setFilteredData(filtered);
//     };

//     filterOrders();
//   }, [shops]);

//   const getData = async () => {
//     setLoading(true);

//     const res = await getAllShop();
//     setLoading(false);

//     setShops(res.data?.data?.data);
//   };

//   if (!user?.has_subscription && !user.is_child) {
//     return <Subscribe />;
//   }

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <View style={styles.container}>
//       <Card>
//         <SearchComponent onSearch={handleSearch} placeholder="Find shop" />
//         <WishlistScreen
//           wishlist={filteredData}
//           onPress={(shopId, userId) => {
//             if (user.id == userId) {
//               navigation.navigate('MyShop', {shopId});
//             } else {
//               navigation.navigate('Shop', {shopId});
//             }
//           }}
//         />
//         <CustomButton
//           style={styles.button}
//           onPress={() => navigation.navigate('AddStore')}>
//           Create Shop/My Shop
//         </CustomButton>
//       </Card>
//     </View>
//   );
// };

// export default Marketplace;

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../../store/slices/authSlice';
import {getAllShop} from '../../../api/shop';
import Loader from '../../../components/Loader';
import {Subscribe} from '../../../components/Subscribe';
import {MapPin, Search, ChevronRight} from 'lucide-react-native';
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

const Marketplace: React.FC = () => {
  const navigation: any = useNavigation();
  const user = useSelector(selectUserProfile);

  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // Typed products
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    getData();
    getProductData();
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
                  <View
                    style={[
                      styles.storeLogoContainer,
                      {backgroundColor: store.logo ? 'white' : '#FF6700'},
                    ]}>
                    <Image
                      source={
                        store.logo ? {uri: store.logo} : images.xiaomiLogo
                      }
                      style={styles.storeLogo}
                    />
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
    backgroundColor: '#FF6700', // Xiaomi orange color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  storeLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
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
});

export default Marketplace;
