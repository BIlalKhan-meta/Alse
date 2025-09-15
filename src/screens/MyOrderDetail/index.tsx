import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ArrowLeft} from 'lucide-react-native';
import {getOrderDetail, AcceptOrder, RejectOrder} from '../../api/product';
import {assignRiderToOrder} from '../../api/rider';
import {dateHelper} from '../../utils';
import {images} from '../../utils/images';
import GeneralModal from '../../components/GeneralModal';
import AssignDeliveryModal from '../../components/AssignDeliveryModal';
import Toast from 'react-native-toast-message';
import styles from './styles';

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return '#4CAF50';
    case 'pending':
      return '#FF9800';
    case 'cancelled':
      return '#F44336';
    case 'accepted':
      return '#2196F3';
    default:
      return '#666';
  }
};

// Helper function to format currency
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num?.toFixed(2) || '0.00'}`;
};

// Helper function to format address
const formatAddress = (
  address: string,
  city?: string,
  country?: string,
  zip?: string,
) => {
  if (!address) {
    return 'No address provided';
  }

  const parts = [address];
  if (city) {
    parts.push(city);
  }
  if (country) {
    parts.push(country);
  }
  if (zip) {
    parts.push(zip);
  }

  return parts.join(', ');
};

// Helper function to get payment status color
const getPaymentStatusColor = (status: string) => {
  return status === 'paid' ? '#4CAF50' : '#FF9800';
};

const MyOrderDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const id = (route?.params as any)?.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportInput, setReportInput] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [rejectionReason, _setRejectionReason] = useState('');
  const [cancelLoader, setCancelLoader] = useState(false);
  const [assignDeliveryModalVisible, setAssignDeliveryModalVisible] =
    useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [_assigningRider, setAssigningRider] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrderDetail(id);
      console.log('Order Detail API Response:', res?.data);
      if (res?.data) {
        setData(res?.data?.data);
      }
    } catch (err) {
      console.log('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const OrderAccept = () => {
    AcceptOrder(id)
      .then(res => {
        console.log('Response from Accept Order =====>', res);
        setOrderSuccess(true);
      })
      .catch(err => {
        console.log('Accept Order Error ===>', err);
      });
  };

  // Handle rider assignment
  const handleRiderAssignment = async (riderId: number, riderName: string) => {
    setAssigningRider(true);
    try {
      await assignRiderToOrder(id, riderId);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Order assigned to ${riderName}`,
      });

      // Refresh order data to get updated status
      getData();
    } catch (err) {
      console.log('Error assigning rider:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to assign rider. Please try again.',
      });
    } finally {
      setAssigningRider(false);
    }
  };

  const cancelOrder = () => {
    const cancelData = {reason: rejectionReason};
    if (rejectionReason) {
      setCancelLoader(true);
      RejectOrder(cancelData, id)
        .then(_res => {
          setReportInput(false);
          setReportSuccess(true);
          setCancelLoader(false);
        })
        .catch(err => {
          console.log('Reject Order Error ===>', err);
          setCancelLoader(false);
        });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please Enter Rejection Reason',
      });
    }
  };

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id, getData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No order data found</Text>
      </View>
    );
  }

  // Get product information from order details
  const firstProduct = data?.order_details?.[0];
  const hasOrderItems = data?.order_details?.length > 0;

  const productName = hasOrderItems
    ? firstProduct?.product?.title || 'Product'
    : 'Order #' + data?.id;
  const productVariant = hasOrderItems
    ? firstProduct?.variant || 'Standard'
    : 'No items';

  // Get product image with proper validation
  const getProductImage = () => {
    if (!hasOrderItems) {
      return images.pro1; // Default image when no items
    }

    const imagePath = firstProduct?.product?.images?.[0]?.path;
    const bannerPath = firstProduct?.product?.banner;

    if (imagePath && typeof imagePath === 'string' && imagePath.trim() !== '') {
      return {uri: imagePath};
    }

    if (
      bannerPath &&
      typeof bannerPath === 'string' &&
      bannerPath.trim() !== ''
    ) {
      return {uri: bannerPath};
    }

    return images.pro1;
  };

  const productImage = getProductImage();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#20B2AA" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.orderSummaryCard}>
          {/* Product Section */}
          <View style={styles.productSection}>
            <Image
              source={
                typeof productImage === 'string'
                  ? {uri: productImage}
                  : productImage
              }
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{productName}</Text>
              <Text style={styles.productVariant}>{productVariant}</Text>
              <Text
                style={[
                  styles.statusText,
                  {color: getStatusColor(data?.status)},
                ]}>
                {data?.status === 'delivered'
                  ? 'Package Delivered'
                  : data?.status === 'pending'
                  ? 'Order Pending'
                  : data?.status === 'cancelled'
                  ? 'Order Cancelled'
                  : data?.status === 'accepted'
                  ? 'Order Accepted'
                  : data?.status}
              </Text>
            </View>
          </View>

          {/* Order Details */}
          <View style={styles.orderDetailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Number:</Text>
              <Text style={styles.detailValue}>#{data?.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tracking Number:</Text>
              <Text style={styles.detailValue}>#{data?.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>
                {data?.first_name} {data?.last_name}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{data?.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Date:</Text>
              <Text style={styles.detailValue}>
                {dateHelper(data?.created_at)}
              </Text>
            </View>
            {data?.status === 'delivered' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Delivered at:</Text>
                <Text style={styles.detailValue}>
                  {dateHelper(data?.updated_at)}
                </Text>
              </View>
            )}
          </View>

          {/* Charges Section */}
          <View style={styles.chargesSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subtotal:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(data?.total_amount || 0)}
              </Text>
            </View>
            {data?.discounted_amount > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Discount:</Text>
                <Text style={[styles.detailValue, styles.discountValue]}>
                  -{formatCurrency(data?.discounted_amount)}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Charges:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(data?.delivery_charges || 0)}
              </Text>
            </View>
            <View style={[styles.detailRow, styles.totalAmountRow]}>
              <Text style={[styles.detailLabel, styles.totalAmountLabel]}>
                Total Amount:
              </Text>
              <Text style={[styles.detailValue, styles.totalAmountValue]}>
                {formatCurrency(data?.paid_amount || data?.total_amount || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Orders Details Section */}
        <View style={styles.ordersDetailsSection}>
          <Text style={styles.sectionTitle}>Order Details</Text>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Order Number:</Text>
            <Text style={styles.detailValue}>#{data?.id}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Order Items:</Text>
            <Text style={styles.detailValue}>
              {data?.order_details?.length > 0
                ? data.order_details
                    .map(
                      (item: any) =>
                        `${item?.product?.title || 'Product'} - ${
                          item?.variant || 'Standard'
                        }`,
                    )
                    .join(', ')
                : 'No items found'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <Text
              style={[
                styles.detailValue,
                {color: getPaymentStatusColor(data?.payment_status)},
              ]}>
              {data?.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {data?.payment_status === 'paid' ? 'Prepaid' : 'Cash on Delivery'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Shipping Address:</Text>
            <Text style={styles.detailValue}>
              {formatAddress(
                data?.shipping_address,
                data?.shipping_city,
                data?.shipping_country,
                data?.shipping_zip,
              )}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Contact:</Text>
            <Text style={styles.detailValue}>
              {data?.shipping_phone || data?.phone || 'No contact provided'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Order Date:</Text>
            <Text style={styles.detailValue}>
              {dateHelper(data?.created_at)}
            </Text>
          </View>
        </View>

        {/* Action Buttons for Store Orders */}
        {(route?.params as any)?.StoreOrder && (
          <View style={styles.actionButtonsContainer}>
            {data?.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={OrderAccept}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => setReportVisible(true)}>
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
            {data?.status === 'accepted' && (
              <TouchableOpacity
                style={styles.assignDeliveryButton}
                onPress={() => setAssignDeliveryModalVisible(true)}>
                <Text style={styles.assignDeliveryButtonText}>
                  Assign Delivery
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Assign Delivery Button for Regular Orders */}
        {!(route?.params as any)?.StoreOrder && data?.status === 'accepted' && (
          <View style={styles.assignDeliveryContainer}>
            <TouchableOpacity
              style={styles.assignDeliveryButton}
              onPress={() => setAssignDeliveryModalVisible(true)}>
              <Text style={styles.assignDeliveryButtonText}>
                Assign Delivery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.netButton}>
              <Text style={styles.netButtonText}>NET</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Dashboard Button */}
      <View style={styles.dashboardButtonContainer}>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.dashboardButtonText}>
            Take me to the dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <GeneralModal
        visible={orderSuccess}
        closeModal={() => setOrderSuccess(false)}
        icon={images.checkedIcon}
        title={'Accept Order'}
        message="Order has been Accepted"
        buttonText="Ok"
        primaryBtn={true}
        onPress={() => {
          setOrderSuccess(false);
          navigation.goBack();
        }}
      />

      <GeneralModal
        visible={reportVisible}
        closeModal={() => setReportVisible(false)}
        icon={images.qmark}
        title="Reject Order"
        message="Are you sure you want to reject this Order?"
        SecondaryText1={'Yes'}
        SecondaryText2="No"
        secondaryBtn={true}
        buttonText=""
        primaryBtn={false}
        onPress={() => {
          setReportVisible(false);
          setReportInput(true);
        }}
      />

      <GeneralModal
        visible={reportInput}
        closeModal={() => setReportInput(false)}
        icon={images.qmark}
        title="Reason Of Reject Order"
        message="Please enter the reason for rejecting this order"
        buttonText="Ok"
        onPress={cancelOrder}
        loading={cancelLoader}
        rejectionReason={rejectionReason}
        primaryBtn={true}
      />

      <GeneralModal
        visible={ReportSuccess}
        closeModal={() => setReportSuccess(false)}
        icon={images.checkedIcon}
        title="Reject Order"
        message="Order has been rejected successfully."
        buttonText="Ok"
        primaryBtn={true}
        onPress={() => {
          setReportSuccess(false);
          navigation.goBack();
        }}
      />

      {/* Assign Delivery Modal */}
      <AssignDeliveryModal
        visible={assignDeliveryModalVisible}
        closeModal={() => setAssignDeliveryModalVisible(false)}
        onAssign={handleRiderAssignment}
        selectedValue={selectedRiderId}
        onValueChange={setSelectedRiderId}
      />
    </View>
  );
};

export default MyOrderDetail;
