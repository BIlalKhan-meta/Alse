// OrderListComponent.tsx
import React from 'react';
import { FlatList, ViewStyle, StyleProp } from 'react-native';
import OrderCard from '../../components/CardOrder';
import styles from './styles';
// import styles from './styles';

interface OrderListComponentProps {
    orders: { orderId: string; customerName: string; orderDate: string; amountPaid: string; status: string; }[];
    containerStyle?: StyleProp<ViewStyle>;
    title: string;
}

const OrderListComponent: React.FC<OrderListComponentProps> = ({ orders, containerStyle, title }) => {
    return (
        <FlatList
            data={orders}
            renderItem={({ item }) => <OrderCard key={item.orderId} {...item} title={title} />}
            keyExtractor={item => item.orderId}
            contentContainerStyle={[styles.ordersContainer, containerStyle]}
            showsVerticalScrollIndicator={false}
        />
    );
};

export default OrderListComponent;
