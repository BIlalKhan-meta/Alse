import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import {ChevronLeft, ChevronRight, Heart} from 'lucide-react-native';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';
import {
  getProductTitle,
  getShopProductPriceParts,
  getProductSizeLabel,
  getProductColorsLabel,
  isProductNegotiable,
  resolveProductImageUrls,
} from '../../utils/shopProductCard';

export type ShopProductGridCardProps = {
  product: Record<string, any>;
  onPress?: () => void;
  onToggleSave?: (productId: number, isSaved: boolean) => void;
  onAddToCart?: (product: Record<string, any>) => void;
  showAddButton?: boolean;
  showHeart?: boolean;
};

const ShopProductGridCard: React.FC<ShopProductGridCardProps> = ({
  product,
  onPress,
  onToggleSave,
  onAddToCart,
  showAddButton = true,
  showHeart = true,
}) => {
  const imageUrls = useMemo(
    () => resolveProductImageUrls(product),
    [product],
  );
  const [imageIndex, setImageIndex] = useState(0);

  const currentUrl = imageUrls[imageIndex];
  const imageSource: ImageSourcePropType = currentUrl
    ? {uri: currentUrl}
    : images.pro1;

  const title = getProductTitle(product);
  const {current: priceCurrent} = getShopProductPriceParts(product);
  const sizeLabel = getProductSizeLabel(product);
  const colorsLabel = getProductColorsLabel(product);
  const negotiable = isProductNegotiable(product);
  const isSaved = Boolean(product?.is_saved);
  const hasMultipleImages = imageUrls.length > 1;

  const handlePrevImage = () => {
    if (!hasMultipleImages) {
      return;
    }
    setImageIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!hasMultipleImages) {
      return;
    }
    setImageIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const content = (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={imageSource} style={styles.productImage} resizeMode="cover" />

        {showHeart ? (
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() =>
              product?.id != null &&
              onToggleSave?.(product.id, isSaved)
            }
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            {isSaved ? (
              <Image source={images.heartIcon} style={styles.heartImage} />
            ) : (
              <Heart size={18} color={colors.black} strokeWidth={2} />
            )}
          </TouchableOpacity>
        ) : null}

        {negotiable ? (
          <View style={styles.negotiableBadge}>
            <Text style={styles.negotiableText}>Negotiable</Text>
          </View>
        ) : null}

        {hasMultipleImages ? (
          <>
            <TouchableOpacity
              style={[styles.carouselButton, styles.carouselButtonLeft]}
              onPress={handlePrevImage}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <ChevronLeft size={16} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.carouselButton, styles.carouselButtonRight]}
              onPress={handleNextImage}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <ChevronRight size={16} color="#333" />
            </TouchableOpacity>
          </>
        ) : null}

        {showAddButton && onAddToCart ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart(product)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.productName} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.productPrice}>{priceCurrent}</Text>
      </View>

      {sizeLabel ? (
        <Text style={styles.metaText} numberOfLines={1}>
          {sizeLabel}
        </Text>
      ) : null}

      {colorsLabel ? (
        <Text style={styles.metaText} numberOfLines={2}>
          {colorsLabel}
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F3F3',
    aspectRatio: 1,
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartImage: {
    width: 16,
    height: 16,
    tintColor: colors.redText,
  },
  negotiableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.blue,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 2,
  },
  negotiableText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  carouselButtonLeft: {
    left: 6,
  },
  carouselButtonRight: {
    right: 6,
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});

export default ShopProductGridCard;
