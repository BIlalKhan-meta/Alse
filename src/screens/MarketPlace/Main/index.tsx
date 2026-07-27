import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  RefreshControl,
  TextInput,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../../store/slices/authSlice';
import {getAllShop} from '../../../api/shop';
import {
  getOrders,
  getAllProducts,
  getRecommendedProducts,
  getCategories,
} from '../../../api/product';
import {checkIsSeller} from '../../../api/shop';
import searchAPI from '../../../api/search';
import Loader from '../../../components/Loader';
import ShopProductListRow from '../../../components/ShopProductListRow';
import {Subscribe} from '../../../components/Subscribe';
import {
  MapPin,
  Search,
  ChevronRight,
  Plus,
  Package,
  Bike,
  Gavel,
  DollarSign,
  Store,
  LayoutGrid,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Utensils,
  Baby,
  Tag,
  Watch,
  Car,
} from 'lucide-react-native';
import {images} from '../../../utils/images';
import {vh, vw} from '../../../constant';
import {useTranslation} from 'react-i18next';
import {useLocation} from '../../../hooks/useLocation';
import Toast from 'react-native-toast-message';

type Product = Record<string, any>;

const formatCategoryLabel = (raw?: string) => {
  if (!raw) return 'Category';
  const cleaned = String(raw).replace(/_/g, ' ').trim();
  const autoKey = cleaned.match(/^categories title (\d+)/i);
  if (autoKey) return `Category ${autoKey[1]}`;
  return cleaned.length > 22 ? `${cleaned.slice(0, 20)}…` : cleaned;
};

const getCategoryIcon = (label?: string) => {
  const l = (label || '').toLowerCase();
  if (/fashion|cloth|wear|apparel|outfit/.test(l)) return Shirt;
  if (/electr|phone|gadget|tech|laptop/.test(l)) return Smartphone;
  if (/home|furniture|decor|kitchen/.test(l)) return Home;
  if (/beauty|cosmetic|makeup|skin/.test(l)) return Sparkles;
  if (/sport|fitness|gym/.test(l)) return Dumbbell;
  if (/book|educat|learn/.test(l)) return BookOpen;
  if (/food|grocery|restaurant|drink/.test(l)) return Utensils;
  if (/toy|kid|baby|child/.test(l)) return Baby;
  if (/watch|jewel|access/.test(l)) return Watch;
  if (/auto|car|vehicle/.test(l)) return Car;
  if (/shop|store|seller/.test(l)) return Store;
  return Tag;
};

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

const FEATURED_STORES_LIMIT = 4;

function extractList(payload: any): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }
  return [];
}

function shopAvatarSource(avatar?: string | null) {
  if (
    avatar &&
    typeof avatar === 'string' &&
    (avatar.startsWith('http://') || avatar.startsWith('https://'))
  ) {
    return {uri: avatar};
  }
  return images.shop11;
}

