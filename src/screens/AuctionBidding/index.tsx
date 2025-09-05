import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getAllProducts} from '../../api/product';
import Loader from '../../components/Loader';
import {
  Search,
  MapPin,
  Gavel,
  Bell,
  Settings,
  MessageCircle,
  ChevronDown,
  Plus,
  Lock,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  images: Array<{
    id: number;
    product_id: number;
    image: string;
    type: string;
    path: string;
    date: string;
  }>;
  shop: {
    id: number;
    user_id: number;
    fullname: string;
    username: string | null;
    avatar: string;
    shop_name: string;
    delivery_fees: string;
    banner: string;
    status: number;
    created_at: string;
  };
  category: {
    id: number;
    title: string;
    status: number;
    created_at: string;
    updated_at: string;
    total_videos_count: number;
  };
}

const AuctionBidding: React.FC = () => {
  const navigation: any = useNavigation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [imageLoadErrors, setImageLoadErrors] = useState<{
    [key: number]: boolean;
  }>({});

  const filterOptions = ['Category', 'Price', 'Location', 'Time Left'];

  const {t} = useTranslation();

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, selectedFilter]);

  const getProducts = async () => {
    setLoading(true);
    try {
      // Get all products with sorting by newest
      const allProductsRes = await getAllProducts({
        per_page: 20,
        sort: 'newest',
      });

      // console.log(
      //   'Full API Response:',
      //   JSON.stringify(allProductsRes, null, 2),
      // );

      // Check if the response has the expected structure
      if (
        allProductsRes.data?.data?.data &&
        Array.isArray(allProductsRes.data.data.data)
      ) {
        setProducts(allProductsRes.data.data.data);
        // console.log(
        //   'Products fetched successfully:',
        //   allProductsRes.data.data.data.length,
        //   'products',
        // );
      } else if (
        allProductsRes.data?.data &&
        Array.isArray(allProductsRes.data.data)
      ) {
        setProducts(allProductsRes.data.data);
        // console.log(
        //   'Products fetched successfully (alternative structure):',
        //   allProductsRes.data.data.length,
        //   'products',
        // );
      } else {
        console.log('No products found in API response');
        // console.log('Response structure:', allProductsRes.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getProducts();
    setRefreshing(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        product =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by selected filter (simplified for now)
    if (selectedFilter && selectedFilter !== 'Time Left') {
      filtered = filtered.filter(
        product =>
          product.title.toLowerCase().includes(selectedFilter.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(selectedFilter.toLowerCase()) ||
          product.category.title
            .toLowerCase()
            .includes(selectedFilter.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
  };

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h: ${minutes}m: ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m: ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toLocaleString()}`;
  };

  const renderProductItem = ({item}: {item: Product}) => {
    // Debug: Log image data for this product
    console.log(`Product ${item.id} - ${item.title}:`, {
      hasImages: item.images && item.images.length > 0,
      imageCount: item.images?.length || 0,
      firstImagePath: item.images?.[0]?.path,
      allImages: item.images,
    });

    // Get the first available image or use placeholder
    const imageUri =
      item.images && item.images.length > 0
        ? item.images[0].path
        : 'https://via.placeholder.com/300x200?text=No+Image';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          navigation.navigate('ProductDetail', {productId: item.id})
        }>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: imageUri}}
            style={styles.productImage}
            resizeMode="cover"
            onError={error => {
              console.log(
                `Image load error for product ${item.id}:`,
                error.nativeEvent,
              );
              setImageLoadErrors(prev => ({...prev, [item.id]: true}));
            }}
            onLoad={() => {
              console.log(`Image loaded successfully for product ${item.id}`);
              setImageLoadErrors(prev => ({...prev, [item.id]: false}));
            }}
          />
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>
              {formatTimeRemaining(Math.floor(Math.random() * 86400) + 3600)}
            </Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.sellerContainer}>
            <Text style={styles.sellerText}>
              {t('by')} @{item.shop.fullname || item.shop.shop_name || 'seller'}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currentBid}>
              {t('auctionBidding.currentBid')}: {formatPrice(item.price)}
            </Text>
          </View>

          <TouchableOpacity style={styles.bidButton}>
            <Text style={styles.bidButtonText}>
              {t('auctionBidding.placeBid')}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterItem = ({item}: {item: string}) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === item && styles.selectedFilterChip,
      ]}
      onPress={() => setSelectedFilter(selectedFilter === item ? '' : item)}>
      <Text
        style={[
          styles.filterText,
          selectedFilter === item && styles.selectedFilterText,
        ]}>
        {item}
      </Text>
      <ChevronDown
        size={12}
        color={selectedFilter === item ? '#fff' : '#666'}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>Alse</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#666" />
            <Text style={styles.locationText}>Street, #43 EIL</Text>
            <Lock size={12} color="#666" style={styles.lockIcon} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Bell size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Settings size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <MessageCircle size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <View style={styles.filterIconContainer}>
            <View style={styles.filterDot} />
            <View style={styles.filterDot} />
            <View style={styles.filterDot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={filterOptions}
          renderItem={renderFilterItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Gavel size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {t('auctionBidding.noResults')}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('auctionBidding.noResultsSubtext')}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fabButton}>
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    marginTop: -40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A19D',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  lockIcon: {
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  filterIconContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  filterDot: {
    width: 4,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    gap: 4,
  },
  selectedFilterChip: {
    backgroundColor: '#00A19D',
    borderColor: '#00A19D',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: 'white',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  timeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  sellerContainer: {
    marginBottom: 12,
  },
  sellerText: {
    fontSize: 14,
    color: '#999',
  },
  priceContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  currentBid: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  bidButton: {
    backgroundColor: '#00A19D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  bidButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fabButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#00A19D',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AuctionBidding;
