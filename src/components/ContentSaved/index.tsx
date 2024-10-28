import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ViewStyle,
} from 'react-native';
import {images} from '../../utils/images';
import {vh} from '../../constant';
import InterRegular from '../Text/InterRegular';
import InterBoldAverage from '../Text/InterBoldAverage';
import styles from './styles';
import InterMedium from '../Text/InterMedium';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface ContentSavedProps {
  title: string;
  viewBtn: string;
  item: any;
  onAddToCart: (productId: string) => void;
  onRemoveFromContentSaved: (productId: string) => void;
  onItemPress: () => void;
  style: ViewStyle;
  userId: number;
}

const ContentSavedScreen: React.FC<ContentSavedProps> = ({
  item,
  onAddToCart,
  onRemoveFromContentSaved,
  viewBtn,
  onItemPress,
  userId,
  style,
}) => {

  return (
    <TouchableOpacity
      style={[styles.productContainer, style]}
      onPress={onItemPress}>
      <Image
        source={item?.image ? {uri: item?.image} : images.blog1}
        style={styles.productImage}
      />

      <View style={styles.productDetails}>
        <View>
          <InterMedium lines={2} style={styles.blogTitle}>
            {item?.title}
          </InterMedium>
          <InterRegular lines={3} style={styles.blogDetail}>
            {item?.content}
          </InterRegular>
          {viewBtn && (
            <TouchableOpacity style={styles.viewBtn}>
              <InterRegular style={styles.viewText}>{viewBtn}</InterRegular>
            </TouchableOpacity>
          )}
        </View>
        {userId == item?.user_id && (
          <TouchableOpacity
            // onPress={() => onAddToCart(item.id)}
            style={item?.active ? styles.activeButton : styles.inactiveButton}>
            <InterRegular style={styles.addButtonText}>
              {item?.active ? 'Active' : 'Inactive'}
            </InterRegular>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ContentSavedScreen;
