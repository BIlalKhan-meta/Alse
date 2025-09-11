import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import styles from './styles';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {images} from '../../utils/images';
import TabsComponent from '../../components/TabsComponent';
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

const EmptyOrders = () => <EmptyComponent text="No orders found" />;

const MyOrders: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  console.log('props =====>', (route?.params as any)?.MyOrder);
  const [selectedTab, setSelectedTab] = useState<
    'All' | 'pending' | 'delivered' | 'cancelled'
  >('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);

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

  const getData = useCallback(async () => {
    setLoader(true);
    let callback;

    if (isMyOrder) {
      // If it's a shop order, use getShopOrders with shopId
      if (shopId) {
        callback = () => getShopOrders(shopId);
      } else {
        callback = getMyOrders;
      }
    } else {
      callback = getOrders;
    }

    await callback()
      .then(res => {
        console.log('res from ', res?.data?.data?.data);

        if (res?.data) {
          setOrders(res?.data?.data?.data);
        }
      })
      .catch(err => {
        console.log('Error fetching orders:', err);
        setLoader(false);
      })
      .finally(() => {
        setLoader(false);
      });
  }, [isMyOrder, shopId]);
  const isFocused = useIsFocused();
  useEffect(() => {
    getData();
  }, [isFocused, getData]);

  useEffect(() => {
    // Filter orders based on the selected tab
    const filterOrders = () => {
      let filtered = [...orders];
      if (selectedTab !== 'All') {
        filtered = filtered.filter(
          order => order?.status === selectedTab.toLowerCase(),
        );
      }

      // If you want to apply additional filters (e.g., by date or status)
      // if (selectedStatus !== 'All') {
      //   filtered = filtered.filter(order => order?.status === selectedStatus);
      // }

      // Apply date filters if any (you can extend this part)
      if (fromDate && toDate) {
        filtered = filtered.filter(
          order =>
            new Date(order?.date) >= fromDate &&
            new Date(order?.date) <= toDate,
        );
      }

      setFilteredOrders(filtered);
    };

    filterOrders(); // Run the filtering function whenever the orders or selectedTab changes
  }, [orders, selectedTab, selectedStatus, fromDate, toDate]);

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
        <TabsComponent
          tabs={['All', 'Pending', 'Delivered', 'Accepted', 'Cancelled']}
          selectedTab={selectedTab}
          onTabPress={(tab: string) => setSelectedTab(tab as any)}
          activeTabStyle={{
            paddingHorizontal: vw * 3,
          }}
        />
        <FlatList
          data={filteredOrders}
          refreshing={loader}
          onRefresh={getData}
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
          ListEmptyComponent={EmptyOrders}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MyOrders;
