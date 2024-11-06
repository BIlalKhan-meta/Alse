// CartItem.tsx

import React from 'react';
import {View, Image, TouchableOpacity, Text} from 'react-native';
import {images} from '../../utils/images';

import styles from './styles';
import HorizontalSeparator from '../HorizontalSeparator';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import InterBoldSmall from '../Text/InterBoldSmall';
import {Product} from '../../dummyData';

interface Props {
  item: [];
  showQuantityControls: boolean;
  handleChange: (value: string, id: number) => void;
  onDelete: (index: number) => void;
  showSeparator: boolean;
  quantity: boolean;
  showDelete: boolean;
}

const CartItem: React.FC<Props> = ({
  item,
  showQuantityControls,
  handleChange,
  onDelete,
  showSeparator,
  quantity,
  showDelete,
}) => {
  return (
    <>
      <View style={styles.productContainer}>
        <Image
          source={item?.product_image ? {uri: item?.product_image} : null}
          style={styles.productImage}
        />
        <View style={styles.productDetails}>
          <InterMedium style={styles.productName}>
            {item?.product_name}
          </InterMedium>
          {/* <View style={styles.colorContainer}>
                    <InterRegular style={styles.productColor}>Color</InterRegular>
                    <InterRegular style={styles.colorValue}>{item.color}</InterRegular>
                    </View>
                    <View style={styles.colorContainer}>
                    <InterRegular style={styles.productColor}>Size</InterRegular>
                    <InterRegular style={styles.colorValue}>{item.size}</InterRegular>
                    </View> */}
          {showQuantityControls && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => handleChange('decrement', item?.id)}>
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>{item.quantity}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleChange('increment', item?.id)}>
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View>
          {showDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item?.id)}>
              <Image source={images.bin} style={styles.deleteButtonIcon} />
            </TouchableOpacity>
          )}

          <InterBoldSmall style={styles.productPrice}>
            ${Number(item.product_price) * item?.quantity}
          </InterBoldSmall>

          {quantity && (
            <View style={styles.quantityContainer}>
              <InterRegular style={styles.quantityText2}>
                Qty:{item.quantity}
              </InterRegular>
            </View>
          )}
        </View>
      </View>
      {showSeparator && <HorizontalSeparator />}
    </>
  );
};

export default CartItem;
