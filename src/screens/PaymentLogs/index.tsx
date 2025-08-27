import React, {useState, useEffect} from 'react';
import {View, FlatList, TouchableOpacity, RefreshControl} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import styles from './styles';
import Card from '../../components/Card';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import {colors} from '../../utils/theme';
import {getPaymentLogs} from '../../api/product';
import {dateHelper} from '../../utils';
import Loader from '../../components/Loader';

// Define the PaymentLog interface based on the expected API response
interface PaymentLog {
  id: number;
  user_name: string;
  amount: number;
  date: string;
  order_id: string;
  payment_method?: string;
  status?: string;
  transaction_id?: string;
}

const PaymentLogs: React.FC = () => {
  const [data, setData] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const getData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getPaymentLogs();
      console.log('PaymentLogs API Response:', res?.data);

      if (res?.data?.status && res?.data?.data?.data) {
        setData(res.data.data.data);
        console.log('Payment logs data:', res.data.data.data);
      } else {
        setData([]);
        console.log('No payment logs data available');
      }
    } catch (err) {
      console.error('Error fetching payment logs:', err);
      setError('Failed to load payment logs. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    getData(true);
  };

  useEffect(() => {
    getData();
  }, [isFocused]);

  const renderPaymentLogItem = ({item}: {item: PaymentLog}) => (
    <Card style={styles.card}>
      <View style={styles.topHead}>
        <InterMedium style={styles.heading}>Username</InterMedium>
        <InterMedium style={styles.heading}>Amount Paid</InterMedium>
      </View>
      <View style={styles.topHead}>
        <View style={styles.topValue}>
          <InterRegular style={styles.value}>
            {item?.user_name || 'N/A'}
          </InterRegular>
        </View>
        <View style={styles.topValue}>
          <InterRegular style={styles.value}>
            ${item?.amount?.toFixed(2) || '0.00'}
          </InterRegular>
        </View>
      </View>

      <View style={styles.topHead}>
        <InterMedium style={styles.heading}>Order Date</InterMedium>
        <InterMedium style={styles.heading}>Order Number</InterMedium>
      </View>
      <View style={styles.topHead}>
        <InterRegular style={styles.value}>
          {item?.date ? dateHelper(item.date) : 'N/A'}
        </InterRegular>
        <InterRegular style={styles.value}>
          #{item?.order_id || 'N/A'}
        </InterRegular>
      </View>

      {/* Additional payment information if available */}
      {(item?.payment_method || item?.status || item?.transaction_id) && (
        <>
          <View style={styles.topHead}>
            {item?.payment_method && (
              <InterMedium style={styles.heading}>Payment Method</InterMedium>
            )}
            {item?.status && (
              <InterMedium style={styles.heading}>Status</InterMedium>
            )}
          </View>
          <View style={styles.topHead}>
            {item?.payment_method && (
              <InterRegular style={styles.value}>
                {item.payment_method}
              </InterRegular>
            )}
            {item?.status && (
              <InterRegular
                style={[
                  styles.value,
                  {
                    color:
                      item.status === 'completed'
                        ? colors.themeColor
                        : colors.darkGray,
                  },
                ]}>
                {item.status}
              </InterRegular>
            )}
          </View>
          {item?.transaction_id && (
            <>
              <View style={styles.topHead}>
                <InterMedium style={styles.heading}>Transaction ID</InterMedium>
              </View>
              <View style={styles.topHead}>
                <InterRegular style={styles.value}>
                  {item.transaction_id}
                </InterRegular>
              </View>
            </>
          )}
        </>
      )}
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.container}>
      <InterMedium style={styles.heading}>No Payment Logs</InterMedium>
      <InterRegular style={styles.value}>
        {error ||
          "You haven't made any payments yet. Your payment history will appear here."}
      </InterRegular>
      {error && (
        <TouchableOpacity style={styles.card} onPress={() => getData()}>
          <InterMedium style={styles.heading}>Retry</InterMedium>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderPaymentLogItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        contentContainerStyle={[
          styles.listContainer,
          data.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.themeColor]}
            tintColor={colors.themeColor}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

export default PaymentLogs;
