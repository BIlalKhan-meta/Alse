import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {
  getAuction,
  getAllBidsForAuction,
  getMyBids,
  getMyWinningBids,
  getMyOutbidBids,
  getMyWonBids,
  Auction,
  Bid,
} from '../../api/auction';
import {Clock, DollarSign, User, Trophy, AlertCircle} from 'lucide-react-native';

interface AuctionDetailsProps {
  auctionId: number;
}

interface BidStatus {
  isWinning: boolean;
  isOutbid: boolean;
  isWon: boolean;
  latestBidAmount?: string;
  myBidAmount?: string;
  totalBids: number;
  currentUserBid?: Bid;
}

const AuctionDetails: React.FC<AuctionDetailsProps> = ({auctionId}) => {
  const user = useSelector(selectUserProfile);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidStatus, setBidStatus] = useState<BidStatus>({
    isWinning: false,
    isOutbid: false,
    isWon: false,
    totalBids: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auctionId) {
      fetchAuctionDetails();
    }
  }, [auctionId]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch auction details
      const auctionResponse = await getAuction(auctionId);
      const auctionData = auctionResponse.data?.data;

      if (!auctionData) {
        throw new Error('Auction not found');
      }

      setAuction(auctionData);

      // Fetch all bids for this auction (public)
      const bidsResponse = await getAllBidsForAuction(auctionId);
      const bidsData = bidsResponse.data?.data?.data || [];

      // Calculate latest bid amount and total bids
      const latestBid = bidsData.length > 0 ? bidsData[0] : null;
      const latestBidAmount = latestBid?.amount || auctionData.starting_price;

      // Initialize bid status
      let status: BidStatus = {
        isWinning: false,
        isOutbid: false,
        isWon: false,
        latestBidAmount,
        totalBids: bidsData.length,
      };

      // If user is authenticated, check their bid status using the bid data
      if (user?.id) {
        checkUserBidStatusFromBids(bidsData, user.id, status);
      }

      setBidStatus(status);
    } catch (err: any) {
      console.error('Error fetching auction details:', err);
      setError(err.message || 'Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const checkUserBidStatusFromBids = (bidsData: Bid[], userId: number, status: BidStatus) => {
    try {
      // Find all bids placed by the current user
      const userBids = bidsData.filter(bid => bid.bidder.id === userId);
      
      if (userBids.length > 0) {
        // Get the most recent bid by the user (first in the array since it's sorted by latest)
        const latestUserBid = userBids[0];
        
        status.myBidAmount = latestUserBid.amount;
        status.currentUserBid = latestUserBid;
        
        // Use the bid status flags from the API response
        status.isWinning = latestUserBid.is_winning;
        status.isOutbid = latestUserBid.is_outbid;
        status.isWon = latestUserBid.is_won;
      }
    } catch (err) {
      console.error('Error checking user bid status from bids:', err);
      // Continue without user-specific bid status
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toFixed(2)}`;
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Auction ended';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getBidStatusInfo = () => {
    if (bidStatus.isWon) {
      return {
        icon: <Trophy size={16} color="#4CAF50" />,
        text: 'You won this auction!',
        textColor: '#4CAF50',
        bgColor: '#E8F5E8',
      };
    } else if (bidStatus.isWinning) {
      return {
        icon: <Trophy size={16} color="#2196F3" />,
        text: 'You are currently winning',
        textColor: '#2196F3',
        bgColor: '#E3F2FD',
      };
    } else if (bidStatus.isOutbid) {
      return {
        icon: <AlertCircle size={16} color="#FF9800" />,
        text: 'You have been outbid',
        textColor: '#FF9800',
        bgColor: '#FFF3E0',
      };
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#00A19D" />
        <Text style={styles.loadingText}>Loading auction details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={20} color="#FF5722" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAuctionDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!auction) {
    return null;
  }

  const bidStatusInfo = getBidStatusInfo();

  return (
    <View style={styles.container}>
      {/* Seller Information */}
      <View style={styles.sellerSection}>
        <User size={16} color="#666" />
        <Text style={styles.sellerLabel}>Sold by:</Text>
        <Text style={styles.sellerName}>
          {auction.seller.full_name || auction.seller.username || 'Unknown Seller'}
        </Text>
      </View>

      {/* Auction Title & Description */}
      <View style={styles.auctionInfo}>
        <Text style={styles.auctionTitle}>{auction.title}</Text>
        <Text style={styles.auctionDescription} numberOfLines={3}>
          {auction.description}
        </Text>
      </View>

      {/* Bid Information */}
      <View style={styles.bidSection}>
        <View style={styles.bidRow}>
          <View style={styles.bidInfo}>
            <DollarSign size={16} color="#00A19D" />
            <Text style={styles.bidLabel}>Current Bid:</Text>
            <Text style={styles.currentBid}>
              {formatPrice(bidStatus.latestBidAmount || auction.starting_price)}
            </Text>
          </View>
          <View style={styles.bidCount}>
            <Text style={styles.bidCountText}>{bidStatus.totalBids} bids</Text>
          </View>
        </View>

        {/* User's bid amount if they have bid */}
        {bidStatus.myBidAmount && (
          <View style={styles.myBidRow}>
            <Text style={styles.myBidLabel}>Your bid:</Text>
            <Text style={styles.myBidAmount}>
              {formatPrice(bidStatus.myBidAmount)}
            </Text>
          </View>
        )}

        {/* Bid Status */}
        {bidStatusInfo && (
          <View style={[styles.statusBadge, {backgroundColor: bidStatusInfo.bgColor}]}>
            {bidStatusInfo.icon}
            <Text style={[styles.statusText, {color: bidStatusInfo.textColor}]}>
              {bidStatusInfo.text}
            </Text>
          </View>
        )}
      </View>

      {/* Time Remaining */}
      <View style={styles.timeSection}>
        <Clock size={16} color="#666" />
        <Text style={styles.timeLabel}>Time remaining:</Text>
        <Text style={styles.timeRemaining}>
          {formatTimeRemaining(auction.end_time)}
        </Text>
      </View>

      {/* Starting Price (if different from current) */}
      {bidStatus.latestBidAmount !== parseFloat(auction.starting_price) && (
        <View style={styles.startingPriceSection}>
          <Text style={styles.startingPriceLabel}>Starting price:</Text>
          <Text style={styles.startingPrice}>
            {formatPrice(auction.starting_price)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    marginVertical: 8,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#d32f2f',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#00A19D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  sellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A19D',
    marginLeft: 4,
  },
  auctionInfo: {
    marginBottom: 12,
  },
  auctionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  auctionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bidSection: {
    marginBottom: 12,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bidLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  currentBid: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A19D',
    marginLeft: 4,
  },
  bidCount: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bidCountText: {
    fontSize: 12,
    color: '#666',
  },
  myBidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  myBidLabel: {
    fontSize: 14,
    color: '#666',
  },
  myBidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  timeRemaining: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  startingPriceSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startingPriceLabel: {
    fontSize: 12,
    color: '#999',
  },
  startingPrice: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});

export default AuctionDetails;
