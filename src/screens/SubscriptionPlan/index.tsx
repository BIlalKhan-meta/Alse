import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Linking } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import styles from './styles';
import CustomButton from '../../components/CustomButton';
import Card from '../../components/Card';
import { vh, vw } from '../../constant';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { GetSubscriptions, makePayment } from '../../api/subscription';
import { getMessage, Toast } from '../../utils/helpers';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { GetUserProfile } from '../../store/slices/authSlice';

const { width: viewportWidth } = Dimensions.get('window');

const plans = [
    {
        title: 'Monthly',
        description: [
            'It is a long established fact that a reader will be distracted by the readable',
            'It is a long established fact that a reader will be distracted by the readable',
            'It is a long established fact that a reader will be distracted by the readable',
            'It is a long established fact that a reader will be distracted by the readable',
            'It is a long established fact that a reader will be distracted by the readable',
        ],
        price: '$10'
    },
    {
        title: 'Yearly',
        description: [
            'It is a long established fact that a reader will be distracted by the readable',
            'It is a long established fact that a reader will be distracted by the readable',
            'It is a long established fact that a reader will be distracted by the readable',
            'It is a long established fact that a reader will be distracted by the readable',
            'It is a long established fact that a reader will be distracted by the readable',
        ],
        price: '$50'
    }
];



const SubscriptionPlan: React.FC = () => {
    const navigation = useNavigation();
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [loading, setLoading] = useState(false);



    const getApi = async () => {
        setLoading(true);
        const res = await GetSubscriptions();
        console.log('====================================');
        console.log(res?.data?.data, "Subscriptionnn resss");
        console.log('====================================');
        setSubscriptionPlans(res?.data?.data);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            getApi();
        }, []),
    );


    const sleep = async timeout => {
        return new Promise(resolve => setTimeout(resolve, timeout));
    };

    const openLink = async url => {
        try {
            if (await InAppBrowser.isAvailable()) {
                const result = await InAppBrowser.open(url);
                if (result) {
                    loadData();
                }
                await sleep(800);
                console.log('Inappppp result', result);

                if (result?.type === 'dismiss') {
                    loadData();
                }
                // if (isSubscribed) {
                //   navigate('DrawerNavigation1');
                // }
                // RNRestart.restart();
            } else Linking.openURL(url);
        } catch (error) {

            Toast.error(getMessage(error?.message));

        }
    };

    const onChoosePlan = async (id: number) => {
        console.log(id, 'IDdddddd');
        try {
            const apiData = {
                plan_id: id,
            };

            let formData = new FormData();

            Object.entries(apiData).forEach(item => {
                formData.append(item[0], item[1]);
            });

            const response = await makePayment(formData);
            console.log(response?.data?.data?.url, 'Response Fromm screen makingg paymentttttt');
            if (response) {
                openLink(response?.data?.data?.url);
            }
        } catch (error) {

            Toast.error(getMessage(error?.message));

        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            await GetUserProfile();
            setLoading(false);
        } catch (e) {
            setLoading(false);
            console.log('Error', e);
        }
    };


    const renderItem = ({ item }) => (
        <View style={styles.planDetails}>

            <View>
                <Text style={styles.planTitle}>{item.name}</Text>
                <Text style={styles.planDescription}> {item.description}</Text>
                <Text style={styles.price}>Price: {item.price}</Text>
            </View>
            <CustomButton style={styles.button}
                onPress={() => onChoosePlan(item.id)}
            >
                Choose Plan
            </CustomButton>
        </View>
    );



    return (

        <ScrollView contentContainerStyle={styles.container}>
            <Card>
                <View style={styles.carasouelContainer}>
                    <Carousel
                        data={subscriptionPlans}
                        renderItem={renderItem}
                        sliderWidth={viewportWidth}
                        // itemWidth={viewportWidth * 0.6}
                        itemWidth={vw * 70}
                        layout={'default'}
                    />
                </View>
                <CustomButton style={styles.logButton}
                    onPress={() => navigation.navigate("SubscriptionLogs")}
                >
                    View Subscription Log
                </CustomButton>
            </Card>
        </ScrollView>
    );
};



export default SubscriptionPlan;
