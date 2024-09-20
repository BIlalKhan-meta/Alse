import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import styles from './styles';
import { images } from '../../utils/images';
import Card from '../../components/Card';
import FilterModal from '../../components/FilterModal';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import { colors } from '../../utils/theme';

const PaymentLogs: React.FC = () => {
    const navigation = useNavigation();
    const [sortOption, setSortOption] = useState('orderDate');
    const [modalVisible, setModalVisible] = useState(false);
    const [fromDate, setFromDate] = useState<Date>(new Date());
    const [toDate, setToDate] = useState<Date>(new Date());
    const paymentLogs = [
        { orderId: '12569', customerName: 'Mark', orderDate: 'Sept 27, 2021', deliveryDate: 'Sept 29, 2021', amountPaid: '$2' },
        { orderId: '12569', customerName: 'Jason', orderDate: 'Sept 27, 2021', deliveryDate: 'Sept 29, 2021', amountPaid: '$2' },
        { orderId: '12569', customerName: 'Edward', orderDate: 'Sept 27, 2021', deliveryDate: 'Sept 29, 2021', amountPaid: '$2' },
        { orderId: '12569', customerName: 'James', orderDate: 'Sept 27, 2021', deliveryDate: 'Sept 29, 2021', amountPaid: '$2' },
    ];

    const handleSortChange = (value: string | null) => {
        setSortOption(value);
        console.log('Selected sort option:', value);
    };

    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerRight: () => (
    //             <View>
    //                 <TouchableOpacity onPress={() => {
    //                     setModalVisible(!modalVisible)
    //                 }}>
    //                     <Image
    //                         source={images.filter}
    //                         style={styles.filterIcon}
    //                     />
    //                 </TouchableOpacity>
    //             </View>
    //         ),
    //     });
    // }, [navigation]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },

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
                    style={{}}
                />
                <FlatList
                    data={paymentLogs}
                    renderItem={({ item }) => (
                        <Card style={styles.card}>
                            {/* <View style={[styles.topHead, { paddingTop: 0 }]}>
                                <InterMedium style={styles.heading}>Order ID: {item.orderId}</InterMedium>
                                <InterMedium style={styles.heading}>Delivery Date</InterMedium>
                            </View>
                            <View style={styles.topHead}>
                                <InterRegular style={styles.value}>{item.customerName}</InterRegular>
                                <InterRegular style={styles.value}>{item.deliveryDate}</InterRegular>
                            </View> */}

                            <View style={styles.topHead}>
                                <InterMedium style={styles.heading}>Username</InterMedium>
                                <InterMedium style={styles.heading}>Amount Paid</InterMedium>
                            </View>
                            <View style={styles.topHead}>
                                <View style={styles.topValue}>
                                    <InterRegular style={styles.value}>{item.customerName}</InterRegular>
                                </View>
                                <View style={styles.topValue}>
                                    <InterRegular style={styles.value}>{item.amountPaid}</InterRegular>
                                </View>
                            </View>

                            <View style={styles.topHead}>
                                <InterMedium style={styles.heading}>Order Date</InterMedium>
                                <InterMedium style={styles.heading}>Order Number</InterMedium>
                            </View>
                            <View style={styles.topHead}>
                                <InterRegular style={styles.value}>{item.orderDate}</InterRegular>
                                <InterRegular style={styles.value}>{item.orderId}</InterRegular>
                            </View>

                        </Card>
                    )}
                    keyExtractor={item => item.orderId + item.customerName}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default PaymentLogs;
