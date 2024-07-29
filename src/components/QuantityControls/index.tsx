// CartItem.tsx

import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { images } from '../../utils/images';

import HorizontalSeparator from '../HorizontalSeparator';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import InterBoldSmall from '../Text/InterBoldSmall';
import { Product } from '../../dummyData';
import styles from './styles';

interface Props {
    // item: Product;
    onIncrement: () => void;
    onDecrement: () => void;
    onDelete: () => void;
    quantity: number;
}

const QunatityControls: React.FC<Props> = ({ onIncrement, onDecrement, onDelete, quantity }) => (

    <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={onDecrement}>
            <Text style={styles.quantityText}>-</Text>
        </TouchableOpacity>
        <View style={styles.quantityButton} >
            <Text style={styles.quantityButtonText}>{quantity}</Text>
        </View>
        <TouchableOpacity onPress={onIncrement}>
            <Text style={styles.quantityText}>+</Text>
        </TouchableOpacity>
    </View>

);

export default QunatityControls;
