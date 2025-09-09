import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {productDetail} from '../../api/product';
import {placeBid, PlaceBidRequest} from '../../api/bidding';
import {selectBearerToken} from '../../store/slices/authSlice';

// Test import
console.log('📦 placeBid function imported:', typeof placeBid);
import Loader from '../../components/Loader';
import {colors} from '../../utils/theme';
import {
  X,
  ShoppingBag,
  HeartIcon,
  Minus,
  Plus,
  Clock,
} from 'lucide-react-native';
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

const ProductDetail: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const {productId} = route.params;
  const token = useSelector(selectBearerToken);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentBid, setCurrentBid] = useState(4500);
  const [userBid, setUserBid] = useState(4500);
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 1,
    minutes: 24,
    seconds: 3,
  });

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productDetail(productId);
      if (response.data?.data) {
        setProduct(response.data.data);
        // Set initial bid based on product price
        const price = parseFloat(response.data.data.price) || 4500;
        setCurrentBid(price);
        setUserBid(price);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        let {hours, minutes, seconds} = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          clearInterval(interval);
          return {hours: 0, minutes: 0, seconds: 0};
        }

        return {hours, minutes, seconds};
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    fetchProductDetails();
    const stopTimer = startTimer();
    return stopTimer;
  }, [fetchProductDetails]);

  const handleBidIncrease = () => {
    setUserBid(prev => prev + 100);
  };

  const handleBidDecrease = () => {
    if (userBid > currentBid) {
      setUserBid(prev => Math.max(prev - 100, currentBid));
    }
  };

  const handlePlaceBid = () => {
    console.log('🎯 handlePlaceBid called');
    console.log('🎯 userBid:', userBid);
    console.log('🎯 currentBid:', currentBid);
    console.log('🎯 productId:', productId);

    // Validate bid amount
    if (userBid <= currentBid) {
      Alert.alert('Error', 'Your bid must be higher than the current bid');
      return;
    }

    // Validate product ID
    if (!productId || productId <= 0) {
      Alert.alert('Error', 'Invalid auction. Please refresh and try again.');
      return;
    }

    // Check if product exists
    if (!product) {
      Alert.alert('Error', 'Product not found. Please refresh and try again.');
      return;
    }

    // Check if user is authenticated
    if (!token) {
      Alert.alert('Error', 'Please login to place a bid.');
      return;
    }

    console.log('🔐 User token:', token ? 'Present' : 'Missing');

    // Show confirmation dialog
    Alert.alert(
      'Confirm Bid',
      `Are you sure you want to place a bid of ${formatPrice(userBid)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Place Bid',
          onPress: async () => {
            try {
              setBidLoading(true);

              const bidData: PlaceBidRequest = {
                auction_id: productId,
                amount: userBid,
                is_auto_bid: false,
              };

              console.log('🚀 Placing bid with data:', bidData);
              console.log('📡 Making API call to POST /api/bids');
              console.log(
                '🔐 Using token:',
                token ? `${token.substring(0, 20)}...` : 'No token',
              );

              const response = await placeBid(bidData);

              console.log('✅ Bid API Response:', response);
              console.log('📊 Response data:', response.data);

              if (response.data?.status) {
                setCurrentBid(userBid);
                console.log('🎉 Bid placed successfully!');
                Alert.alert(
                  'Success',
                  'Your bid has been placed successfully!',
                );
              } else {
                console.log('❌ Bid failed:', response.data?.message);
                Alert.alert(
                  'Error',
                  response.data?.message || 'Failed to place bid',
                );
              }
            } catch (error: any) {
              console.error('💥 Error placing bid:', error);
              console.error('💥 Error response:', error?.response);
              console.error('💥 Error data:', error?.response?.data);
              console.error('💥 Error status:', error?.response?.status);

              let errorMessage = 'Failed to place bid. Please try again.';

              if (error?.response?.status === 403) {
                errorMessage =
                  'You are not authorized to place a bid on this auction. Please check if you have the required permissions.';
              } else if (error?.response?.status === 404) {
                errorMessage =
                  'Auction not found. Please refresh and try again.';
              } else if (error?.response?.status === 422) {
                errorMessage =
                  error?.response?.data?.message ||
                  'Invalid bid data. Please check your bid amount.';
              } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error?.message) {
                errorMessage = error.message;
              }

              Alert.alert('Error', errorMessage);
            } finally {
              setBidLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleBuyNow = () => {
    Alert.alert('Buy Now', 'Proceeding to checkout...');
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toLocaleString()}`;
  };

  const formatTime = (time: {
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    return `${time.hours}h:${time.minutes
      .toString()
      .padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const imageUri =
    product.images && product.images.length > 0
      ? product.images[0].path
      : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}>
              <X size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <ShoppingBag size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{uri: imageUri}} style={styles.productImage} />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}>
            <HeartIcon
              size={24}
              color={isFavorite ? '#ff4757' : '#fff'}
              fill={isFavorite ? '#ff4757' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.productTitle}>
            {product.title || 'Razer BlackShark V2 Pro'}
          </Text>

          <Text style={styles.productDescription}>
            {product.description ||
              "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy Lorem ipsum is simply dummy"}
          </Text>

          <View style={styles.bidInfo}>
            <Text style={styles.currentBid}>
              {formatPrice(currentBid)} Current Bid
            </Text>
            <View style={styles.timeContainer}>
              <Clock size={16} color="#666" />
              <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
            </View>
          </View>

          <View style={styles.sellerInfo}>
            <Image
              source={{
                uri:
                  product.shop?.avatar || 'https://via.placeholder.com/40x40',
              }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>
                {product.shop?.fullname || 'Aaron Byrne'}
              </Text>
              <Text style={styles.sellerDescription}>
                -1st person to step-on moon
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.placeBidButton,
                bidLoading && styles.placeBidButtonDisabled,
              ]}
              onPress={handlePlaceBid}
              disabled={bidLoading}>
              <Text style={styles.placeBidText}>
                {bidLoading ? 'Placing Bid...' : 'Place a Bid'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyNowButton}
              onPress={handleBuyNow}>
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bidding Interface */}
        <View style={styles.biddingContainer}>
          <View style={styles.biddingHeader}>
            <Text style={styles.biddingTitle}>Place your Bid</Text>
            <View style={styles.timeLeftBadge}>
              <Text style={styles.timeLeftText}>
                Time Left to Bid {formatTime(timeRemaining)}
              </Text>
            </View>
          </View>

          <View style={styles.bidOverview}>
            <View style={styles.bidInfoItem}>
              <Text style={styles.bidInfoLabel}>Starting bid</Text>
              <Text style={styles.bidInfoValue}>
                {formatPrice(parseFloat(product.price) * 0.8)}
              </Text>
            </View>
            <View style={styles.bidDivider} />
            <View style={styles.bidInfoItem}>
              <Text style={styles.bidInfoLabel}>Latest Bid</Text>
              <Text style={styles.bidInfoValue}>{formatPrice(currentBid)}</Text>
            </View>
          </View>

          <View style={styles.bidInputContainer}>
            <Text style={styles.bidInputLabel}>Your Bid</Text>
            <View style={styles.bidInputRow}>
              <TouchableOpacity
                style={styles.bidButton}
                onPress={handleBidDecrease}>
                <Minus size={20} color={colors.themeColor} />
              </TouchableOpacity>
              <Text style={styles.bidAmount}>{formatPrice(userBid)}</Text>
              <TouchableOpacity
                style={styles.bidButton}
                onPress={handleBidIncrease}>
                <Plus size={20} color={colors.themeColor} />
              </TouchableOpacity>
            </View>
            <Text style={styles.bidIncrement}>*Bid Increased by $100</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.placeBidFinalButton,
              bidLoading && styles.placeBidFinalButtonDisabled,
            ]}
            onPress={handlePlaceBid}
            disabled={bidLoading}>
            <Text style={styles.placeBidFinalText}>
              {bidLoading ? 'Placing Bid...' : 'Place a Bid'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerButton: {
    padding: 4,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#1e3a8a',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  productDetails: {
    backgroundColor: '#fff',
    padding: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentBid: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.themeColor,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sellerDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  placeBidButton: {
    flex: 1,
    backgroundColor: colors.themeColor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeBidButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  placeBidText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.themeColor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowText: {
    color: colors.themeColor,
    fontSize: 16,
    fontWeight: '600',
  },
  biddingContainer: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  biddingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  biddingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timeLeftBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeLeftText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bidOverview: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  bidInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  bidInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bidInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bidDivider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  bidInputContainer: {
    marginBottom: 20,
  },
  bidInputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  bidInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  bidButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 120,
    textAlign: 'center',
  },
  bidIncrement: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  placeBidFinalButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeBidFinalButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  placeBidFinalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetail;
