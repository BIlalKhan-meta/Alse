// CartItem.tsx

import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { images } from '../../utils/images';

import styles from './styles';
import HorizontalSeparator from '../HorizontalSeparator';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import InterBoldSmall from '../Text/InterBoldSmall';
import { Product } from '../../dummyData';

interface Props {
    item: Product;
    showQuantityControls: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
    onDelete: () => void;
    showSeparator: boolean;
    quantity: number;
    showDelete: boolean;
}

const CartItem: React.FC<Props> = ({ item, showQuantityControls, onIncrement, onDecrement, onDelete, showSeparator, quantity, showDelete }) => (
    <>
        <View style={styles.productContainer}>
            <Image source={item.image} style={styles.productImage} />
            <View style={styles.productDetails}>
                <InterMedium style={styles.productName}>{item.name}</InterMedium>
                <View style={styles.colorContainer}>
                    <InterRegular style={styles.productColor}>Color</InterRegular>
                    <InterRegular style={styles.colorValue}>{item.color}</InterRegular>
                </View>
                <View style={styles.colorContainer}>
                    <InterRegular style={styles.productColor}>Size</InterRegular>
                    <InterRegular style={styles.colorValue}>{item.size}</InterRegular>
                </View>
                {showQuantityControls && (
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity onPress={onDecrement}>
                            <Text style={styles.quantityText}>-</Text>
                        </TouchableOpacity>
                        <View style={styles.quantityButton} >
                            <Text style={styles.quantityButtonText}>{item.quantity}</Text>
                        </View>
                        <TouchableOpacity onPress={onIncrement}>
                            <Text style={styles.quantityText}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View>
                {showDelete && (
                    <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                        <Image source={images.bin} style={styles.deleteButtonIcon} />
                    </TouchableOpacity>
                )}

                <InterBoldSmall style={styles.productPrice}>${item.price}</InterBoldSmall>


                {quantity && <View style={styles.quantityContainer}>
                    <InterRegular style={styles.quantityText2}>Qty:{quantity}</InterRegular>
                </View>}
            </View>
        </View>
        {showSeparator && <HorizontalSeparator />}
    </>
);

export default CartItem;
