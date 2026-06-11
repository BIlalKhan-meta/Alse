import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Share,
  ActivityIndicator,
} from 'react-native';
import {useIsFocused, useRoute, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Share2,
} from 'lucide-react-native';
import {addProductToCart, productDetail} from '../../../api/product';
import {removeSavedItem, saveItem} from '../../../api/menu';
import Loader from '../../../components/Loader';
import RatingandReviewComponent from '../../../components/RatingandReviewComponent';
import ShopComponent from '../../../components/ShopComponent';
import {images} from '../../../utils/images';
import {colors} from '../../../utils/theme';
import {getMessage, Toast} from '../../../utils/helpers';
import {selectUserProfile} from '../../../store/slices/authSlice';
import {
  getProductBrandLabel,
  getProductTitle,
  getShopProductPriceParts,
  getSkuLabel,
  isProductNegotiable,
  resolveProductImageUrls,
  stripProductDescription,
} from '../../../utils/shopProductCard';
import styles from './styles';

type TabKey = 'description' | 'rating' | 'similar';

function normalizeOptionLabel(entry: any, key: 'color' | 'size'): string {
  if (typeof entry === 'string') {
    return entry.trim();
  }
  return String(entry?.[key] ?? entry?.name ?? entry?.title ?? '').trim();
}

