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
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getAuctions, Auction} from '../../api/auction';
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
  X,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import GlobalHeader from '../../components/GlobalHeader';
import {useAppDispatch} from '../../hooks/storeHooks';
import {logout, LogoutUser} from '../../store/slices/authSlice';

// Using Auction interface from auction.ts

const AuctionBidding: React.FC = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [imageLoadErrors, setImageLoadErrors] = useState<{
    [key: number]: boolean;
  }>({});
  const [showFabOptions, setShowFabOptions] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [paginationLoading, setPaginationLoading] = useState(false);

  const filterOptions = ['Category', 'Price', 'Location', 'Time Left'];

  const {t} = useTranslation();

  const handleLogout = () => {
    console.log('🚪 Logging out user...');
    dispatch(logout());
    dispatch(LogoutUser());
    // navigation.navigate('Login'); // Uncomment if you want to navigate to login
  };

  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctions, searchQuery, selectedFilter]);

  const fetchAuctions = async (page: number = 1, isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (page === 1) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }

    try {
      // Get auctions with pagination
      const auctionsRes = await getAuctions({ page, per_page: 15 });

      console.log('Auctions API Response:', JSON.stringify(auctionsRes, null, 2));

      // Handle the actual API response structure from your example
      if (auctionsRes.data?.data?.data && Array.isArray(auctionsRes.data.data.data)) {
        const auctionData = auctionsRes.data.data.data;
        const paginationMeta = auctionsRes.data.data.meta;
        
        setAuctions(auctionData);
        setCurrentPage(paginationMeta?.current_page || 1);
        setTotalPages(paginationMeta?.last_page || 1);
        setTotalAuctions(paginationMeta?.total || 0);
        
        console.log('Auctions fetched successfully:', auctionData.length, 'auctions');
        console.log('Pagination info:', {
          currentPage: paginationMeta?.current_page,
          totalPages: paginationMeta?.last_page,
          total: paginationMeta?.total
        });
      } else if (auctionsRes.data?.data && Array.isArray(auctionsRes.data.data)) {
        setAuctions(auctionsRes.data.data);
        console.log('Auctions fetched successfully (alternative structure):', auctionsRes.data.data.length, 'auctions');
      } else if (auctionsRes.data && Array.isArray(auctionsRes.data)) {
        setAuctions(auctionsRes.data);
        console.log('Auctions fetched successfully (direct array):', auctionsRes.data.length, 'auctions');
      } else {
        console.log('No auctions found in API response');
        console.log('Response structure:', auctionsRes);
        setAuctions([]);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setAuctions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPaginationLoading(false);
    }
  };

  const onRefresh = async () => {
    await fetchAuctions(currentPage, true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchAuctions(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchAuctions(currentPage - 1);
    }
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchAuctions(page);
    }
  };

  const filterAuctions = () => {
    let filtered = [...auctions];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        auction =>
          auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          auction.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by selected filter (simplified for now)
    if (selectedFilter && selectedFilter !== 'Time Left') {
      filtered = filtered.filter(
        auction =>
          auction.title.toLowerCase().includes(selectedFilter.toLowerCase()) ||
          auction.description
            .toLowerCase()
            .includes(selectedFilter.toLowerCase()) ||
          auction.category
            .toLowerCase()
            .includes(selectedFilter.toLowerCase()),
      );
    }

    setFilteredAuctions(filtered);
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'draft':
        return '#FF9800';
      case 'ended':
        return '#F44336';
      case 'paused':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderAuctionItem = ({item}: {item: Auction}) => {
    // Calculate if auction can be bid on based on status and time
    const timeRemaining = calculateTimeRemaining(item.end_time);
    const canBeBidOn = item.status === 'active' && timeRemaining > 0;
    
    // Get the first available image or use placeholder
    const imageUri =
      item.product_images && item.product_images.length > 0
        ? item.product_images[0]
        : 'https://via.placeholder.com/300x200?text=No+Image';

    // Use starting price as current price if no current price is available
    const currentPrice = item.current_price || parseFloat(item.starting_price);
    const minimumBid = item.minimum_next_bid || parseFloat(item.starting_price);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          navigation.navigate('AuctionDetail', {auctionId: item.id})
        }>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: imageUri}}
            style={styles.productImage}
            resizeMode="cover"
            onError={error => {
              console.log(
                `Image load error for auction ${item.id}:`,
                error.nativeEvent,
              );
              setImageLoadErrors(prev => ({...prev, [item.id]: true}));
            }}
            onLoad={() => {
              console.log(`Image loaded successfully for auction ${item.id}`);
              setImageLoadErrors(prev => ({...prev, [item.id]: false}));
            }}
          />
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>
              {formatTimeRemaining(item.end_time)}
            </Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
            <Text style={styles.statusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.sellerContainer}>
            <Text style={styles.sellerText}>
              {t('by')} @{item.seller.full_name || item.seller.username || 'seller'}
            </Text>
            {item.category && (
              <Text style={styles.categoryText}>
                {item.category}
              </Text>
            )}
            {item.location && (
              <Text style={styles.auctionLocationText}>
                📍 {item.location}
              </Text>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currentBid}>
              {t('auctionBidding.currentBid')}: {formatPrice(currentPrice)}
            </Text>
            <Text style={styles.minimumBid}>
              {t('auctionBidding.minimumBid')}: {formatPrice(minimumBid)}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.bidButton, !canBeBidOn && styles.disabledBidButton]}
            disabled={!canBeBidOn}>
            <Text style={styles.bidButtonText}>
              {canBeBidOn ? t('auctionBidding.placeBid') : "Auction Ended"}
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
        <GlobalHeader title="Auctions & Bidding" icon={true} />
        {/* <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity> */}
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

      {/* Auctions List */}
      <FlatList
        data={filteredAuctions}
        renderItem={renderAuctionItem}
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
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.paginationContainer}>
              {/* Pagination Info */}
              <Text style={styles.paginationInfo}>
                Page {currentPage} of {totalPages} ({totalAuctions} total auctions)
              </Text>
              
              {/* Pagination Controls */}
              <View style={styles.paginationControls}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={handlePreviousPage}
                  disabled={currentPage === 1 || paginationLoading}>
                  <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                    Previous
                  </Text>
                </TouchableOpacity>

                {/* Page Numbers */}
                <View style={styles.pageNumbersContainer}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <TouchableOpacity
                        key={pageNum}
                        style={[
                          styles.pageNumberButton,
                          currentPage === pageNum && styles.pageNumberButtonActive
                        ]}
                        onPress={() => handlePageSelect(pageNum)}
                        disabled={paginationLoading}>
                        <Text style={[
                          styles.pageNumberText,
                          currentPage === pageNum && styles.pageNumberTextActive
                        ]}>
                          {pageNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                  onPress={handleNextPage}
                  disabled={currentPage === totalPages || paginationLoading}>
                  <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Loading indicator for pagination */}
              {paginationLoading && (
                <View style={styles.paginationLoading}>
                  <ActivityIndicator size="small" color="#00A19D" />
                  <Text style={styles.paginationLoadingText}>Loading page {currentPage}...</Text>
                </View>
              )}

            </View>
          ) : null
        }
      />

      {/* FAB Options Menu */}
      {showFabOptions && (
        <View style={styles.fabOptionsContainer}>
          <TouchableOpacity 
            style={styles.fabOption}
            onPress={() => {
              setShowFabOptions(false);
              navigation.navigate('CreateAuction');
            }}>
            <View style={styles.fabOptionContent}>
              <Gavel size={20} color="#00A19D" />
              <Text style={styles.fabOptionText}>Create Auction</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fabButton, showFabOptions && styles.fabButtonActive]}
        onPress={() => setShowFabOptions(!showFabOptions)}>
        {showFabOptions ? (
          <X size={24} color="white" />
        ) : (
          <Plus size={24} color="white" />
        )}
      </TouchableOpacity>

      {/* Overlay to close FAB options when tapping outside */}
      {showFabOptions && (
        <TouchableOpacity 
          style={styles.fabOverlay}
          onPress={() => setShowFabOptions(false)}
          activeOpacity={1}
        />
      )}
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
    paddingHorizontal: 10,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    paddingVertical: 2,
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
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
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
  categoryText: {
    fontSize: 12,
    color: '#00A19D',
    fontWeight: '500',
    marginTop: 4,
  },
  auctionLocationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  minimumBid: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    marginTop: 4,
  },
  disabledBidButton: {
    backgroundColor: '#ccc',
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
    zIndex: 1000,
  },
  fabButtonActive: {
    backgroundColor: '#ff6b6b',
    transform: [{rotate: '45deg'}],
  },
  fabOptionsContainer: {
    position: 'absolute',
    bottom: 150,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  fabOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fabOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fabOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  // Pagination styles
  paginationContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paginationInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationButton: {
    backgroundColor: '#00A19D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#ccc',
  },
  paginationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationButtonTextDisabled: {
    color: '#999',
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageNumberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  pageNumberButtonActive: {
    backgroundColor: '#00A19D',
    borderColor: '#00A19D',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  pageNumberTextActive: {
    color: 'white',
  },
  paginationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  paginationLoadingText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AuctionBidding;
