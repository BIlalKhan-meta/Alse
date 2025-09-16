import React, {useState, useLayoutEffect, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeft, X} from 'lucide-react-native';
import {images} from '../../utils/images';
import GoogleMapsLink from '../../components/GoogleMapsLink';
import {getOrders, getMyOrders, getOrderDetail} from '../../api/product';
import Loader from '../../components/Loader';

interface Order {
  order_id: string;
  product: {
    title: string;
    images: Array<{path: string}>;
    banner: string;
  };
  total_amount: string;
  status: string;
  tracking_number?: string;
  carrier?: string;
  expected_delivery?: string;
  buyer_location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  seller_location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface TrackingStep {
  title: string;
  completed: boolean;
  date: string;
  time: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const OrderTracking: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [perPage] = useState(10); // Items per page

  console.log('Route params:', route?.params);

  // Fetch orders from API with pagination
  const fetchOrders = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        let response;

        // Check if we should fetch shop orders or regular orders
        if (route?.params?.isShopOrder) {
          response = await getMyOrders({
            page,
            per_page: perPage,
          });
        } else {
          response = await getOrders({
            page,
            per_page: perPage,
          });
        }

        console.log('Orders API response:', response?.data);

        if (response?.data?.data?.data) {
          const fetchedOrders = response.data.data.data;
          const meta: PaginationMeta = response.data.data.meta;

          // Update pagination state
          setCurrentPage(meta.current_page);
          setLastPage(meta.last_page);
          setHasMoreData(meta.current_page < meta.last_page);

          // Update orders list
          if (append) {
            setOrders(prev => [...prev, ...fetchedOrders]);
          } else {
            setOrders(fetchedOrders);

            // Set the first order as selected, or use the specific order from route params
            if (route?.params?.orderId) {
              const specificOrder = fetchedOrders.find(
                (order: Order) => order.order_id === route.params.orderId,
              );
              setSelectedOrder(specificOrder || fetchedOrders[0]);
            } else {
              // Only set selected order if we have valid orders with product data
              const validOrder = fetchedOrders.find((order: Order) => order.product);
              setSelectedOrder(validOrder || null);
            }
          }
        } else {
          if (!append) {
            setOrders([]);
            setSelectedOrder(null);
          }
          setHasMoreData(false);
        }
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err?.response?.data?.message || 'Failed to fetch orders');
        if (!append) {
          setOrders([]);
          setSelectedOrder(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [route?.params?.isShopOrder, route?.params?.orderId, perPage],
  );

  // Load more orders (for infinite scroll)
  const loadMoreOrders = useCallback(async () => {
    if (!loadingMore && hasMoreData && currentPage < lastPage) {
      await fetchOrders(currentPage + 1, true);
    }
  }, [loadingMore, hasMoreData, currentPage, lastPage, fetchOrders]);

  // Fetch specific order details if orderId is provided
  const fetchOrderDetail = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await getOrderDetail(parseInt(orderId));
      console.log('Order detail response:', response?.data);

      if (response?.data?.data) {
        const orderDetail = response.data.data;
        // Validate that the order has product data before setting it
        if (orderDetail.product) {
          setSelectedOrder(orderDetail);
          setOrders([orderDetail]); // Set as single order in array
        } else {
          console.error('Order detail missing product information');
          setError('Order data is incomplete - missing product information');
        }
      } else {
        setError('No order details found');
      }
    } catch (err: any) {
      console.error('Error fetching order detail:', err);
      setError(err?.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If specific orderId is provided, fetch that order detail
    if (route?.params?.orderId) {
      fetchOrderDetail(route.params.orderId);
    } else {
      // Otherwise fetch all orders starting from page 1
      fetchOrders(1, false);
    }
  }, [route?.params?.orderId, route?.params?.isShopOrder, fetchOrders]);

  // Get location data from the selected order
  const getOrderLocations = () => {
    if (!selectedOrder?.buyer_location || !selectedOrder?.seller_location) {
      // Fallback to default locations if order data is missing
      return {
        buyerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
          title: 'Delivery Address',
          description: 'Your location',
        },
        sellerLocation: {
          latitude: 40.7589,
          longitude: -73.9851,
          title: 'Seller Location',
          description: 'Store location',
        },
      };
    }

