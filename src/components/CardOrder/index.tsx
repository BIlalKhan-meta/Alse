// OrderCard.tsx
import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import styles from './styles';
import Card from '../Card';
import InterRegular from '../Text/InterRegular';
import InterMedium from '../Text/InterMedium';

type TOrder = {
  order_id?: number | string;
  id?: number | string;
  total_amount?: number | string;
  paid_amount?: number | string;
  status?: string;
  date?: string;
  created_at?: string;
  order_details?: Array<{
    product?: {
      title?: string;
      images?: Array<{path?: string}>;
      banner?: string;
    };
    quantity?: number;
  }>;
  product?: {title?: string; images?: Array<{path?: string}>; banner?: string};
  quantity?: number;
};

interface OrderCardProps {
  item: TOrder;
  onPress?: () => void;
}

const getStatusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'delivered':
    case 'shipped':
      return '#2ecc71';
    case 'pending':
    case 'processing':
      return '#3498db';
    case 'cancelled':
    case 'rejected':
      return '#e74c3c';
    case 'accepted':
      return '#8e44ad';
    default:
      return '#6D6D6D';
  }
};

const OrderCard: React.FC<OrderCardProps> = ({item, onPress}) => {
  const thumbnail = useMemo(() => {
    const fromItem = item?.product?.images?.[0]?.path || item?.product?.banner;
    const fromDetail =
      item?.order_details?.[0]?.product?.images?.[0]?.path ||
      item?.order_details?.[0]?.product?.banner;
    return fromItem || fromDetail || undefined;
  }, [item]);

  const orderNo = String(item?.order_id || item?.id || '');
  const title = useMemo(() => `#${orderNo}`, [orderNo]);

  const quantity = useMemo(() => {
    return item?.quantity || item?.order_details?.[0]?.quantity || 0;
  }, [item]);

  const price = useMemo(() => {
    const amount = item?.paid_amount ?? item?.total_amount ?? 0;
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${(num || 0).toFixed(0)}`;
  }, [item]);

  const status = item?.status || '';

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} style={styles.row}>
        <View style={styles.thumbWrap}>
          {thumbnail ? (
            <Image source={{uri: thumbnail}} style={styles.thumb} />
          ) : (
            <View style={styles.thumbPlaceholder} />
          )}
        </View>
        <View style={styles.main}>
          <InterMedium numberOfLines={1} style={styles.title}>
            {title}
          </InterMedium>
          <View style={styles.metaRow}>
            <InterRegular style={styles.meta}>{price}</InterRegular>
            <InterRegular style={styles.meta}>{quantity} PCS</InterRegular>
            <InterRegular style={styles.meta}>#{orderNo}</InterRegular>
            <InterMedium
              style={[styles.status, {color: getStatusColor(status)}]}>
              {status?.replace(/\b\w/g, c => c.toUpperCase())}
            </InterMedium>
          </View>
        </View>
        <View style={styles.menuDot} />
      </TouchableOpacity>
    </Card>
  );
};

export default OrderCard;
