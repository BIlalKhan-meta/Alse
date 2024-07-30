// src/screens/MyOrderDetailScreen.tsx
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CartItem from '../../components/CartItem';
import styles from './styles';
import Summary from '../../components/SummaryComponent';
import StatusBadge from '../../components/StatusBadge';
import InfoSection from '../../components/InfoSection';
import Card from '../../components/Card';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import { images } from '../../utils/images';
import GeneralModal from '../../components/GeneralModal';
import { products } from '../../dummyData';
import CustomButton from '../../components/CustomButton';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import InterBoldAverage from '../../components/Text/InterBoldAverage';
// import OrderSummary from '../components/OrderSummary';
// import ContactInformation from '../components/ContactInformation';
// import AddressInformation from '../components/AddressInformation';
// import OrderItem from '../components/OrderItem';
// import { vw, vh } from '../constants';


const contactInfo = [
    { heading: 'Username', value: 'Tom Albert' },
    { heading: 'Phone Number', value: '+91 256 8569 5654' },
    { heading: 'Email', value: 'tomalbert@gmail.com' },
];

const shippingAddress = [
    { heading: 'Customer Name', value: 'Tom Albert' },
    { heading: 'Phone Number', value: '+91 256 8569 5654' },
    { heading: 'Address', value: 'Lorem ipsum dolor sit' },
    { heading: 'Country', value: 'United States' },
    { heading: 'State', value: 'California' },
    { heading: 'City', value: 'Xyz' },
    { heading: 'Zip Code', value: '15687' },
];

const billingAddress = [
    { heading: 'Customer Name', value: 'Tom Albert' },
    { heading: 'Phone Number', value: '+91 256 8569 5654' },
    { heading: 'Address', value: 'Lorem ipsum dolor sit' },
    { heading: 'Country', value: 'United States' },
    { heading: 'State', value: 'California' },
    { heading: 'City', value: 'Xyz' },
    { heading: 'Zip Code', value: '15687' },
];

const orderSummary = [
    { heading: 'Sub Total', value: '$80.00' },
    { heading: 'Admin Commission', value: '5%' },
    { heading: 'Total', value: '$90.00' },
];
const MyOrderDetail: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    console.log(route, "order detail route")
    const status = route?.params?.status;
    const title = route?.params?.title;
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportInput, setReportInput] = useState(false);
    const [ReportSuccess, setReportSuccess] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({

            title: title,


        });
    }, [navigation]);


    console.log(title, "Storeee ORderrr")

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >

            <View style={styles.container}>

                <View style={styles.orderInfo}>
                    <View>
                        <InterMedium style={styles.orderId}>Order Id: 541554</InterMedium>
                        <InterMedium style={styles.orderDate}>Order Date: 01/01/2024</InterMedium>
                    </View>

                    <View>

                        <StatusBadge status={status} />
                    </View>


                </View>
                <View>

                    <FlatList
                        data={products}
                        renderItem={({ item, index }) => (
                            <CartItem
                                item={item}
                                showQuantityControls={false}
                                showSeparator={index !== products.length - 1}
                                quantity={1}
                                // showDelete={title === "Store Order Detail" ? false : true}
                                showDelete={false}
                            />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>

                <View style={styles.summaryContainer}>
                    <Summary
                        subTotal={90}
                        deliveryCharges={15}
                        discount={10}
                        grandTotal={95}
                        style={{ marginHorizontal: 2, }}
                        titleStyle={styles.titleStyle}

                    />

                    <Card>
                        <InfoSection title="Contact Information" data={contactInfo} />
                        <HorizontalSeparator />
                        <InfoSection title="Shipping Address" data={shippingAddress} />
                        <HorizontalSeparator />

                        <InfoSection title="Billing Address" data={billingAddress} />

                    </Card>

                    {status === "Cancelled" && (
                        <>
                            <InterBoldAverage style={styles.rejectHeading}>Cancellation Reason</InterBoldAverage>
                            <InterRegular style={styles.rejectValue}>
                                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution.
                            </InterRegular>
                        </>
                    )}


                    {status === "Pending" && title === 'Store Order Detail' &&
                        <View style={styles.btnConatiner}>

                            <CustomButton style={styles.acceptBtn}
                                onPress={() => {
                                    setOrderSuccess(true)
                                }}
                            >
                                Accept
                            </CustomButton>

                            <CustomButton style={styles.rejectBtn}
                                onPress={() => {
                                    setReportVisible(true)
                                }}
                            >
                                Rejected
                            </CustomButton>
                        </View>
                    }

                    <GeneralModal
                        visible={orderSuccess}
                        closeModal={() => setOrderSuccess(false)}
                        icon={images.doubleCheck}
                        title={'Accept Order'}
                        message='Order has been Accepted'
                        buttonText='Ok'
                        onPress={() => {
                            setOrderSuccess(false)
                        }}
                    />

                    <GeneralModal
                        visible={reportVisible}
                        closeModal={() => setReportVisible(false)}
                        icon={images.qmark}
                        title='Reject Order'
                        message='Are you sure you want to reject this Order?'
                        buttonText='Yes'
                        buttonText2='No'
                        onPress={() => {
                            setReportVisible(false)
                            setReportInput(true)

                        }}
                        smallButtons={true}
                    />

                    <GeneralModal
                        visible={reportInput}
                        closeModal={() => setReportInput(false)}
                        // icon={images.doubleCheck}
                        title='Reason Of Reject Order'
                        // message='Post has been delete successfully.'
                        buttonText='Ok'
                        inputVisible={true}
                        onPress={() => {
                            setReportInput(false)
                            setReportSuccess(true)
                        }}
                    />

                    <GeneralModal
                        visible={ReportSuccess}
                        closeModal={() => setReportSuccess(false)}
                        icon={images.doubleCheck}
                        title='Reject Order'
                        message='Order has been rejected successfully.'
                        buttonText='Ok'
                        onPress={() => {
                            setReportSuccess(false)
                        }}
                    />
                </View>

            </View>
        </ScrollView>
    );
};



export default MyOrderDetail;
