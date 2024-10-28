import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import FilterModal from '../../components/FilterModal';
import styles from './styles';
import { images } from '../../utils/images';
import Card from '../../components/Card';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import { colors } from '../../utils/theme';
import { GetSubscriptionsLogs } from '../../api/subscription';
import moment from 'moment';
import { current } from '@reduxjs/toolkit';

// Sample data with ISO date formats for better comparison
const subscriptionLogs = [
    { subscriptionId: 'A123', customerName: 'Mark', expirationDate: '2024-11-15', subscriptionDate: '2024-01-15', type: 'Monthly', price: '$10' },
    { subscriptionId: 'A124', customerName: 'Jason', expirationDate: '2024-02-10', subscriptionDate: '2023-02-10', type: 'Yearly', price: '$100' }, // Past subscription
    { subscriptionId: 'A125', customerName: 'Edward', expirationDate: '2024-03-05', subscriptionDate: '2024-03-05', type: 'Monthly', price: '$10' },
    { subscriptionId: 'A126', customerName: 'James', expirationDate: '2024-04-20', subscriptionDate: '2023-04-20', type: 'Yearly', price: '$100' }, // Past subscription
];

const SubscriptionLogs: React.FC = () => {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [fromDate, setFromDate] = useState<Date>(new Date());
    const [toDate, setToDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
    const [subscriptionLogs, setSubscriptionLogs] = useState([]);
    const [pastSubscriptionLogs, setPastSubscriptionLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    // Function to check if a subscription is current based on today's date
    // const isCurrentSubscription = (subscriptionDate: string, expirationDate: string): boolean => {
    //     const today = new Date();
    //     const subscription = new Date(subscriptionDate);
    //     const expiration = new Date(expirationDate);
    //     return subscription <= today && today <= expiration;
    // };

    // // Filter subscriptions based on the selected tab
    // const filteredSubscriptions = subscriptionLogs.filter(subscription => {
    //     if (activeTab === 'current') {
    //         return isCurrentSubscription(subscription.subscriptionDate, subscription.expirationDate);
    //     } else {
    //         return !isCurrentSubscription(subscription.subscriptionDate, subscription.expirationDate);
    //     }
    // });


    const getApi = async () => {
        setLoading(true);
        const res = await GetSubscriptionsLogs();
        console.log('====================================');
        console.log(res?.data?.data?.current, "Subscriptionnn resss");
        console.log('====================================');
        if (res?.data?.data?.current) {

            setSubscriptionLogs(res?.data?.data?.current);
        } else {
            setPastSubscriptionLogs(res?.data?.data?.past)
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            getApi();
        }, []),
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <InterRegular style={styles.emptyText}>No Subscription to Show.</InterRegular>
        </View>
    );

    console.log(subscriptionLogs)



    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },

        });
    }, [navigation,]);

    return (
        <View style={styles.container}>


            <View style={styles.sortContainer}>
                <TouchableOpacity
                    style={[styles.sortButton, activeTab === 'current' && styles.activeTab]}
                    onPress={() => setActiveTab('current')}
                >
                    <InterMedium style={[styles.sortLabel, activeTab === 'current' && styles.activelabel]}>Current Subscription</InterMedium>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortButton, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <InterMedium style={[styles.sortLabel, activeTab === 'past' && styles.activelabel]}>Past Subscription</InterMedium>
                </TouchableOpacity>
            </View>

            {activeTab == "current" ? (
                <>

                    {subscriptionLogs !== [] ? (

                        <Card style={styles.card}>
                            <View style={styles.topHead}>
                                <InterMedium style={styles.heading}>Subscription Type</InterMedium>
                                <InterMedium style={styles.heading}>$ {subscriptionLogs?.price}</InterMedium>
                            </View>
                            <View style={styles.topHead}>
                                <InterRegular style={styles.value}>{subscriptionLogs?.plan_name}</InterRegular>
                                <InterRegular style={styles.value}>{null}</InterRegular>
                            </View>

                            <View style={styles.topHead}>
                                <InterMedium style={styles.heading}>Subscribed On</InterMedium>
                                {activeTab !== 'past' && <InterMedium style={styles.heading}>Expires On</InterMedium>}
                            </View>
                            <View style={styles.topHead}>
                                <InterRegular style={styles.value}>{subscriptionLogs?.date}</InterRegular>
                                {activeTab !== 'past' && <InterRegular style={styles.value}>{moment(subscriptionLogs?.end_at).format("YYYY-MM-DD")}</InterRegular>}
                            </View>
                        </Card>
                    ) : (
                        renderEmpty()
                    )}
                </>

            ) : (
                <FlatList
                    data={pastSubscriptionLogs}
                    renderItem={({ item }) => (
                        <Card style={styles.card}>
                            <View style={styles.topHead}>
                                <InterMedium style={styles.heading}>Subscription Type</InterMedium>
                                <InterMedium style={styles.heading}>$ {item.price}</InterMedium>
                            </View>
                            <View style={styles.topHead}>
                                <InterRegular style={styles.value}>{item.plan_name}</InterRegular>
                                <InterRegular style={styles.value}>{null}</InterRegular>
                            </View>

                            <View style={styles.topHead}>
                                <InterMedium style={styles.heading}>Subscribed On</InterMedium>
                                {activeTab !== 'past' && <InterMedium style={styles.heading}>Expires On</InterMedium>}
                            </View>
                            <View style={styles.topHead}>
                                <InterRegular style={styles.value}>{item.date}</InterRegular>
                                {activeTab !== 'past' && <InterRegular style={styles.value}>{moment(item.end_at).format("YYYY-MM-DD")}</InterRegular>}
                            </View>
                        </Card>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}

                />
            )}


        </View>
    );
};

export default SubscriptionLogs;