    return {
      buyerLocation: {
        latitude: selectedOrder.buyer_location.latitude,
        longitude: selectedOrder.buyer_location.longitude,
        title: 'Delivery Address',
        description: selectedOrder.buyer_location.address,
      },
      sellerLocation: {
        latitude: selectedOrder.seller_location.latitude,
        longitude: selectedOrder.seller_location.longitude,
        title: 'Seller Location',
        description: selectedOrder.seller_location.address,
      },
    };
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#00A19D',
      },
      headerTitleStyle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
      },
      title: 'Tracking',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Mock tracking steps - in real app, this would come from API
  const getTrackingSteps = (_order: Order): TrackingStep[] => {
    return [
      {
        title: 'Shipment Processed by Leopard shipping company',
        completed: true,
        date: '15 June 2025',
        time: '10:30 PM PST',
      },
      {
        title: 'On Delivery by Leopard shipping company',
        completed: true,
        date: '15 June 2025',
        time: '10:30 PM PST',
      },
      {
        title: 'In Transit',
        completed: false,
        date: '15 June 2025',
        time: '10:30 PM PST',
      },
    ];
  };

  const renderTrackingStep = ({
    item,
    index,
  }: {
    item: TrackingStep;
    index: number;
  }) => (
    <View style={styles.trackingStep}>
      <View style={styles.stepIndicator}>
        <View
          style={[
            styles.stepCircle,
            item.completed ? styles.completedStep : styles.pendingStep,
          ]}
        />
        {index < getTrackingSteps(selectedOrder!).length - 1 && (
          <View
            style={[
              styles.stepLine,
              item.completed ? styles.completedLine : styles.pendingLine,
            ]}
          />
        )}
      </View>
      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepTitle,
            item.completed ? styles.completedText : styles.pendingText,
          ]}>
          {item.title}
        </Text>
        <Text style={styles.stepDate}>Date: {item.date}</Text>
        <Text style={styles.stepTime}>Time: {item.time}</Text>
      </View>
    </View>
  );

  const handleOrderReceived = () => {
    // Handle order received logic
    console.log('Order received:', selectedOrder?.order_id);
    // You can add API call here to mark order as received
    navigation.goBack();
  };

  // Render loading footer for pagination
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <Loader />
        <Text style={styles.loadingText}>Loading more orders...</Text>
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Loader />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Error loading orders</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchOrders(1, false)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show empty state when no orders are available
  if (!selectedOrder || orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders available for tracking</Text>
          <Text style={styles.emptySubtext}>
            Please select an order to track its delivery status
          </Text>
        </View>
      </View>
    );
  }

  // Additional validation for selectedOrder structure
  if (!selectedOrder.product) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Invalid order data</Text>
          <Text style={styles.emptySubtext}>
            The selected order is missing product information
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchOrders(1, false)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.orderCard}>
          <View style={styles.productSection}>
            <Image
              source={
                selectedOrder.product?.images?.[0]?.path
                  ? {uri: selectedOrder.product.images[0].path}
                  : images.avatar
              }
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {selectedOrder.product?.title || 'Product Name'}
              </Text>
              <Text style={styles.productVariant}>Brown 1</Text>
              <Text style={styles.orderStatus}>{selectedOrder.status}</Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Number:</Text>
              <Text style={styles.detailValue}>#{selectedOrder.order_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tracking Number:</Text>
              <Text style={styles.detailValue}>
                #{selectedOrder.tracking_number || selectedOrder.order_id}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Carrier:</Text>
              <Text style={styles.detailValue}>
                {selectedOrder.carrier || 'Leopards'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expected Delivery:</Text>
              <Text style={styles.detailValue}>
                {selectedOrder.expected_delivery || '12-11-2025'}
              </Text>
            </View>
          </View>

          <View style={styles.rideDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ride Name:</Text>
              <Text style={styles.detailValue}>Ishowspeed</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contact:</Text>
              <Text style={styles.detailValue}>+1 223 562 666</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle:</Text>
              <Text style={styles.detailValue}>BMW M5</Text>
            </View>
          </View>
        </View>

        {/* Order Selector with Pagination */}
        {orders.length > 1 && (
          <View style={styles.orderSelector}>
            <View style={styles.orderSelectorHeader}>
              <Text style={styles.orderSelectorTitle}>Select Order:</Text>
              <Text style={styles.paginationInfo}>
                Page {currentPage} of {lastPage} ({orders.length} orders)
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {orders.map(order => (
                <TouchableOpacity
                  key={order.order_id}
                  style={[
                    styles.orderOption,
                    selectedOrder?.order_id === order.order_id &&
                      styles.selectedOrderOption,
                  ]}
                  onPress={() => setSelectedOrder(order)}>
                  <Text
                    style={[
                      styles.orderOptionText,
                      selectedOrder?.order_id === order.order_id &&
                        styles.selectedOrderOptionText,
                    ]}>
                    {order.product?.title || 'Product Name'}
                  </Text>
                  <Text
                    style={[
                      styles.orderOptionStatus,
                      selectedOrder?.order_id === order.order_id &&
                        styles.selectedOrderOptionStatus,
                    ]}>
                    {order.status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Load More Button */}
            {hasMoreData && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreOrders}
                disabled={loadingMore}>
                <Text style={styles.loadMoreButtonText}>
                  {loadingMore ? 'Loading...' : 'Load More Orders'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <GoogleMapsLink
            buyerLocation={getOrderLocations().buyerLocation}
            sellerLocation={getOrderLocations().sellerLocation}
            height={200}
          />
        </View>

        {/* Tracking Timeline */}
        <View style={styles.timelineContainer}>
          <FlatList
            data={getTrackingSteps(selectedOrder)}
            renderItem={renderTrackingStep}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Order Received Button */}
      <TouchableOpacity
        style={styles.receivedButton}
        onPress={handleOrderReceived}>
        <Text style={styles.receivedButtonText}>I have received the Order</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00A19D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productVariant: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginBottom: 16,
  },
  rideDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  orderSelector: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paginationInfo: {
    fontSize: 12,
    color: '#666',
  },
  orderOption: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOrderOption: {
    backgroundColor: '#00A19D',
    borderColor: '#00A19D',
  },
  orderOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  selectedOrderOptionText: {
    color: 'white',
  },
  orderOptionStatus: {
    fontSize: 10,
    color: '#999',
  },
  selectedOrderOptionStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadMoreButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  mapContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  timelineContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  completedStep: {
    backgroundColor: '#00A19D',
  },
  pendingStep: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  stepLine: {
    width: 2,
    height: 40,
  },
  completedLine: {
    backgroundColor: '#00A19D',
  },
  pendingLine: {
    backgroundColor: '#f0f0f0',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedText: {
    color: '#333',
  },
  pendingText: {
    color: '#999',
  },
  stepDate: {
    fontSize: 12,
    color: '#666',
  },
  stepTime: {
    fontSize: 12,
    color: '#666',
  },
  receivedButton: {
    backgroundColor: '#00A19D',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receivedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderTracking;
