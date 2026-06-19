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
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {getProductByShop, shopDetail} from '../../api/shop';
import Loader from '../../components/Loader';
import HeaderComponent from '../../components/HeaderComponent';
import ShopProductGridCard from '../../components/ShopProductGridCard';
import FilterSelectModal from '../../components/FilterSelectModal';
import ReportBlockModal from '../../components/ReportBlockModal';
import shopScreenStyles from '../Shop/shopScreenStyles';
import {
  extractShopDetailPayload,
  isRemoteImageUrl,
  pickBannerUrl,
} from '../../utils/shopMedia';
import {
  filterShopProductsByCategory,
  getProductCategoryLabel,
  ShopProductSortValue,
  sortShopProducts,
} from '../../utils/shopProductCard';
import {addProductToCart} from '../../api/product';
import {removeSavedItem, saveItem} from '../../api/menu';
import {getMessage, Toast} from '../../utils/helpers';

const sortOptions = [
  {label: 'Product name (a-z)', value: 'name_asc'},
  {label: 'Product name (z-a)', value: 'name_desc'},
  {label: 'Price (low to high)', value: 'price_asc'},
  {label: 'Price (high to low)', value: 'price_desc'},
  {label: 'Newest first', value: 'newest'},
];

const MyShop: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  const shopId = (route?.params as any)?.shopId;
  const user = useSelector(selectUserProfile);

  const [shopDetails, setShopDetails] = useState<any>({});
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState<
    'category' | 'sort' | null
  >(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortFilter, setSortFilter] =
    useState<ShopProductSortValue>('name_asc');

  const shopOwnerId =
    shopDetails?.user_id ??
    shopDetails?.user?.id ??
    shopDetails?.seller_id;
  const isOwnShop =
    user?.id != null &&
    shopOwnerId != null &&
    String(user.id) === String(shopOwnerId);

  const resolvedBannerUrl = useMemo(
    () => pickBannerUrl(shopDetails),
    [shopDetails],
  );

  const bannerSource = useMemo(() => {
    if (resolvedBannerUrl && isRemoteImageUrl(resolvedBannerUrl) && !bannerError) {
      return {uri: resolvedBannerUrl};
    }
    return images.shopCover;
  }, [resolvedBannerUrl, bannerError]);

  const isBannerRemote =
    Boolean(resolvedBannerUrl && isRemoteImageUrl(resolvedBannerUrl)) &&
    !bannerError;
  const showBannerLoader = isBannerRemote && !bannerLoaded;

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    shopProducts.forEach(product => {
      const label = getProductCategoryLabel(product);
      if (label) {
        categories.add(label);
      }
    });
    return [
      {label: 'All', value: 'all'},
      ...Array.from(categories).map(label => ({label, value: label})),
    ];
  }, [shopProducts]);

  const displayedProducts = useMemo(() => {
    const filtered = filterShopProductsByCategory(
      shopProducts,
      categoryFilter,
    );
    return sortShopProducts(filtered, sortFilter);
  }, [shopProducts, categoryFilter, sortFilter]);

  const selectedCategoryLabel =
    categoryOptions.find(item => item.value === categoryFilter)?.label || 'All';
  const selectedSortLabel =
    sortOptions.find(item => item.value === sortFilter)?.label ||
    'Product name (a-z)';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shopDetail(shopId);
      const res2 = await getProductByShop(shopId);

      setShopDetails(extractShopDetailPayload(res));
      setShopProducts(res2?.data?.data?.data || []);
      setBannerError(false);
      setBannerLoaded(false);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    getData();
  }, [isFocused, getData]);

  const handleToggleSave = async (productId: number, isSaved: boolean) => {
    setShopProducts(prev =>
      prev.map(item =>
        item.id === productId ? {...item, is_saved: !isSaved} : item,
      ),
    );

    const payload = {
      item_id: productId,
      item_type: 'product',
    };

    try {
      if (isSaved) {
        await removeSavedItem(payload);
      } else {
        await saveItem(payload);
      }
    } catch (err) {
      setShopProducts(prev =>
        prev.map(item =>
          item.id === productId ? {...item, is_saved: isSaved} : item,
        ),
      );
      Toast.error(getMessage((err as any)?.message));
    }
  };

  const handleAddToCart = async (product: Record<string, any>) => {
    if (!product?.id) {
      return;
    }

    const form = new FormData();
    if (Array.isArray(product?.sizes) && product.sizes[0]?.size) {
      form.append('size', product.sizes[0].size);
    }
    if (Array.isArray(product?.colors) && product.colors[0]?.color) {
      form.append('colors', product.colors[0].color);
    }

    try {
      const response = await addProductToCart(product.id, form);
      Toast.success(
        response?.data?.message || 'Product added to cart successfully.',
      );
    } catch (err) {
      Toast.error(getMessage((err as any)?.message));
    }
  };

  if (loading) {
    return <Loader />;
  }

  const menuOptions = isOwnShop
    ? [
        {
          text: 'Edit Shop',
          onPress: () => {
            setMenuVisible(false);
            (navigation as any).navigate('EditShop', {shopId});
          },
        },
        {
          text: 'Add Product',
          onPress: () => {
            setMenuVisible(false);
            (navigation as any).navigate('AddProduct', {shopId});
          },
        },
        {
          text: 'Orders',
          onPress: () => {
            setMenuVisible(false);
            (navigation as any).navigate('MyOrders', {
              MyOrder: true,
              shopId,
            });
          },
        },
      ]
    : [
        {
          text: 'Report Shop',
          onPress: () => setMenuVisible(false),
        },
      ];

  return (
    <SafeAreaView style={shopScreenStyles.container}>
      <View style={shopScreenStyles.headerWrap}>
        <HeaderComponent
          label="Shop"
          back
          dots
          notifiVisible={false}
          chatVisible={false}
          searchVisible={false}
          onBackPress={() => navigation.goBack()}
          onDotPress={() => setMenuVisible(true)}
          onNofiPress={() => {}}
          onChatPress={() => {}}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={shopScreenStyles.scrollView}>
        <View style={shopScreenStyles.contentCard}>
          <View style={shopScreenStyles.bannerWrap}>
            <Image
              source={bannerSource}
              style={shopScreenStyles.bannerImage}
              resizeMode="cover"
              onLoadEnd={() => setBannerLoaded(true)}
              onError={() => {
                setBannerError(true);
                setBannerLoaded(true);
              }}
            />
            {showBannerLoader ? (
              <View
                style={shopScreenStyles.bannerLoaderOverlay}
                pointerEvents="none">
                <ActivityIndicator size="large" color={colors.themeColor} />
              </View>
            ) : null}
          </View>

          <Text style={shopScreenStyles.shopName}>
            {shopDetails?.shop_name || 'Shop Name'}
          </Text>

          <View style={shopScreenStyles.filterRow}>
            <View style={shopScreenStyles.filterCol}>
              <Text style={shopScreenStyles.filterLabel}>Category:</Text>
              <TouchableOpacity
                style={shopScreenStyles.filterDropdown}
                onPress={() => setFilterModalOpen('category')}>
                <Text
                  style={shopScreenStyles.filterDropdownText}
                  numberOfLines={1}>
                  {selectedCategoryLabel}
                </Text>
                <Text style={shopScreenStyles.filterDropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={shopScreenStyles.filterCol}>
              <Text style={shopScreenStyles.filterLabel}>Sort by:</Text>
              <TouchableOpacity
                style={shopScreenStyles.filterDropdown}
                onPress={() => setFilterModalOpen('sort')}>
                <Text
                  style={shopScreenStyles.filterDropdownText}
                  numberOfLines={1}>
                  {selectedSortLabel}
                </Text>
                <Text style={shopScreenStyles.filterDropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {displayedProducts.length > 0 ? (
            <View style={shopScreenStyles.productGrid}>
              {displayedProducts.map(product =>
                product?.id != null ? (
                  <View key={product.id} style={shopScreenStyles.productGridItem}>
                    <ShopProductGridCard
                      product={product}
                      onPress={() =>
                        (navigation as any).navigate('ProductView', {
                          productId: product.id,
                        })
                      }
                      onToggleSave={handleToggleSave}
                      onAddToCart={isOwnShop ? undefined : handleAddToCart}
                      showAddButton={!isOwnShop}
                    />
                  </View>
                ) : null,
              )}
            </View>
          ) : (
            <View style={shopScreenStyles.emptyContainer}>
              <Text style={shopScreenStyles.emptyText}>
                No products available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FilterSelectModal
        visible={filterModalOpen === 'category'}
        onClose={() => setFilterModalOpen(null)}
        title="Select category"
        items={categoryOptions}
        selectedValue={categoryFilter}
        onSelect={value => setCategoryFilter(value)}
      />
      <FilterSelectModal
        visible={filterModalOpen === 'sort'}
        onClose={() => setFilterModalOpen(null)}
        title="Sort products"
        items={sortOptions}
        selectedValue={sortFilter}
        onSelect={value => setSortFilter(value as ShopProductSortValue)}
      />

      <ReportBlockModal
        isVisible={menuVisible}
        options={menuOptions}
        onClose={() => setMenuVisible(false)}
        style={{}}
      />
    </SafeAreaView>
  );
};

export default MyShop;
