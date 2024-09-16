import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import styles from './styles';
import CustomButton from '../../components/CustomButton';
import Card from '../../components/Card';
import { vh, vw } from '../../constant';
import { useNavigation } from '@react-navigation/native';

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

    const renderItem = ({ item }) => (
        <View style={styles.planDetails}>
            <Text style={styles.planTitle}>{item.title}</Text>
            {item.description.map((desc, index) => (
                <Text key={index} style={styles.planDescription}>• {desc}</Text>
            ))}
            <Text style={styles.price}>Price: {item.price}</Text>
            <CustomButton style={styles.button}
                onPress={() => navigation.navigate("Payment")}
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
                        data={plans}
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
