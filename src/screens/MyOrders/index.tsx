import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  FlatList,
  Text,
  TextInput,
} from 'react-native';
import styles from './styles';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {images} from '../../utils/images';
import FilterModal from '../../components/FilterModal';
import {colors} from '../../utils/theme';
import {getMyOrders, getOrders, getShopOrders} from '../../api/product';
import OrderCard from '../../components/CardOrder';
import {EmptyComponent} from '../../components/EmptyComponent';
import {vw} from '../../constant';

const HeaderRight = ({onPress}: {onPress: () => void}) => (
  <View>
    <TouchableOpacity onPress={onPress}>
      <Image source={images.filter} style={styles.threeDots} />
    </TouchableOpacity>
  </View>
);

const EmptyOrders = ({
  error,
  onRetry,
  shopId,
  isMyOrder,
}: {
  error?: string | null;
  onRetry?: () => void;
  shopId?: number;
  isMyOrder?: boolean;
}) => (
  <View style={{padding: 20, alignItems: 'center'}}>
    <EmptyComponent text="No orders found" />
    {error && (
      <View
        style={{
          marginTop: 20,
          padding: 15,
          backgroundColor: '#ffebee',
          borderRadius: 8,
          width: '100%',
        }}>
        <Text style={{color: '#c62828', textAlign: 'center', marginBottom: 10}}>
          Debug Info:
        </Text>
        <Text
          style={{
            color: '#666',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 10,
          }}>
          {error}
        </Text>
        {isMyOrder && shopId && (
          <Text
            style={{
              color: '#666',
              fontSize: 12,
              textAlign: 'center',
              marginBottom: 10,
            }}>
            Shop ID: {shopId}
          </Text>
        )}
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={{
              backgroundColor: '#00A19D',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 5,
              marginTop: 10,
            }}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

const LoadingFooter = ({
  loadingMore,
  hasNextPage,
  totalOrders,
}: {
  loadingMore: boolean;
  hasNextPage: boolean;
  totalOrders: number;
}) => {
  if (!loadingMore && !hasNextPage && totalOrders > 0) {
    return (
      <View style={{padding: 20, alignItems: 'center'}}>
        <Text style={{color: '#666', fontSize: 14}}>
          All {totalOrders} orders loaded
        </Text>
      </View>
    );
  }

  if (loadingMore) {
    return (
      <View style={{padding: 20, alignItems: 'center'}}>
        <Text style={{color: '#666', fontSize: 14, marginBottom: 10}}>
          Loading more orders...
        </Text>
      </View>
    );
  }

  return null;
};

const MyOrders: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  console.log('props =====>', (route?.params as any)?.MyOrder);
  const [modalVisible, setModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);

  useLayoutEffect(() => {
    const headerRightComponent = () => (
      <HeaderRight onPress={() => setModalVisible(!modalVisible)} />
    );

    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      headerRight: headerRightComponent,
    });
  }, [navigation, modalVisible]);

  const isMyOrder = (route?.params as any)?.MyOrder;
  const shopId = (route?.params as any)?.shopId;

  const getData = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoader(true);
        setCurrentPage(1);
        setOrders([]);
      }

      let callback;

      if (isMyOrder) {
        // If it's a shop order, use getShopOrders with shopId
        if (shopId) {
          console.log(
            `Fetching shop orders for shopId: ${shopId}, page: ${page}`,
          );
          callback = () => getShopOrders(shopId, {page, per_page: 15});
        } else {
          console.log(`Fetching my orders (no shopId), page: ${page}`);
          callback = () => getMyOrders({page, per_page: 15});
        }
      } else {
        console.log(`Fetching all orders, page: ${page}`);
        callback = () => getOrders({page, per_page: 15});
      }

      try {
        const res = await callback();
        console.log('Full API response:', JSON.stringify(res?.data, null, 2));
        console.log('Response status:', res?.data?.status);
        console.log('Response message:', res?.data?.message);
        console.log('Orders data structure:', res?.data?.data);
        console.log('Orders array:', res?.data?.data?.data);
        console.log('Pagination meta:', res?.data?.data?.meta);

        setError(null); // Clear any previous errors

        let newOrders: any[] = [];
        let paginationMeta: any = null;

        if (res?.data?.status === true && res?.data?.data?.data) {
          newOrders = res.data.data.data;
          paginationMeta = res.data.data.meta;
          console.log(
            `Successfully loaded ${newOrders.length} orders from page ${page}`,
          );
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          // Fallback: if data is directly an array
          newOrders = res.data.data;
          console.log(
            `Successfully loaded ${newOrders.length} orders (fallback) from page ${page}`,
          );
        } else {
          console.log('No orders found or invalid response structure');
          newOrders = [];
          if (isMyOrder && shopId && page === 1) {
            setError(
              `No orders found for shop ID: ${shopId}. This might be a backend issue or the order hasn't been processed yet.`,
            );
          }
        }

        // Update orders list
        if (append) {
          setOrders(prevOrders => [...prevOrders, ...newOrders]);
        } else {
          setOrders(newOrders);
        }

        // Update pagination state
        if (paginationMeta) {
          setCurrentPage(paginationMeta.current_page);
          setHasNextPage(
            paginationMeta.current_page < paginationMeta.last_page,
          );
          setTotalOrders(paginationMeta.total);
          console.log(
            `Pagination: page ${paginationMeta.current_page}/${
              paginationMeta.last_page
            }, total: ${paginationMeta.total}, hasNext: ${
              paginationMeta.current_page < paginationMeta.last_page
            }`,
          );
        } else {
          setHasNextPage(newOrders.length === 15); // Assume has next page if we got a full page
        }
      } catch (err: any) {
        console.log('Error fetching orders:', err);
        console.log('Error details:', err?.response?.data);
        if (!append) {
          setOrders([]);
        }
        setError(`Failed to fetch orders: ${err?.message || 'Unknown error'}`);
      } finally {
        setLoader(false);
        setLoadingMore(false);
        setLastRefresh(new Date());
      }
    },
    [isMyOrder, shopId],
  );
  const isFocused = useIsFocused();
  useEffect(() => {
    getData(1, false); // Reset to first page
  }, [isFocused, getData]);

  // Load more orders when reaching the end
  const loadMoreOrders = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      console.log(
        `Loading more orders, current page: ${currentPage}, next page: ${
          currentPage + 1
        }`,
      );
      getData(currentPage + 1, true);
    }
  }, [loadingMore, hasNextPage, currentPage, getData]);

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    if (fromDate && toDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order?.date || order?.created_at || 0);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(order => {
        const status = (order?.status || '').toLowerCase();
        return status === selectedStatus.toLowerCase();
      });
    }
    if (searchText?.trim()) {
      const term = searchText.trim().toLowerCase();
      filtered = filtered.filter(o => {
        const primaryTitle = o?.product?.title;
        const nestedTitle = o?.order_details?.[0]?.product?.title;
        const name = primaryTitle || nestedTitle || '';
        const id = String(o?.order_id || o?.id || '');
        return name.toLowerCase().includes(term) || id.includes(term);
      });
    }
    return filtered;
  }, [orders, fromDate, toDate, selectedStatus, searchText]);

  return (
    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
      <View style={styles.container}>
        <FilterModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          style={{}}
        />
        {/* Debug Info Header */}
        {/* {isMyOrder && shopId && (
          <View
            style={{
              backgroundColor: '#f0f0f0',
              padding: 10,
              marginHorizontal: 16,
              borderRadius: 8,
              marginBottom: 10,
            }}>
            <Text style={{fontSize: 12, color: '#666', textAlign: 'center'}}>
              Shop Orders Debug - Shop ID: {shopId} | Page: {currentPage} |
              Total: {totalOrders} | Last Refresh:{' '}
              {lastRefresh.toLocaleTimeString()}
            </Text>
            {error && (
              <Text
                style={{
                  fontSize: 10,
                  color: '#c62828',
                  textAlign: 'center',
                  marginTop: 5,
                }}>
                Error: {error}
              </Text>
            )}
          </View>
        )} */}

        {/* Top search bar */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            height: 40,
            marginHorizontal: vw * 2,
            marginBottom: 12,
          }}>
          <Image
            source={images.search}
            style={{width: 16, height: 16, tintColor: '#8A8A8A'}}
          />
          <TextInput
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            style={{flex: 1, marginLeft: 8, color: '#111'}}
            placeholderTextColor="#9AA0A6"
          />
        </View>

        {/* Title row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: vw * 2,
            marginBottom: 6,
          }}>
          <Text style={{color: '#6D6D6D'}}>Order Management</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: '#6D6D6D', marginRight: 6}}>Filters</Text>
            <Image
              source={images.filter}
              style={{width: 16, height: 16, tintColor: '#6D6D6D'}}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredOrders}
          refreshing={loader}
          onRefresh={() => getData(1, false)}
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.1}
          renderItem={({item}: any) => {
            return (
              <OrderCard
                key={item?.order_id}
                item={item}
                onPress={() =>
                  (navigation as any).navigate('MyOrderDetail', {
                    id: item?.order_id,
                    StoreOrder: (route?.params as any)?.MyOrder,
                  })
                }
              />
            );
          }}
          keyExtractor={item => item?.order_id?.toString()}
          contentContainerStyle={styles.ordersContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyOrders
              error={error}
              onRetry={() => getData(1, false)}
              shopId={shopId}
              isMyOrder={isMyOrder}
            />
          }
          ListFooterComponent={
            <LoadingFooter
              loadingMore={loadingMore}
              hasNextPage={hasNextPage}
              totalOrders={totalOrders}
            />
          }
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MyOrders;
