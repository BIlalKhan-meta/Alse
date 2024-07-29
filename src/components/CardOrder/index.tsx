// OrderCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StatusBadge from '../StatusBadge';
import styles from './styles';
import Card from '../Card';
import { useNavigation } from '@react-navigation/native';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';

interface OrderCardProps {
    orderId: string;
    customerName: string;
    orderDate: string;
    amountPaid: string;
    status: 'Pending' | 'Cancelled' | 'Accepted' | 'Delivered';
    title: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ orderId, customerName, orderDate, amountPaid, status, title }) => {
    const navigation = useNavigation();
    return (
        <Card style={styles.card}>
            <TouchableOpacity
                onPress={() => navigation.navigate("MyOrderDetail", { status, title })}>

                <View style={styles.header}>
                    <InterMedium style={styles.orderId}>Order ID: {orderId}</InterMedium>
                    <StatusBadge status={status} />
                </View>
                <InterRegular style={styles.customerName}>{customerName}</InterRegular>
                <View style={styles.footer}>
                    <Text style={styles.orderId}>Order Date</Text>
                    <Text style={styles.orderId}>Amount Paid</Text>
                </View>
                <View style={styles.footer}>
                    <InterRegular style={styles.customerName}>{orderDate}</InterRegular>
                    <InterRegular style={styles.customerName}>{amountPaid}</InterRegular>
                </View>
            </TouchableOpacity>
        </Card>
    );
};



export default OrderCard;
