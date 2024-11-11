// StatusBadge.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { vh } from '../../constant';

interface StatusBadgeProps {
  status: 'pending' | 'cancelled' | 'accepted' | 'delivered';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({status}) => {
  let backgroundColor;
  switch (status) {
    case 'pending':
      backgroundColor = '#36D2E9'; // Yellow
      break;
    case 'cancelled':
      backgroundColor = '#C90505'; // Red
      break;
    case 'accepted':
      backgroundColor = '#32CD32'; // Green
      break;
    case 'delivered':
      backgroundColor = '#4CD964'; // Blue
      break;
    default:
      backgroundColor = '#000';
  }

  return (
    <View style={[styles.badge, {backgroundColor}]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: vh*0.2,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
