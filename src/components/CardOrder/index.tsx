// OrderCard.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import StatusBadge from '../StatusBadge';
import styles from './styles';
import Card from '../Card';
import {useNavigation} from '@react-navigation/native';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import {useTranslation} from 'react-i18next';

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
  onPress?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({item, onPress}) => {
  const {t} = useTranslation();
  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.header}>
          <InterMedium style={styles.orderId}>
            Order ID: {item?.order_id}
          </InterMedium>
          <StatusBadge status={item?.status} />
        </View>
        {/* <InterRegular style={styles.customerName}>{customerName}</InterRegular> */}
        <View style={styles.footer}>
          <Text style={styles.orderId}>{t('order.orderDate')}</Text>
          <Text style={styles.orderId}>{t('order.paidAmount')}</Text>
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
