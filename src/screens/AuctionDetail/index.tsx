import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getAuction, placeBid, Auction} from '../../api/auction';
import Loader from '../../components/Loader';
import {
  X,
  Heart,
  ArrowLeft,
  Minus,
  Plus,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import GlobalHeader from '../../components/GlobalHeader';

interface RouteParams {
  auctionId: number;
}

const AuctionDetail: React.FC = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const {auctionId} = route.params as RouteParams;
  const {t} = useTranslation();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [placingBid, setPlacingBid] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
  }, [auctionId]);

  const fetchAuctionDetails = async () => {
    setLoading(true);
    try {
      const response = await getAuction(auctionId);
      console.log('Auction detail response:', JSON.stringify(response, null, 2));
      
      // Handle different API response structures
      if (response.data?.data) {
        setAuction(response.data.data);
        // Set initial bid amount to minimum bid
        const minBid = response.data.data.minimum_next_bid || parseFloat(response.data.data.starting_price);
        setBidAmount(minBid);
      } else if (response.data) {
        setAuction(response.data);
        const minBid = response.data.minimum_next_bid || parseFloat(response.data.starting_price);
        setBidAmount(minBid);
      }
    } catch (error) {
      console.error('Error fetching auction details:', error);
      Alert.alert('Error', t('auctionDetail.error.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (endTime: string): number => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = Math.max(0, end - now);
    return Math.floor(diff / 1000); // Return seconds
  };

  const formatTimeRemaining = (endTime: string): string => {
    const seconds = calculateTimeRemaining(endTime);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toLocaleString()}`;
  };

  const handleBidIncrease = () => {
    if (!auction) return;
    const currentPrice = auction.current_price || parseFloat(auction.starting_price);
    const incrementAmount = Math.max(currentPrice, 1); // Ensure minimum increment of 1
    setBidAmount(prev => prev + incrementAmount);
  };

  const handleBidDecrease = () => {
    if (!auction) return;
    const minBid = auction.minimum_next_bid || parseFloat(auction.starting_price);
    const currentPrice = auction.current_price || parseFloat(auction.starting_price);
    const decrementAmount = Math.max(currentPrice, 1); // Ensure minimum decrement of 1
    if (bidAmount > minBid) {
      setBidAmount(prev => Math.max(prev - decrementAmount, minBid));
    }
  };

  const handlePlaceBid = async () => {
    if (!auction) return;
    
    setPlacingBid(true);
    try {
      await placeBid({
        auction_id: auction.id,
        amount: bidAmount,
      });
      
      Alert.alert('Success', t('auctionDetail.success.bidPlaced'));
      setBidModalVisible(false);
      // Refresh auction details to get updated bid info
      fetchAuctionDetails();
    } catch (error) {
      console.error('Error placing bid:', error);
      Alert.alert('Error', t('auctionDetail.error.failedToBid'));
    } finally {
      setPlacingBid(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement actual wishlist API call
  };

  if (loading) {
    return <Loader />;
  }

  if (!auction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('auctionDetail.error.auctionNotFound')}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate if auction can be bid on
  const timeRemaining = calculateTimeRemaining(auction.end_time);
  const canBeBidOn = auction.status === 'active' && timeRemaining > 0;
  
  // Get the first available image or use placeholder
  const imageUri =
    auction.product_images && auction.product_images.length > 0
      ? auction.product_images[0]
      : 'https://via.placeholder.com/300x200?text=No+Image';

  // Use current price or starting price
  const currentPrice = auction.current_price || parseFloat(auction.starting_price);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleWishlistToggle}>
          <Heart 
            size={24} 
            color={isWishlisted ? "#FF6B6B" : "#333"} 
            fill={isWishlisted ? "#FF6B6B" : "transparent"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{uri: imageUri}}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => setImageLoadError(true)}
          />
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{auction.title}</Text>
          
          <Text style={styles.productDescription} numberOfLines={3}>
            {auction.description}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{formatPrice(currentPrice)}</Text>
            <Text style={styles.currentPriceLabel}>{t('auctionDetail.currentBid')}</Text>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>{t('auctionDetail.timeLeftToBid')}</Text>
            <Text style={styles.timeRemaining}>
              {formatTimeRemaining(auction.end_time)}
            </Text>
          </View>

          <View style={styles.sellerContainer}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>
                {auction.seller.full_name?.charAt(0) || auction.seller.username?.charAt(0) || 'S'}
              </Text>
            </View>
            <Text style={styles.sellerName}>
              {auction.seller.full_name || auction.seller.username || 'Seller'}
            </Text>
            <Text style={styles.sellerSubtext}>He person to stop an auction</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.buyNowButton}
          disabled={!canBeBidOn}>
          <Text style={styles.buyNowButtonText}>{t('auctionDetail.buyNow')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.placeBidButton, !canBeBidOn && styles.disabledButton]}
          disabled={!canBeBidOn}
          onPress={() => setBidModalVisible(true)}>
          <Text style={styles.placeBidButtonText}>
            {canBeBidOn ? t('auctionDetail.placeBid') : t('auctionDetail.auctionEnded')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bid Modal */}
      <Modal
        visible={bidModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBidModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bidModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('auctionDetail.placeBidModal.title')}</Text>
              <Text style={styles.modalSubtitle}>
                {t('auctionDetail.placeBidModal.timeLeft')}: {formatTimeRemaining(auction.end_time)}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setBidModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.bidInfo}>
              <View style={styles.bidInfoItem}>
                <Text style={styles.bidInfoLabel}>{t('auctionDetail.placeBidModal.startingBid')}</Text>
                <Text style={styles.bidInfoValue}>
                  {formatPrice(auction.starting_price)}
                </Text>
              </View>
              <View style={styles.bidInfoItem}>
                <Text style={styles.bidInfoLabel}>{t('auctionDetail.placeBidModal.latestBid')}</Text>
                <Text style={styles.bidInfoValue}>
                  {formatPrice(currentPrice)}
                </Text>
              </View>
            </View>

            <View style={styles.yourBidSection}>
              <Text style={styles.yourBidLabel}>{t('auctionDetail.placeBidModal.yourBid')}</Text>
              <View style={styles.bidAmountContainer}>
                <TouchableOpacity 
                  style={styles.bidControlButton}
                  onPress={handleBidDecrease}>
                  <Minus size={20} color="#00A19D" />
                </TouchableOpacity>
                <Text style={styles.bidAmount}>{formatPrice(bidAmount)}</Text>
                <TouchableOpacity 
                  style={styles.bidControlButton}
                  onPress={handleBidIncrease}>
                  <Plus size={20} color="#00A19D" />
                </TouchableOpacity>
              </View>
              <Text style={styles.bidIncreaseText}>
                {t('auctionDetail.placeBidModal.bidIncreased')} {formatPrice(auction.current_price || parseFloat(auction.starting_price))}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.submitBidButton, placingBid && styles.disabledButton]}
              disabled={placingBid}
              onPress={handlePlaceBid}>
              {placingBid ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitBidButtonText}>{t('auctionDetail.placeBidModal.submit')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: 'white',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  currentPriceLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timeContainer: {
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00A19D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sellerInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  sellerSubtext: {
    fontSize: 12,
    color: '#666',
    position: 'absolute',
    bottom: -16,
    left: 52,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  buyNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  placeBidButton: {
    flex: 1,
    backgroundColor: '#00A19D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  placeBidButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#00A19D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bidModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  bidInfoItem: {
    alignItems: 'center',
  },
  bidInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bidInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  yourBidSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  yourBidLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  bidAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00A19D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 30,
  },
  bidIncreaseText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  submitBidButton: {
    backgroundColor: '#00A19D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBidButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AuctionDetail;
