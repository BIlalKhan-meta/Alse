import React, {useState, useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeft, X} from 'lucide-react-native';
import {images} from '../../utils/images';
import {vh, vw} from '../../constant';

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
}

interface TrackingStep {
  title: string;
  completed: boolean;
  date: string;
  time: string;
}

const OrderTracking: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const orders: Order[] = route?.params?.orders || [];

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    orders.length > 0 ? orders[0] : null,
  );

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
  const getTrackingSteps = (order: Order): TrackingStep[] => {
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

  if (!selectedOrder) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders available for tracking</Text>
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
                selectedOrder.product.images?.[0]?.path
                  ? {uri: selectedOrder.product.images[0].path}
                  : images.avatar
              }
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {selectedOrder.product.title || 'Product Name'}
              </Text>
              <Text style={styles.productVariant}>Brown 1</Text>
              <Text style={styles.orderStatus}>Out for Delivery</Text>
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

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>Map View</Text>
            <Text style={styles.mapSubtext}>
              Satellite view with tracking pins
            </Text>
          </View>
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControl}>
              <Text style={styles.mapControlText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControl}>
              <Text style={styles.mapControlText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControl}>
              <Text style={styles.mapControlText}>⛶</Text>
            </TouchableOpacity>
          </View>
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
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
  mapContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    height: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  mapSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  mapControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
  },
  mapControl: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  mapControlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
