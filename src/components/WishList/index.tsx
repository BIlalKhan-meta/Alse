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
import {EmptyComponent} from '../EmptyComponent';
import {vh} from '../../constant';

interface WishlistProps {
  wishlist: [];
  heart: boolean;
  addCart: boolean;
  product: boolean;
  onPress: () => void;
  handleRemove: () => void;
}

const WishlistScreen: React.FC<WishlistProps> = ({
  wishlist,
  heart,
  addCart,
  product,
  onPress,
  handleRemove,
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

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.productContainer}
        // onPress={onPress}
        onPress={() => onPress(item?.id, item?.user_id)}>
        <Image
          source={
            item?.banner
              ? {uri: item?.banner}
              : item?.images?.length
              ? {uri: item?.images[0].path}
              : images.pro1
          }
          style={styles.productImage}
        />
        {heart && (
          <TouchableOpacity
            onPress={() => handleRemove(item?.id, item?.is_saved)}
            style={styles.heartIconContainer}>
            <Image
              source={item?.is_saved ? images.heartIcon : images.unfillHeart}
              style={[
                !item?.is_saved && {width: vh * 4, height: vh * 4},
                {tintColor: 'red'},
              ]}
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
          {item?.sizes != undefined && item?.sizes?.length !=0 && (
            <InterRegular style={styles.product}>
              Size: {item.sizes[0].size}
            </InterRegular>
          )}
          {item?.colors != undefined && item?.colors?.length !=0 && (
            <InterRegular style={styles.product}>
              Color: {item.colors[0].color}
            </InterRegular>
          )}
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
      ListEmptyComponent={<EmptyComponent text={'No Data Available'} />}
    />
  );
};

export default WishlistScreen;