const Marketplace: React.FC = () => {
  const navigation: any = useNavigation();
  const user = useSelector(selectUserProfile);

  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // Typed products
  const [allProductsList, setAllProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [allProductsLoading, setAllProductsLoading] = useState(false);
  const [sellerCheckLoading, setSellerCheckLoading] = useState(false);
  const isFocused = useIsFocused();
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // FAB state
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [fabAnimation] = useState(new Animated.Value(0));
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [nearbyShops, setNearbyShops] = useState<any[]>([]);
  const [marketQuery, setMarketQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    products: any[];
    shops: any[];
  } | null>(null);
  const [searching, setSearching] = useState(false);

  const {t} = useTranslation();
  const {
    location,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
  } = useLocation();

  // Handle location with toast
  const handleLocationPress = async () => {
    try {
      await getCurrentLocation();
      if (location?.address) {
        Toast.show({
          type: 'success',
          text1: 'Location Updated',
          text2: location.address,
        });
      }
    } catch (error) {
      console.log('Location error in handleLocationPress:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: locationError || 'Failed to get your location',
      });
    }
  };

  const getProductData = React.useCallback(async () => {
    setProductsLoading(true);
    try {
      const recommendedRes = await getRecommendedProducts({per_page: 20});
      const recommended = extractList(recommendedRes?.data?.data);
      if (recommended.length > 0) {
        setProducts(recommended);
        return;
      }

      const allProductsRes = await getAllProducts({per_page: 20, sort: 'newest'});
      setProducts(extractList(allProductsRes?.data?.data));
    } catch (error) {
      console.log('Error fetching products from all APIs:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const getAllMarketplaceProducts = React.useCallback(
    async (categoryId?: number | null) => {
      setAllProductsLoading(true);
      try {
        const params: any = {per_page: 50};
        if (categoryId) {
          params.category_id = categoryId;
        }
        const res = await getAllProducts(params);
        setAllProductsList(extractList(res?.data?.data));
      } catch (error) {
        console.log('Error fetching marketplace products list:', error);
        setAllProductsList([]);
      } finally {
        setAllProductsLoading(false);
      }
    },
    [],
  );

  const loadCategories = React.useCallback(async () => {
    try {
      const res = await getCategories();
      const list = extractList(res?.data?.data);
      setCategories(list.length ? list : Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) {
      setCategories([]);
    }
  }, []);

  // Function to get orders data
  const getOrdersData = async () => {
    try {
      const res = await getOrders();
      setOrders(res?.data?.data?.data || []);
    } catch (error) {
      console.log('Error fetching orders:', error);
      setOrders([]);
    }
  };

  useEffect(() => {
    getData();
    getProductData();
    getAllMarketplaceProducts(selectedCategoryId);
    getOrdersData();
    loadCategories();
  }, [isFocused, getProductData, getAllMarketplaceProducts, loadCategories]);

  useEffect(() => {
    getAllMarketplaceProducts(selectedCategoryId);
  }, [selectedCategoryId, getAllMarketplaceProducts]);

  // Separate useEffect for location to prevent infinite loops
  useEffect(() => {
    if (isFocused) {
      getCurrentLocation();
    }
  }, [isFocused, getCurrentLocation]);

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      getAllShop({
        lat: location.latitude,
        lng: location.longitude,
        radius: 50,
        per_page: 10,
      })
        .then(res => setNearbyShops(extractList(res?.data?.data)))
        .catch(() => setNearbyShops([]));
    }
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    setFilteredData([...shops]);
  }, [shops]);

  const getData = async () => {
    try {
      setLoading(true);
      let featuredRes;
      try {
        featuredRes = await getAllShop({featured: 1, per_page: 12});
      } catch {
        featuredRes = null;
      }
      let featured = extractList(featuredRes?.data?.data);
      if (featured.length === 0) {
        const allRes = await getAllShop({per_page: 12});
        featured = extractList(allRes?.data?.data);
      }
      setShops(featured);

      if (location?.latitude && location?.longitude) {
        try {
          const nearbyRes = await getAllShop({
            lat: location.latitude,
            lng: location.longitude,
            radius: 50,
            per_page: 10,
          });
          setNearbyShops(extractList(nearbyRes?.data?.data));
        } catch {
          setNearbyShops([]);
        }
      }
    } catch (error) {
      console.log('Error fetching shops:', error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const runMarketSearch = async (query: string) => {
    const q = query.trim();
    setMarketQuery(query);
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const [productsRes, shopsRes] = await Promise.all([
        searchAPI.searchProducts({search: q, per_page: 20}),
        searchAPI.searchShops({search: q}),
      ]);
      setSearchResults({
        products: extractList(productsRes?.data?.data),
        shops: extractList(shopsRes?.data?.data),
      });
    } catch (e) {
      setSearchResults({products: [], shops: []});
    } finally {
      setSearching(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getData(),
        getProductData(),
        getAllMarketplaceProducts(selectedCategoryId),
        getOrdersData(),
        getCurrentLocation(),
        loadCategories(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    getProductData,
    getAllMarketplaceProducts,
    getCurrentLocation,
    loadCategories,
    selectedCategoryId,
  ]);

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

  const handleBecomeRider = () => {
    setIsFabOpen(false);
    Animated.spring(fabAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    // Navigate to become rider screen
    navigation.navigate('BecomeRider');
  };

  const handleFinancials = () => {
    setIsFabOpen(false);
    Animated.spring(fabAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    // Navigate to financials screen
    navigation.navigate('Financials');
  };

  const handleBecomeSeller = async () => {
    setIsFabOpen(false);
    Animated.spring(fabAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    try {
      setSellerCheckLoading(true);

      // Check if user is already a seller
      const response = await checkIsSeller();

      if (response.data?.data?.data && response.data.data.data.length > 0) {
        // User is already a seller, navigate to existing seller dashboard
        console.log('User is already a seller, navigating to ExistingSeller');
        navigation.navigate('ExistingSeller');
      } else {
        // User is not a seller, navigate to become seller form
        console.log('User is not a seller, navigating to AddStore flow');
        navigation.navigate('AddStore', {title: 'Create your store'});
      }
    } catch (error) {
      console.log('Error checking seller status:', error);
      // On error, default to become seller form
      navigation.navigate('AddStore', {title: 'Create your store'});
    } finally {
      setSellerCheckLoading(false);
    }
  };

  if (!user?.has_subscription && !user.is_child) {
    return <Subscribe />;
  }

  // Show loader only if both shops and products are loading and no products are available
  if (loading && productsLoading && products.length === 0) {
    return <Loader />;
  }

  // Add error boundary for location errors
  if (locationError && !location) {
    console.log('Location error:', locationError);
  }

  return (
    <View style={styles.container}>
      {/* Header Section (includes title, icons, location, and search) */}
      <View style={styles.headerSection}>
        {/* Title and Icons Row */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alse</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}>
              <Image source={images.bellIcon} style={styles.notificationicon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Settings')}>
              <Image
                source={images.settingsIcon}
                style={styles.notificationicon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('ChatScreen')}>
              <Image source={images.smsIcon} style={styles.notificationicon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Bar (inside header section) */}
        <View style={styles.locationBar}>
          <TouchableOpacity
            style={styles.locationLeft}
            onPress={handleLocationPress}
            disabled={locationLoading}>
            {/* <Ionicons name="location-outline" size={20} color="white" /> */}
            <MapPin size={20} color="white" />
            <Text style={styles.locationText}>
              {locationLoading
                ? 'Getting location...'
                : location?.address
                ? location.address
                : locationError
                ? 'Tap to retry location'
                : 'Tap to get location'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Image source={images.shoppingBag} style={styles.shoppingBagIcon} />
          </TouchableOpacity>
        </View>

        {/* Search Bar (inside header section) */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search') || 'Search products & shops'}
            placeholderTextColor="#999"
            value={marketQuery}
            onChangeText={runMarketSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Content area with white background */}
      <ScrollView
        style={styles.contentArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {searchResults ? (
          <View style={{marginBottom: 16}}>
            <Text style={styles.featuredTitle}>
              {searching ? 'Searching…' : 'Search results'}
            </Text>
            {(searchResults.shops || []).slice(0, 6).map((store: any) => (
              <TouchableOpacity
                key={`s-${store.id}`}
                style={{paddingVertical: 10}}
                onPress={() =>
                  navigation.navigate('Shop', {shopId: store.id})
                }>
                <Text style={{fontWeight: '600', color: '#222'}}>
                  {store.shop_name || store.name}
                </Text>
                <Text style={{color: '#666', fontSize: 12}}>Store</Text>
              </TouchableOpacity>
            ))}
            {(searchResults.products || []).slice(0, 10).map((product: any) => (
              <TouchableOpacity
                key={`p-${product.id}`}
                style={{paddingVertical: 10}}
                onPress={() =>
                  navigation.navigate('ProductView', {productId: product.id})
                }>
                <Text style={{fontWeight: '600', color: '#222'}}>
                  {product.title || product.name}
                </Text>
                <Text style={{color: '#666', fontSize: 12}}>Product</Text>
              </TouchableOpacity>
            ))}
            {!searching &&
            searchResults.products.length === 0 &&
            searchResults.shops.length === 0 ? (
              <Text style={{color: '#888'}}>No matches</Text>
            ) : null}
          </View>
        ) : null}

        {categories.length > 0 ? (
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategoryId == null && styles.categoryChipActive,
                ]}
                activeOpacity={0.85}
                onPress={() => setSelectedCategoryId(null)}>
                <View
                  style={[
                    styles.categoryIconWrap,
                    selectedCategoryId == null && styles.categoryIconWrapActive,
                  ]}>
                  <LayoutGrid
                    size={15}
                    color={selectedCategoryId == null ? '#fff' : '#0C959B'}
                    strokeWidth={2.2}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategoryId == null && styles.categoryChipTextActive,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((cat: any) => {
                const id = cat.id;
                const rawLabel = cat.title || cat.name;
                const label = formatCategoryLabel(rawLabel);
                const active = selectedCategoryId === id;
                const Icon = getCategoryIcon(rawLabel);
                return (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.categoryChip,
                      active && styles.categoryChipActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedCategoryId(id)}>
                    <View
                      style={[
                        styles.categoryIconWrap,
                        active && styles.categoryIconWrapActive,
                      ]}>
                      <Icon
                        size={15}
                        color={active ? '#fff' : '#0C959B'}
                        strokeWidth={2.2}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                      numberOfLines={1}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {nearbyShops.length > 0 ? (
          <View style={styles.featuredSection}>
            <Text style={styles.featuredTitle}>Nearby stores</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}>
              {nearbyShops.map((store, index) => (
                <TouchableOpacity
                  key={store.id ?? `nearby-${index}`}
                  style={styles.storeCard}
                  onPress={() =>
                    navigation.navigate('Shop', {shopId: store.id})
                  }>
                  <View style={styles.storeLogoWrapper}>
                    <View style={styles.storeLogoContainer}>
                      <Image
                        source={shopAvatarSource(store.avatar)}
                        style={styles.storeLogo}
                        resizeMode="cover"
                        defaultSource={images.shop11}
                      />
                    </View>
                  </View>
                  <Text style={styles.storeName} numberOfLines={1}>
                    {store.shop_name || store.name}
                  </Text>
                  {store.distance_km != null ? (
                    <Text style={{fontSize: 11, color: '#666'}}>
                      {store.distance_km} km
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Featured Stores Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>
            {t('marketplace.featuredStores')}
          </Text>
          {loading ? (
            <View style={styles.storesLoadingContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContainer}>
                {[1, 2, 3, 4].map((_, index) => (
                  <View key={index} style={styles.storeCardSkeleton}>
                    <View style={styles.storeLogoSkeleton} />
                    <View style={styles.storeNameSkeleton} />
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}>
              {filteredData.length > 0 ? (
                filteredData
                  .slice(0, FEATURED_STORES_LIMIT)
                  .map((store, index) => (
                    <TouchableOpacity
                      key={store.id ?? `store-${index}`}
                      style={styles.storeCard}
                      onPress={() => {
                        const isOwnShop =
                          String(user?.id) === String(store.user_id);
                        if (isOwnShop) {
                          (navigation as any).navigate('MyShop', {
                            shopId: store.id,
                          });
                        } else {
                          (navigation as any).navigate('Shop', {
                            shopId: store.id,
                          });
                        }
                      }}>
                      <View style={styles.storeLogoWrapper}>
                        <View style={styles.storeLogoContainer}>
                          <Image
                            source={shopAvatarSource(store.avatar)}
                            style={styles.storeLogo}
                            resizeMode="cover"
                            defaultSource={images.shop11}
                          />
                        </View>
                        <View style={styles.sellerBadge}>
                          <Text style={styles.sellerBadgeText}>SELLER</Text>
                        </View>
                      </View>
                      <Text style={styles.storeName} numberOfLines={1}>
                        {store.shop_name || 'Store'}
                      </Text>
                    </TouchableOpacity>
                  ))
              ) : (
                // Placeholder when no stores are available
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {t('marketplace.noStores')}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Socially Recommended Products Section */}
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {t('marketplace.recommendedProds')}
            </Text>
            {/* <ChevronRight size={20} color="#333" /> */}
          </View>

          {productsLoading ? (
            <View style={styles.productsLoadingContainer}>
              <Loader />
            </View>
          ) : products.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productCarouselContainer}>
              {products.map((product, index) => (
                <TouchableOpacity
                  key={`product-${product.id}-${index}`}
                  style={styles.productCard}
                  onPress={() => {
                    console.log(
                      'Main MarketPlace: Navigating to ProductView with product:',
                      product,
                    );
                    (navigation as any).navigate('ProductView', {
                      productId: product.id,
                    });
                  }}>
                  <View style={styles.productImageContainer}>
                    <Image
                      source={
                        product.image &&
                        typeof product.image === 'string' &&
                        product.image.startsWith('http')
                          ? {uri: product.image}
                          : product.image || images.avatar
                      }
                      style={styles.productImage}
                      resizeMode="cover"
                      defaultSource={images.avatar}
                      onError={() => {
                        console.log(
                          'Image failed to load for product:',
                          product.id,
                        );
                      }}
                    />
                    {/* Discount Badge */}
                    {product.discount && product.discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                          -{product.discount}%
                        </Text>
                      </View>
                    )}
                    {/* New Product Badge */}
                    {product.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                    {/* Featured Badge */}
                    {product.isFeatured && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>FEATURED</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <View style={styles.productNameRow}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.name || 'Product'}
                      </Text>
                      <View style={styles.priceContainer}>
                        {product.oldPrice &&
                          product.oldPrice !== product.price && (
                            <Text style={styles.oldPrice}>
                              ${product.oldPrice}
                            </Text>
                          )}
                        <Text style={styles.price}>${product.price}</Text>
                      </View>
                    </View>
                    <Text style={styles.productDescription} numberOfLines={2}>
                      {product.description || 'No description available.'}
                    </Text>
                    {/* Rating and Reviews */}
                    {product.rating && (
                      <View style={styles.ratingContainer}>
                        <View style={styles.starsContainer}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Text
                              key={star}
                              style={[
                                styles.star,
                                star <= product.rating!
                                  ? styles.starFilled
                                  : styles.starEmpty,
                              ]}>
                              ★
                            </Text>
                          ))}
                        </View>
                        {product.reviews && (
                          <Text style={styles.reviewsText}>
                            ({product.reviews} reviews)
                          </Text>
                        )}
                      </View>
                    )}
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
          ) : null}
        </View>

        {(allProductsLoading || allProductsList.length > 0) && (
          <View style={styles.allProductsSection}>
            {allProductsLoading ? (
              <View style={styles.productsLoadingContainer}>
                <Loader />
              </View>
            ) : (
              allProductsList.map((product, index) =>
                product?.id != null ? (
                  <ShopProductListRow
                    key={product.id}
                    product={product}
                    onPress={() =>
                      (navigation as any).navigate('ProductView', {
                        productId: product.id,
                      })
                    }
                  />
                ) : (
                  <ShopProductListRow key={index} product={product} />
                ),
              )
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB Button */}
      <View style={styles.fabContainer}>
        {/* Options Menu */}
        {isFabOpen && (
          <View style={styles.fabOptions}>
            {/* <TouchableOpacity
              style={styles.fabOption}
              onPress={handleBecomeRider}>
              <Bike size={16} color="white" style={styles.fabOptionIcon} />
              <Text style={styles.fabOptionText}>Become a Rider</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.fabOption}
              onPress={handleTrackOrder}>
              <Package size={16} color="white" style={styles.fabOptionIcon} />
              <Text style={styles.fabOptionText}>
                Track Order
                {/* {orders.length > 0 ? `(${orders.length})` : ''} */}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabOption}
              onPress={() => navigation.navigate('AuctionBidding')}>
              <Gavel size={16} color="white" style={styles.fabOptionIcon} />
              <Text style={styles.fabOptionText}>Auctions & Bidding</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabOption}
              onPress={() =>
                navigation.navigate('AuctionDetail', {auctionId: 1})
              }>
              <Gavel size={16} color="white" style={styles.fabOptionIcon} />
              <Text style={styles.fabOptionText}>View Sample Auction</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.fabOption}
              onPress={handleFinancials}>
              <DollarSign
                size={16}
                color="white"
                style={styles.fabOptionIcon}
              />
              <Text style={styles.fabOptionText}>Financials</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.fabOption}
              onPress={handleBecomeSeller}
              disabled={sellerCheckLoading}>
              <Store size={16} color="white" style={styles.fabOptionIcon} />
              <Text style={styles.fabOptionText}>
                {sellerCheckLoading ? 'Checking...' : 'Become a Seller'}
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
      {/* <TouchableOpacity
        style={styles.addButton}
        onPress={() => (navigation as any).navigate('AddStore')}>
        <Text style={styles.addButtonText}>Create Shop/My Shop</Text>
      </TouchableOpacity> */}
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
    marginTop: vh * 4,
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
    color: '#333',
    fontSize: 14,
    paddingVertical: 0,
  },
  searchPlaceholder: {
    color: '#999',
  },
  categoriesSection: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EEF0',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 7,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4ECEE',
    shadowColor: '#0A6B6F',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: '#0C959B',
    borderColor: '#0C959B',
    shadowColor: '#0C959B',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(12, 149, 155, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryIconWrapActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#1F2D2E',
    fontWeight: '600',
    letterSpacing: 0.1,
    maxWidth: 130,
  },
  categoryChipTextActive: {
    color: '#fff',
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
  storeLogoWrapper: {
    width: 70,
    height: 70,
    marginBottom: 8,
    alignItems: 'center',
  },
  storeLogoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storeLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 35,
  },
  sellerBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#00897B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  sellerBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
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
  },
  allProductsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: 'white',
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
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#121212',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    zIndex: 1,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    zIndex: 1,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    zIndex: 1,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    fontSize: 16,
  },
  starFilled: {
    color: '#FFD700', // Gold color for filled stars
  },
  starEmpty: {
    color: '#888', // Grey color for empty stars
  },
  reviewsText: {
    fontSize: 12,
    color: '#888',
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
    bottom: 20,
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
  productsLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  storesLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  storeCardSkeleton: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  storeLogoSkeleton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  storeNameSkeleton: {
    width: 80,
    height: 18,
    backgroundColor: '#e0e0e0',
  },
});

export default Marketplace;
