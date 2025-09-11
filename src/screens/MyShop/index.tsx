import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {getProductByShop, shopDetail} from '../../api/shop';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import {
  MessageCircle,
  HelpCircle,
  Mail,
  Share2,
  ChevronDown,
} from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';

const filterItems = [
  {label: 'Category', value: 'category'},
  {label: 'Price', value: 'price'},
  {label: 'Seller Location', value: 'location'},
  {label: 'Rating', value: 'rating'},
];

const MyShop: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  const shopId = (route?.params as any)?.shopId;

  const [shopDetails, setShopDetails] = useState<any>({});
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [_filter, _setFilter] = useState('');
  const [bannerError, setBannerError] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide the default header
    });
  }, [navigation]);

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shopDetail(shopId);
      const res2 = await getProductByShop(shopId);

      console.log('Shop details response:', res?.data?.data);
      console.log('Banner URL:', res?.data?.data?.banner);
      console.log('Avatar URL:', res?.data?.data?.avatar);

      setShopDetails(res?.data?.data || {});
      setShopProducts(res2?.data?.data?.data || []);
      setBannerError(false); // Reset banner error state
      setBannerLoaded(false); // Reset banner loaded state
      setAvatarError(false); // Reset avatar error state
      setAvatarLoaded(false); // Reset avatar loaded state
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    getData();
  }, [isFocused, getData]);

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>Alse</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={images.bellIcon} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={images.settingsIcon} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={images.smsIcon} style={styles.headerIcon} />
          </TouchableOpacity>
        </View> */}
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Store Profile Section */}
        <View style={styles.storeProfileSection}>
          {/* Banner */}
          <View style={styles.bannerContainer}>
            <Image
              source={
                shopDetails?.banner && !bannerError
                  ? {uri: shopDetails.banner}
                  : images.shop11
              }
              style={styles.bannerImage}
              onError={() => {
                if (shopDetails?.banner && !bannerLoaded) {
                  console.log(
                    'Banner image failed to load:',
                    shopDetails?.banner,
                  );
                  setBannerError(true);
                }
              }}
              onLoad={() => {
                if (shopDetails?.banner) {
                  console.log(
                    'Banner image loaded successfully:',
                    shopDetails?.banner,
                  );
                  setBannerLoaded(true);
                }
              }}
            />

            {/* Store Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={
                  shopDetails?.avatar &&
                  shopDetails?.avatar !==
                    'http://aabcndbkji.us-east-1.awsapprunner.com/storage/default.png' &&
                  !avatarError
                    ? {uri: shopDetails.avatar}
                    : images.shop11
                }
                style={styles.avatarImage}
                onError={() => {
                  if (shopDetails?.avatar && !avatarLoaded) {
                    console.log(
                      'Avatar image failed to load:',
                      shopDetails?.avatar,
                    );
                    setAvatarError(true);
                  }
                }}
                onLoad={() => {
                  if (shopDetails?.avatar) {
                    console.log(
                      'Avatar image loaded successfully:',
                      shopDetails?.avatar,
                    );
                    setAvatarLoaded(true);
                  }
                }}
              />
            </View>
          </View>

          {/* Store Info */}
          <View style={styles.storeInfoContainer}>
            <View style={styles.storeInfoLeft}>
              <Text style={styles.storeName}>
                {shopDetails?.shop_name || 'Razor'}
              </Text>
              <Text style={styles.storeCategory}>Tech, Gadgets</Text>
            </View>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={() =>
                (navigation as any).navigate('AddProduct', {shopId})
              }>
              <Text style={styles.addProductButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {/* Store Stats */}
          <View style={styles.storeStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{shopDetails?.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{shopProducts.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Share2 size={16} color="#333" />
              <Text style={styles.shareText}>Share store on Alse Feed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color={colors.themeColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <HelpCircle size={24} color={colors.themeColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Mail size={24} color={colors.themeColor} />
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          {filterItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.filterButton}>
              <Text style={styles.filterButtonText}>{item.label}</Text>
              <ChevronDown size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>Recently Listed Products</Text>

          {shopProducts.length > 0 ? (
            shopProducts.map((product, index) => (
              <View key={index} style={styles.productCard}>
                <Image
                  source={
                    product?.images?.length > 0
                      ? {uri: product.images[0].path}
                      : product?.banner
                      ? {uri: product.banner}
                      : images.pro1
                  }
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product?.title || 'Razer BlackShark...'}
                  </Text>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    Lorem ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem ipsum
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.bestDeal}>Best Deal '25</Text>
                    <Text style={styles.likedBy}>Liked by Aaron Byrnes</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          )}
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtonsContainer}>
          <CustomButton
            style={styles.addProductButton}
            onPress={() =>
              (navigation as any).navigate('AddProduct', {shopId})
            }>
            Add Product
          </CustomButton>
          <CustomButton
            style={styles.ordersButton}
            txtstyle={{color: colors.themeColor}}
            onPress={() =>
              (navigation as any).navigate('MyOrders', {
                MyOrder: true,
                shopId: shopId,
              })
            }>
            Orders
          </CustomButton>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.themeColor,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  scrollView: {
    flex: 1,
  },
  storeProfileSection: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  bannerContainer: {
    position: 'relative',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -30,
    left: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'white',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  storeInfoLeft: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#666',
  },
  addProductButton: {
    backgroundColor: colors.themeColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  storeStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statItem: {
    marginRight: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  shareText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  productsSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bestDeal: {
    fontSize: 12,
    color: colors.themeColor,
    fontWeight: 'bold',
  },
  likedBy: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  ordersButton: {
    minWidth: '45%',
    backgroundColor: 'white',
  },
});

export default MyShop;
