import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import InterLightAverage from '../../components/Text/InterLightAverage';
import InterRegular from '../../components/Text/InterRegular';
import {colors} from '../../utils/theme';
import {getOrders} from '../../api/product';
import {MoreVertical} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface PurchaseItem {
  id?: number;
  order_id?: number;
  product?: {
    id?: number;
    title?: string;
    name?: string;
    images?: Array<{path: string}>;
    category?: string;
    category_name?: string;
  };
  quantity?: number;
  order_number?: string;
  total_amount?: string;
  status?: string;
  created_at?: string;
  // Fallback fields that might exist in the API response
  product_name?: string;
  product_category?: string;
}

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseHistory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getOrders();
      console.log('Purchase History API Response:', response?.data);
      console.log('Response structure:', {
        hasData: !!response?.data,
        hasStatus: !!response?.data?.status,
        hasDataData: !!response?.data?.data,
        hasDataDataData: !!response?.data?.data?.data,
        isDataArray: Array.isArray(response?.data),
        isDataDataArray: Array.isArray(response?.data?.data),
      });

      // Handle different possible response structures
      if (response?.data?.status && response?.data?.data?.data) {
        // Standard paginated response structure
        console.log('Using paginated structure:', response.data.data.data);
        setPurchases(response.data.data.data);
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Direct array in data
        console.log('Using direct data array:', response.data.data);
        setPurchases(response.data.data);
      } else if (response?.data && Array.isArray(response.data)) {
        // Direct array response
        console.log('Using direct array response:', response.data);
        setPurchases(response.data);
      } else {
        console.log('No valid data structure found, setting empty array');
        setPurchases([]);
      }
    } catch (err: any) {
      console.error('Error fetching purchase history:', err);
      setError('Failed to load purchase history. Please try again.');
      setPurchases([]);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load purchase history. Please try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchPurchaseHistory(true);
  };

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const handleOptionsPress = (item: PurchaseItem) => {
    // TODO: Implement options menu (view details, track order, etc.)
    console.log('Options pressed for item:', item.id);
  };

  const renderPurchaseItem = ({item}: {item: PurchaseItem}) => {
    // Extract product information with fallbacks
    const productName =
      item.product?.title ||
      item.product?.name ||
      item.product_name ||
      'Product Name';
    const productId = item.order_number || item.order_id || item.id || 'N/A';
    const quantity = item.quantity || 0;
    const category =
      item.product?.category ||
      item.product?.category_name ||
      item.product_category ||
      'Category';

    return (
      <View style={styles.purchaseItem}>
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <Image
            source={
              item.product?.images?.[0]?.path
                ? {uri: item.product.images[0].path}
                : require('../../assets/images/shop1.png')
            }
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <InterLightAverage style={styles.productName}>
            {productName}
          </InterLightAverage>
          <InterRegular style={styles.productId}>#{productId}</InterRegular>
        </View>

        {/* Quantity */}
        <View style={styles.quantityContainer}>
          <InterRegular style={styles.quantityText}>
            {quantity} PCS
          </InterRegular>
        </View>

        {/* Category */}
        <View style={styles.categoryContainer}>
          <InterRegular style={styles.categoryText}>{category}</InterRegular>
        </View>

        {/* Options Menu */}
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => handleOptionsPress(item)}>
          <MoreVertical size={20} color={colors.lightGrey} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <GlobalHeader icon={true} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.themeColor} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Purchase History Header */}
        <View style={styles.languageHeader}>
          <InterLightAverage style={styles.languageTitle}>
            Purchase History
          </InterLightAverage>
        </View>

        {/* Purchase List */}
        {purchases.length > 0 ? (
          <View style={styles.purchasesContainer}>
            <FlatList
              data={purchases}
              renderItem={renderPurchaseItem}
              keyExtractor={item =>
                (item.id || item.order_id || Math.random()).toString()
              }
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.themeColor]}
                  tintColor={colors.themeColor}
                />
              }
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <InterRegular style={styles.emptyText}>
              No purchase history found
            </InterRegular>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchPurchaseHistory()}>
              <InterRegular style={styles.retryButtonText}>Retry</InterRegular>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PurchaseHistory;
