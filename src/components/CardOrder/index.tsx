// OrderCard.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import StatusBadge from '../StatusBadge';
import styles from './styles';
import Card from '../Card';
import {useNavigation} from '@react-navigation/native';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';

type TOrder = {
  order_id: number;
  total_amount: number;
  discounted_amount: number;
  delivery_charges: number;
  paid_amount: number;
  status: string;
  date: string;
};

interface OrderCardProps {
  item: TOrder;
}

const OrderCard: React.FC<OrderCardProps> = ({item}) => {
  const navigation = useNavigation();
  return (
    <Card style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('MyOrderDetail', {id: item?.order_id})
        }>
        <View style={styles.header}>
          <InterMedium style={styles.orderId}>
            Order ID: {item?.order_id}
          </InterMedium>
          <StatusBadge status={item?.status} />
        </View>
        {/* <InterRegular style={styles.customerName}>{customerName}</InterRegular> */}
        <View style={styles.footer}>
          <Text style={styles.orderId}>Order Date</Text>
          <Text style={styles.orderId}>Amount Paid</Text>
        </View>
        <View style={styles.footer}>
          <InterRegular style={styles.customerName}>{item?.date}</InterRegular>
          <InterRegular style={styles.customerName}>
            ${item?.paid_amount}
          </InterRegular>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

export default OrderCard;
