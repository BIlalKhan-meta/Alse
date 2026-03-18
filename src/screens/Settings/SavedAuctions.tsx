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
import {getSavedItems} from '../../api/menu';
import {MoreVertical} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

interface SavedItem {
  id?: number;
  savable_id?: number;
  savable_type?: string;
  savable_item?: {
    id?: number;
    title?: string;
    name?: string;
    product_name?: string;
    images?: Array<{path: string}>;
    category?: string;
    category_name?: string;
    quantity?: number;
    price?: number;
    auction_id?: string;
    product_id?: string;
  };
  created_at?: string;
  // Fallback fields that might exist in the API response
  product_name?: string;
  product_category?: string;
  product_quantity?: number;
}

const SavedAuctions = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {t} = useTranslation();

  const fetchSavedItems = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch saved items with type=product to get auctions and products
      const response = await getSavedItems({type: 'product'});
      console.log('Saved Items API Response:', response?.data);
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
        setSavedItems(response.data.data.data);
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Direct array in data
        console.log('Using direct data array:', response.data.data);
        setSavedItems(response.data.data);
      } else if (response?.data && Array.isArray(response.data)) {
        // Direct array response
        console.log('Using direct array response:', response.data);
        setSavedItems(response.data);
      } else {
        console.log('No valid data structure found, setting empty array');
        setSavedItems([]);
      }
    } catch (err: any) {
      console.error('Error fetching saved items:', err);
      setError('Failed to load saved items. Please try again.');
      setSavedItems([]);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load saved items. Please try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchSavedItems(true);
  };

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const handleOptionsPress = (item: SavedItem) => {
    // TODO: Implement options menu (view details, remove from saved, etc.)
    console.log('Options pressed for item:', item.id);
  };

  const renderSavedItem = ({item}: {item: SavedItem}) => {
    // Extract item information with fallbacks
    const itemName =
      item.savable_item?.title ||
      item.savable_item?.name ||
      item.savable_item?.product_name ||
      item.product_name ||
      'Product Name';

    const itemId =
      item.savable_item?.auction_id ||
      item.savable_item?.product_id ||
      item.savable_item?.id ||
      item.savable_id ||
      item.id ||
      'N/A';

    const quantity = item.savable_item?.quantity || item.product_quantity || 0;

    const category =
      item.savable_item?.category ||
      item.savable_item?.category_name ||
      item.product_category ||
      'Category';

    return (
      <View style={styles.savedItem}>
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <Image
            source={
              item.savable_item?.images?.[0]?.path
                ? {uri: item.savable_item.images[0].path}
                : require('../../assets/images/shop1.png')
            }
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <InterLightAverage style={styles.productName}>
            {itemName}
          </InterLightAverage>
          <InterRegular style={styles.productId}>#{itemId}</InterRegular>
        </View>

        {/* Quantity */}
        <View style={styles.quantityContainer}>
          <InterRegular style={styles.quantityText}>{quantity}PCS</InterRegular>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.themeColor]}
            tintColor={colors.themeColor}
          />
        }>
        {/* Saved Auctions Header */}
        <View style={styles.languageHeader}>
          <InterLightAverage style={styles.languageTitle}>
            {t('savedAuctions.title')}
          </InterLightAverage>
        </View>

        {/* Saved Items List */}
        {savedItems.length > 0 ? (
          <View style={styles.savedItemsContainer}>
            <FlatList
              data={savedItems}
              renderItem={renderSavedItem}
              keyExtractor={item =>
                (item.id || item.savable_id || Math.random()).toString()
              }
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <InterRegular style={styles.emptyText}>
              {t('savedAuctions.noData')}
            </InterRegular>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SavedAuctions;
