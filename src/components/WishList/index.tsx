import React from 'react';
import {View, Text, Image, TouchableOpacity, FlatList} from 'react-native';
import {images} from '../../utils/images';
import styles from './styles';
import InterRegular from '../Text/InterRegular';
import InterBoldAverage from '../Text/InterBoldAverage';
import {addProductToCart} from '../../api/product';
import {EmptyComponent} from '../EmptyComponent';
import {vh} from '../../constant';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

interface WishlistProps {
  wishlist: any[];
  heart?: boolean;
  addCart?: boolean;
  product?: boolean;
  vendor?: boolean;
  embedded?: boolean;
  onPress: (id: any, userId?: any) => void;
  handleRemove?: (id: any, isSaved: boolean) => void;
}

type WishlistItemProps = {
  item: any;
  heart?: boolean;
  addCart?: boolean;
  product?: boolean;
  vendor?: boolean;
  sizeLabel: string;
  colorLabel: string;
  onPress: (id: any, userId?: any) => void;
  handleRemove?: (id: any, isSaved: boolean) => void;
  onAddToCart: (productId: number, size: string, color: string) => void;
};

const WishlistItem: React.FC<WishlistItemProps> = ({
  item,
  heart,
  addCart,
  product,
  vendor,
  sizeLabel,
  colorLabel,
  onPress,
  handleRemove,
  onAddToCart,
}) => (
  <TouchableOpacity
    style={styles.productContainer}
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
    {heart ? (
      <TouchableOpacity
        onPress={() => handleRemove?.(item?.id, item?.is_saved)}
        style={styles.heartIconContainer}>
        <Image
          source={item?.is_saved ? images.heartIcon : images.unfillHeart}
          style={[
            !item?.is_saved && {width: vh * 4, height: vh * 4},
            {tintColor: 'red'},
          ]}
        />
      </TouchableOpacity>
    ) : null}
    {addCart ? (
      <TouchableOpacity
        onPress={() =>
          onAddToCart(
            item.id,
            item?.sizes?.[0]?.size ?? '',
            item?.colors?.[0]?.color ?? '',
          )
        }
        style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    ) : null}
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
        {product && vendor ? (
          <InterRegular style={styles.productName}>
            {item?.shop?.shop_name}
          </InterRegular>
        ) : null}
      </View>
      {item?.sizes != undefined && item?.sizes?.length != 0 ? (
        <InterRegular style={styles.product}>
          {sizeLabel}: {item.sizes[0].size}
        </InterRegular>
      ) : null}
      {item?.colors != undefined && item?.colors?.length != 0 ? (
        <InterRegular style={styles.product}>
          {colorLabel}: {item.colors[0].color}
        </InterRegular>
      ) : null}
    </View>
  </TouchableOpacity>
);

const WishlistScreen: React.FC<WishlistProps> = ({
  wishlist,
  heart,
  addCart,
  product,
  onPress,
  handleRemove,
  vendor,
  embedded = false,
}) => {
  const {t} = useTranslation();
  const sizeLabel = t('size');
  const colorLabel = t('color');

  const handleAddToCart = async (
    productId: number,
    size: string,
    color: string,
  ) => {
    const form = new FormData();
    if (size) {
      form.append('size', size);
    }
    if (color) {
      form.append('colors', color);
    }

    try {
      const res = await addProductToCart(productId, form);
      if (res?.data) {
        Toast.show({
          type: 'success',
          text1: t('toast.addedToCart'),
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('invalid'),
        text2: err?.message,
      });
    }
  };

  const renderItem = ({item}: {item: any}) => (
    <WishlistItem
      item={item}
      heart={heart}
      addCart={addCart}
      product={product}
      vendor={vendor}
      sizeLabel={sizeLabel}
      colorLabel={colorLabel}
      onPress={onPress}
      handleRemove={handleRemove}
      onAddToCart={handleAddToCart}
    />
  );

  if (embedded) {
    if (!wishlist.length) {
      return <EmptyComponent text={'No Products Available'} />;
    }

    return (
      <View style={styles.embeddedGrid}>
        {wishlist.map(item => (
          <View key={String(item?.id)} style={styles.embeddedGridItem}>
            <WishlistItem
              item={item}
              heart={heart}
              addCart={addCart}
              product={product}
              vendor={vendor}
              sizeLabel={sizeLabel}
              colorLabel={colorLabel}
              onPress={onPress}
              handleRemove={handleRemove}
              onAddToCart={handleAddToCart}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={wishlist}
      renderItem={renderItem}
      keyExtractor={item => String(item?.id)}
      numColumns={2}
      style={{width: '100%'}}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<EmptyComponent text={'No Products Available'} />}
    />
  );
};

export default WishlistScreen;
