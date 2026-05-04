import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {images} from '../../../utils/images';
import {colors} from '../../../utils/theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getProductByShop, shopDetail} from '../../../api/shop';
import Loader from '../../../components/Loader';
import FilterSelectModal from '../../../components/FilterSelectModal';
import ReportBlockModal from '../../../components/ReportBlockModal';
import GeneralModal from '../../../components/GeneralModal';
import {createChat, reportPost} from '../../../api/home';
import {getMessage, Toast} from '../../../utils/helpers';
import {MessageCircle, HelpCircle, Mail, Share2, X} from 'lucide-react-native';
import GlobalHeader from '../../../components/GlobalHeader';


const filterCategories = [
  {label: 'All categories', value: 'all'},
  {label: 'Tech & Gadgets', value: 'tech'},
  {label: 'Fashion & Apparel', value: 'fashion'},
  {label: 'Home & Garden', value: 'home'},
  {label: 'Sports & Outdoors', value: 'sports'},
  {label: 'Books & Media', value: 'books'},
  {label: 'Electronics', value: 'electronics'},
  {label: 'Health & Beauty', value: 'health'},
  {label: 'Toys & Games', value: 'toys'},
  {label: 'Automotive', value: 'automotive'},
  {label: 'Food & Beverages', value: 'food'},
  {label: 'Office Supplies', value: 'office'},
  {label: 'Other', value: 'other'},
];

const filterPrices = [
  {label: 'Any price', value: 'any'},
  {label: 'Under $25', value: 'under_25'},
  {label: '$25 – $50', value: '25_50'},
  {label: '$50 – $100', value: '50_100'},
  {label: '$100 – $250', value: '100_250'},
  {label: '$250 – $500', value: '250_500'},
  {label: 'Over $500', value: 'over_500'},
];

const filterLocations = [
  {label: 'Any location', value: 'any'},
  {label: 'Local', value: 'local'},
  {label: 'National', value: 'national'},
  {label: 'International', value: 'international'},
  {label: 'Same city', value: 'same_city'},
  {label: 'Same state', value: 'same_state'},
  {label: 'Worldwide', value: 'worldwide'},
];

const filterRatings = [
  {label: 'Any rating', value: 'any'},
  {label: '5 stars', value: '5'},
  {label: '4+ stars', value: '4'},
  {label: '3+ stars', value: '3'},
  {label: '2+ stars', value: '2'},
  {label: '1+ stars', value: '1'},
];

const filterConfig = [
  {key: 'category', placeholder: 'Categories', items: filterCategories},
  {key: 'price', placeholder: 'Prices', items: filterPrices},
  {key: 'location', placeholder: 'Locations', items: filterLocations},
  {key: 'rating', placeholder: 'Ratings', items: filterRatings},
];

function isRemoteImageUrl(url?: string | null): boolean {
  return (
    typeof url === 'string' &&
    (url.startsWith('http://') || url.startsWith('https://'))
  );
}

