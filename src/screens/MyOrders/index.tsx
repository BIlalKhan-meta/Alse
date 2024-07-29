import React, { useLayoutEffect, useState } from 'react';
import { View, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import { images } from '../../utils/images';
import TabsComponent from '../../components/TabsComponent';
import OrderListComponent from '../../components/OrderListComponent';
import FilterModal from '../../components/FilterModal';

const MyOrders: React.FC = () => {
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState<'All' | 'Pending' | 'Delivered' | 'Cancelled'>('All');
    const [modalVisible, setModalVisible] = useState(false);
    const [fromDate, setFromDate] = useState<Date>(new Date());
    const [toDate, setToDate] = useState<Date>(new Date());
    const [selectedStatus, setSelectedStatus] = useState<string>('All');

    const orders = [
        { orderId: '12569', customerName: 'Ad Abc', orderDate: 'Sept 27, 2021', amountPaid: '$2', status: 'Pending' },
        { orderId: '12569', customerName: 'Ad Abc', orderDate: 'Sept 27, 2021', amountPaid: '$2', status: 'Cancelled' },
        { orderId: '12569', customerName: 'Ad Abc', orderDate: 'Sept 27, 2021', amountPaid: '$2', status: 'Delivered' },
        { orderId: '12569', customerName: 'Ad Abc', orderDate: 'Sept 27, 2021', amountPaid: '$2', status: 'Delivered' },
    ];

    // const filteredOrders = (selectedStatus === 'All' ? orders : selectedTab === 'All' ? orders : orders.filter(order => order.status === selectedStatus));
    const filteredOrders = orders.filter(order => {
        const tabCondition = selectedTab === 'All' || order.status === selectedTab;
        const statusCondition = selectedStatus === 'All' || order.status === selectedStatus;
        return tabCondition && statusCondition;
    });

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View>
                    <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
                        <Image source={images.filter} style={styles.threeDots} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    return (
        <TouchableWithoutFeedback
            onPress={() => setModalVisible(false)}
        >
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
                    style={{}}
                />

                <TabsComponent
                    tabs={['All', 'Pending', 'Delivered', 'Cancelled',]}
                    selectedTab={selectedTab}
                    onTabPress={setSelectedTab}
                />

                <OrderListComponent
                    orders={filteredOrders}
                    title={"My Order Detail"}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default MyOrders;
