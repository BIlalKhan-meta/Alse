import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';
import {
  resolveProductListImageUrl,
  getShopProductPriceParts,
  stripProductDescription,
  buildProductMetaSummary,
  getRatingLabel,
  getSkuLabel,
} from '../../utils/shopProductCard';

export type ShopProductListRowProps = {
  product: Record<string, any>;
  onPress?: () => void;
};

const ShopProductListRow: React.FC<ShopProductListRowProps> = ({
  product,
  onPress,
}) => {
  const uri = resolveProductListImageUrl(product);
  const src: ImageSourcePropType = uri ? {uri} : images.pro1;

  const title =
    product?.title || product?.name || product?.product_name || 'Product';
  const description = stripProductDescription(product, 260);
  const {current: priceCurrent, original: priceOriginal} =
    getShopProductPriceParts(product);
  const metaLine = buildProductMetaSummary(product);
  const ratingLine = getRatingLabel(product);
  const skuLine = getSkuLabel(product);

  const body = (
    <>
      <Image source={src} style={styles.productImage} resizeMode="cover" />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.productDescription} numberOfLines={5}>
          {description || 'No description provided.'}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceMain}>{priceCurrent}</Text>
          {priceOriginal ? (
            <Text style={styles.priceOriginal}>{priceOriginal}</Text>
          ) : null}
        </View>
        {metaLine ? (
          <Text style={styles.metaLine} numberOfLines={2}>
            {metaLine}
          </Text>
        ) : null}
        {ratingLine ? (
          <Text style={styles.ratingLine} numberOfLines={1}>
            {ratingLine}
          </Text>
        ) : null}
        {skuLine ? (
          <Text style={styles.skuLine} numberOfLines={1}>
            {skuLine}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={onPress}
        activeOpacity={0.85}>
        {body}
      </TouchableOpacity>
    );
  }

  return <View style={styles.productCard}>{body}</View>;
};

const styles = StyleSheet.create({
  productCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: 120,
    height: 140,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  priceMain: {
    fontSize: 16,
    color: colors.themeColor,
    fontWeight: '700',
  },
  priceOriginal: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  metaLine: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  ratingLine: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  skuLine: {
    fontSize: 11,
    color: '#888',
  },
});

export default ShopProductListRow;
