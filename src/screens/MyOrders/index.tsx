import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {images} from '../../utils/images';
import TabsComponent from '../../components/TabsComponent';
import FilterModal from '../../components/FilterModal';
import {colors} from '../../utils/theme';
import {getOrders} from '../../api/product';
import OrderCard from '../../components/CardOrder';

const MyOrders: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<
    'All' | 'pending' | 'delivered' | 'cancelled'
  >('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loader, setLoader] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      headerRight: () => (
        <View>
          <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
            <Image source={images.filter} style={styles.threeDots} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, modalVisible]);

  const getData = async () => {
    setLoader(true);
    await getOrders()
      .then(res => {
        if (res?.data) {
          setOrders(res?.data?.data?.data);
        }
      })
      .finally(() => {
        setLoader(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

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
          // filterStatus={true}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <TabsComponent
          tabs={['All', 'Pending', 'Delivered', 'Cancelled']}
          selectedTab={selectedTab}
          onTabPress={setSelectedTab}
        />
        <FlatList
          data={filteredOrders}
          refreshing={loader}
          onRefresh={getData}
          renderItem={({item}: any) => (
            <OrderCard key={item?.order_id} item={item} />
          )}
          keyExtractor={item => item?.order_id?.toString()}
          contentContainerStyle={styles.ordersContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MyOrders;
