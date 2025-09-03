import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, FlatList} from 'react-native';
import {images} from '../../utils/images';
import styles from './styles';
import InterRegular from '../Text/InterRegular';
import InterBoldAverage from '../Text/InterBoldAverage';
import {removeSavedItem, saveItem} from '../../api/menu';
import {addProductToCart} from '../../api/product';
import {EmptyComponent} from '../EmptyComponent';
import {vh} from '../../constant';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

interface WishlistProps {
  wishlist: [];
  heart?: boolean;
  addCart?: boolean;
  product?: boolean;
  vendor?: boolean;
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
  vendor,
}) => {
  const handleAddToCart = async (
    productId: number,
    size: string,
    color: string,
  ) => {
    const data = {
      size: size,
      colors: color,
    };

    const {t} = useTranslation();

    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      form.append(key, value);
    });

    console.log(JSON.stringify(form, null, 4));

    await addProductToCart(productId, form)
      .then(res => {
        if (res?.data) {
          return Toast.show({
            type: 'success',
            text1: t('toast.addedToCart'),
          });
        }
      })
      .catch(err => {
        return Toast.show({
          type: 'error',
          text1: t('invalid'),
          text2: err?.message,
        });
      });
  };

  const renderItem = ({item}) => {
    const {t} = useTranslation();
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
            onPress={() =>
              handleAddToCart(
                item.id,
                item?.sizes[0].size,
                item?.colors[0].color,
              )
            }
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
          <View>
            {product && vendor && (
              <InterRegular style={styles.productName}>
                {item?.shop?.shop_name}
              </InterRegular>
            )}
          </View>
          {item?.sizes != undefined && item?.sizes?.length != 0 && (
            <InterRegular style={styles.product}>
              {t('size')}: {item.sizes[0].size}
            </InterRegular>
          )}
          {item?.colors != undefined && item?.colors?.length != 0 && (
            <InterRegular style={styles.product}>
              {t('color')}: {item.colors[0].color}
            </InterRegular>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={wishlist}
      renderItem={renderItem}
      keyExtractor={item => item?.id?.toString()}
      numColumns={2}
      style={{width: '100%'}}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<EmptyComponent text={'No Products Available'} />}
    />
  );
};

export default WishlistScreen;
