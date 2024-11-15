import React from 'react';
import {View, Image, TouchableOpacity, Text} from 'react-native';
import styles from './styles';

interface Props {
  onIncrement: () => void;
  onDecrement: () => void;
  quantity: number;
}

const QunatityControls: React.FC<Props> = ({
  onIncrement,
  onDecrement,
  quantity,
}) => (
  <View style={styles.quantityContainer}>
    <TouchableOpacity onPress={onDecrement}>
      <Text style={styles.quantityText}>-</Text>
    </TouchableOpacity>
    <View style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>{quantity}</Text>
    </View>
    <TouchableOpacity onPress={onIncrement}>
      <Text style={styles.quantityText}>+</Text>
    </TouchableOpacity>
  </View>
);

export default QunatityControls;
