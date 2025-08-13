import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {images} from '../../../utils/images';
import {colors} from '../../../utils/theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getProductByShop, shopDetail} from '../../../api/shop';
import Loader from '../../../components/Loader';
import DropDownTextInput from '../../../components/TextInput/DropDownTextInput';
import ReportBlockModal from '../../../components/ReportBlockModal';
import GeneralModal from '../../../components/GeneralModal';
import {reportPost} from '../../../api/home';
import {getMessage, Toast} from '../../../utils/helpers';
import {
  MessageCircle,
  HelpCircle,
  Mail,
  Share2,
  Edit3,
  MoreVertical,
} from 'lucide-react-native';
import GlobalHeader from '../../../components/GlobalHeader';

const filterItems = [
  {label: 'Categories', value: 'category'},
  {label: 'Prices', value: 'price'},
  {label: 'Locations', value: 'location'},
  {label: 'Ratings', value: 'rating'},
];

const Shop: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const shopId = route?.params?.shopId;

  const [modalVisible, setModalVisible] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [shopDetails, setShopDetails] = useState<any>({});
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null,
  });
  const [reportLoader, setReportLoader] = useState(false);

  const handleReportPress = () => {
    setModalVisible(false);
    setReportVisible({...reportVisible, visibility: true});
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide the default header
    });
  }, [navigation]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const res = await shopDetail(shopId);
      const res2 = await getProductByShop(shopId);

      setShopDetails(res?.data?.data || {});
      setShopProducts(res2?.data?.data?.data || []);

      // Debug: Log the shop details to see what banner data we have
      console.log('Shop Details:', res?.data?.data);
      console.log('Banner URL:', res?.data?.data?.banner);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    setReportLoader(true);
    const data = {
      reportable_type: `Shop`,
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
      Toast.error(getMessage(err?.message));
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

      <View style={{paddingHorizontal: 12, paddingTop: 8}}>
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
              // source={
              //   shopDetails?.banner && shopDetails?.banner !== ''
              //     ? {uri: shopDetails.banner}
              //     : images.shopCover
              // }
              source={images.shopCover}
              style={styles.bannerImage}
              onError={error => {
                console.log('Banner image error:', error);
              }}
            />

            {/* Store Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={
                  shopDetails?.avatar &&
                  shopDetails?.avatar !==
                    'http://aabcndbkji.us-east-1.awsapprunner.com/storage/default.png'
                    ? {uri: shopDetails.avatar}
                    : images.shop11
                }
                style={styles.avatarImage}
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
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={16} color="#333" />
            </TouchableOpacity>
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
            <View key={index} style={styles.filterItem}>
              <DropDownTextInput
                items={[{label: item.label, value: item.value}]}
                defaultValue=""
                placeholder={item.label}
                onChangeValue={() => {}}
                style={styles.filterDropdown}
              />
            </View>
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
      </ScrollView>

      {/* Modals */}
      <ReportBlockModal
        isVisible={modalVisible}
        options={options}
        onClose={() => setModalVisible(false)}
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
        SecondaryText1="Yes"
        SecondaryText2="No"
        onPress={handleReport}
        secondaryBtn={true}
        loading={reportLoader}
      />
      <GeneralModal
        visible={ReportSuccess}
        closeModal={() => setReportSuccess(false)}
        redImage={true}
        title="Report Shop"
        message="Shop has been reported"
        buttonText="Ok"
        onPress={() => {
          setReportSuccess(false);
        }}
        primaryBtn={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
    minWidth: 0, // Ensures flex items can shrink below their content size
    fontSize: 8,
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
});

export default Shop;