const Shop: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const shopId = (route?.params as any)?.shopId;

  const [modalVisible, setModalVisible] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [shopDetails, setShopDetails] = useState<any>({});
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [_filter, _setFilter] = useState('');
  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null,
  });
  const [reportLoader, setReportLoader] = useState(false);
  const [storeInfoVisible, setStoreInfoVisible] = useState(false);
  const [chatLoader, setChatLoader] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    category: 'all',
    price: 'any',
    location: 'any',
    rating: 'any',
  });
  const [bannerError, setBannerError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const sellerId = shopDetails?.user_id ?? shopDetails?.user?.id;
  const sellerName =
    shopDetails?.user?.full_name ??
    shopDetails?.user?.name ??
    shopDetails?.shop_name ??
    'Store';
  const sellerPhone =
    shopDetails?.user?.phone_number ?? shopDetails?.phone_number ?? '';
  const sellerEmail =
    shopDetails?.user?.email ?? shopDetails?.email ?? '';

  const bannerSource = useMemo(() => {
    if (isRemoteImageUrl(shopDetails?.banner) && !bannerError) {
      return {uri: shopDetails.banner as string};
    }
    return images.shopCover;
  }, [shopDetails?.banner, bannerError]);

  const avatarSource = useMemo(() => {
    if (isRemoteImageUrl(shopDetails?.avatar) && !avatarError) {
      return {uri: shopDetails.avatar as string};
    }
    return images.shop11;
  }, [shopDetails?.avatar, avatarError]);

  const handleChatPress = useCallback(async () => {
    if (!sellerId) {
      Toast.error('Unable to start chat with this store.');
      return;
    }
    setChatLoader(true);
    try {
      const res = await createChat({user_id: sellerId});
      setChatLoader(false);
      (navigation as any).navigate('ChatOngoing', {
        id: res?.data?.data?.id,
        receiverId: sellerId,
        name: sellerName,
        phoneNumber: sellerPhone,
        user: {
          id: sellerId,
          avatar: shopDetails?.avatar ?? shopDetails?.image,
        },
      });
    } catch (err) {
      setChatLoader(false);
      Toast.error(getMessage((err as any)?.message));
    }
  }, [
    sellerId,
    sellerName,
    sellerPhone,
    navigation,
    shopDetails?.avatar,
    shopDetails?.image,
  ]);

  const handleStoreInfoPress = useCallback(() => {
    setStoreInfoVisible(true);
  }, []);

  const handleMailPress = useCallback(() => {
    const email = sellerEmail?.trim();
    if (email) {
      Linking.openURL(`mailto:${email}`).catch(() => {
        Toast.error('Could not open mail app.');
      });
    } else {
      Toast.error('No email provided from store owner');
    }
  }, [sellerEmail]);

  const handleReportPress = () => {
    setModalVisible(false);
    setReportVisible({...reportVisible, visibility: true});
  };

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

      setShopDetails(res?.data?.data || {});
      setShopProducts(res2?.data?.data?.data || []);
      setBannerError(false);
      setAvatarError(false);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleReport = async () => {
    setReportLoader(true);
    const data = {
      reportable_type: 'Shop',
      reportable_id: shopId,
      reason: `${shopId} Store Report`,
    };

    let formData = new FormData();
    Object.entries(data).forEach(item => {
      formData.append(item[0], item[1]);
    });

    try {
      const res = await reportPost(formData);
      if (res?.data) {
        setReportVisible({
          visibility: false,
          id: null,
        });
        setReportLoader(false);
        setReportSuccess(true);
        navigation.goBack();
      }
    } catch (err) {
      setReportLoader(false);
      setReportVisible({
        visibility: false,
        id: null,
      });
      Toast.error(getMessage((err as any)?.message));
      console.log('Error reporting shop:', err);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const options = [
    {
      text: 'Report Shop',
      onPress: () => {
        handleReportPress();
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.headerContainer}>
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
              source={bannerSource}
              style={styles.bannerImage}
              resizeMode="cover"
              onError={() => setBannerError(true)}
            />

            {/* Store Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={avatarSource}
                style={styles.avatarImage}
                resizeMode="cover"
                onError={() => setAvatarError(true)}
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
            {/* <TouchableOpacity
              style={styles.addProductsButton}
              onPress={() =>
                (navigation as any).navigate('AddProduct', {shopId: shopId})
              }>
              <Text style={styles.addProductsButtonText}>Add Products</Text>
            </TouchableOpacity> */}
          </View>

          {/* Store Stats */}
          <View style={styles.storeStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>124</Text>
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
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleChatPress}
            disabled={chatLoader}>
            {chatLoader ? (
              <ActivityIndicator size="small" color={colors.themeColor} />
            ) : (
              <MessageCircle size={24} color={colors.themeColor} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStoreInfoPress}>
            <HelpCircle size={24} color={colors.themeColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMailPress}>
            <Mail size={24} color={colors.themeColor} />
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          {filterConfig.map(filter => {
            const selectedItem = filter.items.find(
              i => i.value === filterValues[filter.key],
            ) || filter.items[0];
            return (
              <TouchableOpacity
                key={filter.key}
                style={styles.filterItem}
                onPress={() => setFilterModalOpen(filter.key)}>
                <Text style={styles.filterDropdownText} numberOfLines={1}>
                  {selectedItem?.label || filter.placeholder}
                </Text>
                <Text style={styles.filterDropdownArrow}>▼</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filter Modals */}
        {filterConfig.map(filter => (
          <FilterSelectModal
            key={filter.key}
            visible={filterModalOpen === filter.key}
            onClose={() => setFilterModalOpen(null)}
            title={`Select ${filter.placeholder.toLowerCase()}`}
            items={filter.items}
            selectedValue={filterValues[filter.key] ?? filter.items[0]?.value}
            onSelect={value =>
              setFilterValues(prev => ({...prev, [filter.key]: value}))
            }
          />
        ))}

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>Recently Listed Products</Text>

          {shopProducts.length > 0 ? (
            shopProducts.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={styles.productCard}
                onPress={() => {
                  console.log(
                    'Navigating to ProductView with product:',
                    product,
                  );
                  (navigation as any).navigate('ProductView', {
                    productId: product.id,
                  });
                }}>
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
                    {product?.description ||
                      'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum'}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.bestDeal}>Best Deal '25</Text>
                    <Text style={styles.likedBy}>Liked by Aaron Byrnes</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <ReportBlockModal
        isVisible={modalVisible}
        options={options}
        onClose={() => setModalVisible(false)}
        style={{}}
      />
      <GeneralModal
        visible={reportVisible.visibility}
        closeModal={() =>
          setReportVisible({
            visibility: false,
            id: null,
          })
        }
        icon={images.qmark}
        title="Report Shop"
        message="Are you sure you want to report this shop?"
        buttonText="Yes"
        onPress={handleReport}
        primaryBtn={false}
        secondaryBtn={true}
        SecondaryText1="Yes"
        SecondaryText2="No"
        loading={reportLoader}
      />
      <GeneralModal
        visible={ReportSuccess}
        closeModal={() => setReportSuccess(false)}
        icon={images.checkedIcon}
        title="Report Shop"
        message="Shop has been reported"
        buttonText="Ok"
        onPress={() => {
          setReportSuccess(false);
        }}
        primaryBtn={true}
        redImage={true}
      />

      {/* Store Info Modal */}
      <Modal
        visible={storeInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStoreInfoVisible(false)}>
        <TouchableOpacity
          style={styles.storeInfoOverlay}
          activeOpacity={1}
          onPress={() => setStoreInfoVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.storeInfoModal}>
            <View style={styles.storeInfoHeader}>
              <Text style={styles.storeInfoTitle}>Store info</Text>
              <TouchableOpacity
                onPress={() => setStoreInfoVisible(false)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.storeInfoScroll}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.storeInfoLabel}>Store name</Text>
              <Text style={styles.storeInfoValue}>
                {shopDetails?.shop_name || '—'}
              </Text>
              <Text style={styles.storeInfoLabel}>Category</Text>
              <Text style={styles.storeInfoValue}>
                {shopDetails?.category || '—'}
              </Text>
              {(shopDetails?.description || shopDetails?.bio) && (
                <>
                  <Text style={styles.storeInfoLabel}>Description</Text>
                  <Text style={styles.storeInfoValue}>
                    {shopDetails?.description || shopDetails?.bio || '—'}
                  </Text>
                </>
              )}
              {sellerName && sellerName !== 'Store' && (
                <>
                  <Text style={styles.storeInfoLabel}>Seller</Text>
                  <Text style={styles.storeInfoValue}>{sellerName}</Text>
                </>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.themeColor,
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
  editButton: {
    padding: 8,
  },
  addProductsButton: {
    backgroundColor: '#00A19D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addProductsButtonText: {
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
    paddingVertical: 12,
    backgroundColor: 'white',
    marginBottom: 2,
    gap: 8,
  },
  filterItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
  },
  filterDropdown: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 1,
    paddingVertical: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  filterDropdownText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  filterDropdownArrow: {
    fontSize: 8,
    color: '#666',
    marginLeft: 4,
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
  storeInfoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  storeInfoModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '70%',
  },
  storeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  storeInfoScroll: {
    padding: 16,
  },
  storeInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  storeInfoValue: {
    fontSize: 15,
    color: '#333',
  },
});

export default Shop;
