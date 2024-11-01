import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {images} from '../../utils/images';
import styles from './styles';
import InterRegular from '../Text/InterRegular';
import InterBoldAverage from '../Text/InterBoldAverage';
import {removeSavedItem, saveItem} from '../../api/menu';
import {addProductToCart} from '../../api/product';

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
  const [display, setDisplay] = useState(wishlist);

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

  const handleRemoveFromWishlist = async (
    productId: number,
    saved: boolean,
  ) => {
    if (saved) {
      await removeSavedItem(productId).then(res => {
        if (res?.data) {
          let index = display.findIndex(item => item.id == productId);
          let arr = [...display];
          arr.splice(index, 1);
          setDisplay(arr);
        }
      });
    } else {
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
    }
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
            onPress={() => handleRemoveFromWishlist(item.id, item?.is_saved)}
            style={styles.heartIconContainer}>
            <Image
              source={item?.is_saved ? images.heartIcon : images.unfillHeart}
              style={{tintColor: 'red'}}
            />
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
      data={display}
      renderItem={renderItem}
      keyExtractor={item => item?.id?.toString()}
      numColumns={2}
      contentContainerStyle={styles.container}
      ListEmptyComponent={renderEmpty}
    />
  );
};

export default WishlistScreen;