const ProductView: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const productId = (route?.params as any)?.productId;
  const user = useSelector(selectUserProfile);
  const isFocused = useIsFocused();

  const [productDetails, setProductDetails] = useState<Record<string, any> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fetchData = useCallback(async () => {
    if (!productId) {
      setProductDetails(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await productDetail(productId);
      const data = response?.data?.data;
      if (data && typeof data === 'object') {
        setProductDetails(data);
        setIsSaved(Boolean(data?.is_saved));
        setImageIndex(0);
        setSelectedColorIndex(0);
        setSelectedSizeIndex(0);
        setQuantity(1);
      } else {
        setProductDetails(null);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setProductDetails(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, isFocused]);

  const imageUrls = useMemo(
    () => (productDetails ? resolveProductImageUrls(productDetails) : []),
    [productDetails],
  );

  const colorOptions = useMemo(() => {
    const colorsList = productDetails?.colors;
    if (!Array.isArray(colorsList)) {
      return [];
    }
    return colorsList
      .map((entry: any) => normalizeOptionLabel(entry, 'color'))
      .filter(Boolean);
  }, [productDetails]);

  const sizeOptions = useMemo(() => {
    const sizesList = productDetails?.sizes;
    if (!Array.isArray(sizesList)) {
      return [];
    }
    return sizesList
      .map((entry: any) => normalizeOptionLabel(entry, 'size'))
      .filter(Boolean);
  }, [productDetails]);

  const title = productDetails ? getProductTitle(productDetails) : '';
  const {current: priceLabel} = productDetails
    ? getShopProductPriceParts(productDetails)
    : {current: '—'};
  const description = productDetails
    ? stripProductDescription(productDetails)
    : '';
  const negotiable = productDetails ? isProductNegotiable(productDetails) : false;

  const ratingValue = Number(
    productDetails?.average_rating ?? productDetails?.rating ?? 0,
  );
  const reviewCount = Number(
    productDetails?.total_reviews ?? productDetails?.reviews_count ?? 0,
  );
  const ratingLabel =
    ratingValue > 0
      ? `${ratingValue.toFixed(1)} (${
          reviewCount > 100 ? '100+' : reviewCount
        })`
      : '';

  const vendorLabel = productDetails?.shop?.shop_name ?? '';
  const brandLabel = productDetails ? getProductBrandLabel(productDetails) : '';
  const skuLabel = productDetails ? getSkuLabel(productDetails) : '';
  const metaParts = [vendorLabel, brandLabel, skuLabel].filter(Boolean);
  const metaLine = metaParts.join('  •  ');

  const shopOwnerId =
    productDetails?.shop?.user_id ??
    productDetails?.user_id ??
    productDetails?.shop?.seller_id;
  const isOwnProduct =
    user?.id != null &&
    shopOwnerId != null &&
    String(user.id) === String(shopOwnerId);

  const currentImageUrl = imageUrls[imageIndex];
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title} - ${priceLabel}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!productDetails?.id) {
      return;
    }

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    const form = new FormData();
    form.append('item_id', String(productDetails.id));
    form.append('item_type', 'product');

    try {
      if (isSaved) {
        await removeSavedItem(form);
      } else {
        await saveItem(form);
      }
    } catch (err) {
      setIsSaved(!nextSaved);
      Toast.error(getMessage((err as any)?.message));
    }
  };

  const handleAddToCart = async () => {
    if (!productDetails?.id) {
      return;
    }

    const form = new FormData();
    form.append('quantity', String(quantity));

    if (colorOptions[selectedColorIndex]) {
      form.append('color', colorOptions[selectedColorIndex]);
    }
    if (sizeOptions[selectedSizeIndex]) {
      form.append('size', sizeOptions[selectedSizeIndex]);
    }

    try {
      setAddingToCart(true);
      const response = await addProductToCart(productDetails.id, form);
      Toast.success(
        getMessage(response?.data?.message) || 'Product added to cart.',
      );
    } catch (error) {
      Toast.error(getMessage((error as any)?.message));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleMakeOffer = () => {
    if (shopOwnerId) {
      (navigation as any).navigate('ChatOngoing', {
        receiverId: shopOwnerId,
        name: vendorLabel || 'Seller',
      });
      return;
    }
    Toast.error('Seller information is not available.');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rating':
        return productId ? (
          <RatingandReviewComponent {...({id: productId} as any)} />
        ) : null;
      case 'similar':
        return productId ? (
          <ShopComponent {...({id: productId} as any)} />
        ) : null;
      case 'description':
      default:
        return (
          <>
            <Text style={styles.descriptionText}>
              {description || 'No description provided.'}
            </Text>

            {colorOptions.length > 0 ? (
              <View style={styles.selectorRow}>
                <Text style={styles.selectorLabel}>Color:</Text>
                {colorOptions.map((option, index) => (
                  <TouchableOpacity
                    key={`${option}-${index}`}
                    onPress={() => setSelectedColorIndex(index)}>
                    <Text
                      style={[
                        styles.selectorOption,
                        selectedColorIndex === index &&
                          styles.selectorOptionActive,
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {sizeOptions.length > 0 ? (
              <View style={styles.selectorRow}>
                <Text style={styles.selectorLabel}>Size:</Text>
                {sizeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={`${option}-${index}`}
                    onPress={() => setSelectedSizeIndex(index)}>
                    <Text
                      style={[
                        styles.selectorOption,
                        selectedSizeIndex === index &&
                          styles.selectorOptionActive,
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </>
        );
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!productDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerWrap}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Product View</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrap}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product View</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        <View style={styles.contentCard}>
          <View style={styles.imageWrap}>
            <Image
              source={currentImageUrl ? {uri: currentImageUrl} : images.pro1}
              style={styles.productImage}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.heartButton}
              onPress={handleToggleSave}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              {isSaved ? (
                <Image
                  source={images.heartIcon}
                  style={{width: 18, height: 18, tintColor: colors.redText}}
                />
              ) : (
                <Heart size={18} color={colors.black} strokeWidth={2} />
              )}
            </TouchableOpacity>

            {negotiable ? (
              <View style={styles.negotiableBadge}>
                <Text style={styles.negotiableText}>Negotiable</Text>
              </View>
            ) : null}

            {hasMultipleImages ? (
              <>
                <TouchableOpacity
                  style={[styles.carouselButton, styles.carouselButtonLeft]}
                  onPress={handlePrevImage}>
                  <ChevronLeft size={16} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.carouselButton, styles.carouselButtonRight]}
                  onPress={handleNextImage}>
                  <ChevronRight size={16} color="#333" />
                </TouchableOpacity>
              </>
            ) : null}
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.productName}>{title}</Text>
            <View style={styles.priceBlock}>
              {ratingLabel ? (
                <Text style={styles.ratingText}>{ratingLabel}</Text>
              ) : null}
              <Text style={styles.productPrice}>{priceLabel}</Text>
            </View>
          </View>

          {metaLine ? <Text style={styles.metaText}>{metaLine}</Text> : null}

          <View style={styles.tabBar}>
            {(
              [
                {key: 'description', label: 'Description'},
                {key: 'rating', label: 'Rating'},
                {key: 'similar', label: 'Similar Products'},
              ] as {key: TabKey; label: string}[]
            ).map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => setActiveTab(tab.key)}>
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.activeTabText,
                    ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.tabContent}>{renderTabContent()}</View>

          {!isOwnProduct ? (
            <View style={styles.footer}>
              <View style={styles.cartRow}>
                <View style={styles.quantityWrap}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => quantity > 1 && setQuantity(quantity - 1)}>
                    <Minus size={18} color={colors.black} />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity(quantity + 1)}>
                    <Plus size={18} color={colors.black} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={handleAddToCart}
                  disabled={addingToCart}>
                  {addingToCart ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.offerButton}
                onPress={handleMakeOffer}>
                <Text style={styles.offerButtonText}>Make an offer</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductView;
