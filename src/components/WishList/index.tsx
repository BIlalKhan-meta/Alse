import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {images} from '../../utils/images';
import {vh} from '../../constant';
import styles from './styles';
import InterRegular from '../Text/InterRegular';
import InterBoldAverage from '../Text/InterBoldAverage';
import {saveItem} from '../../api/menu';
import {addProductToCart} from '../../api/product';

// interface Product {
//     id: string;
//     name: string;
//     price: number;
//     imageUrl: string;
//     size: string
// }

interface WishlistProps {
  wishlist: [];
  heart: boolean;
  addCart: boolean;
  product: boolean;
  onPress: () => void;
}

const WishlistScreen: React.FC<WishlistProps> = ({
  wishlist,
  heart,
  addCart,
  product,
  onPress,
}) => {
  const handleAddToCart = async (productId: string) => {
    // Implement your logic to add the product to cart
    // console.log(`Product with id ${productId} added to cart`);
    await addProductToCart(productId)
      .then(res => {
        if (res?.data) {
          console.log('RESSSSSSSSSS ADDD TOOO CARDDDD WISHLISTTTT', res?.data);
        }
      })
      .catch(err => {
        console.log('ERRRRRORRR ADDD TOOO CARDDDD WISHLISTTTT', err);
      });
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    // Implement your logic to remove the product from wishlist
    // console.log(`Product with id ${productId} removed from wishlist`);
    const data = {
      item_id: productId,
      item_type: 'product',
    };

    const form = new FormData();
    Object.entries(data).map(([key, value]) => {
      form.append(key, value);
    });

    await saveItem(form)
      .then(res => {
        if (res?.data) {
          //   console.log('RESSSSSSSSSS SAVEEEEEEEEEEEEEEE', res?.data);
        }
      })
      .catch(err => {
        console.log('ERRRRRORRR SAVEEEEEEEEEEEEEEEEE', err);
      });
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.productContainer}
        // onPress={onPress}
        onPress={() => onPress(item.id, item.user_id)}>
        <Image
          source={
            item?.banner
              ? {uri: item.banner}
              : item?.images
              ? {uri: item.images[0].path}
              : images.pro1
          }
          style={styles.productImage}
        />
        {heart && (
          <TouchableOpacity
            onPress={() => handleRemoveFromWishlist(item.id)}
            style={styles.heartIconContainer}>
            <Image source={images.heartIcon} />
          </TouchableOpacity>
        )}
        {addCart && (
          <TouchableOpacity
            onPress={() => handleAddToCart(item.id)}
            style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
        <View>
          <View style={styles.productDetails}>
            <InterRegular style={styles.productName}>
              {product ? item?.title : item.shop_name}
            </InterRegular>
            {item?.price ? (
              <InterBoldAverage style={styles.productPrice}>
                ${Number(item?.price)?.toFixed(2)}
              </InterBoldAverage>
            ) : (
              <Text> </Text>
            )}
          </View>
          {/* {product && item.size && (
            <InterRegular style={styles.product}>
              Size: {item.size}
            </InterRegular>
          )}
          {item.colors && (
            <InterRegular style={styles.product}>
              Color: Red, Green, Blue
            </InterRegular>
          )} */}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <InterRegular style={styles.emptyText}>No Data to Show.</InterRegular>
    </View>
  );

  return (
    <FlatList
      data={wishlist}
      renderItem={renderItem}
      keyExtractor={item => item?.id?.toString()}
      numColumns={2}
      contentContainerStyle={styles.container}
      ListEmptyComponent={renderEmpty}
    />
  );
};

export default WishlistScreen;
