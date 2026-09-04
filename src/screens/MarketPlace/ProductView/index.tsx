import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
} from 'react-native';
import {useIsFocused, useRoute, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  ChevronLeft,
  ChevronRight,
  Forward,
  Heart,
  Minus,
  Plus,
  Share2,
} from 'lucide-react-native';
import {addProductToCart, productDetail} from '../../../api/product';
import {createChat, createMessage} from '../../../api/home';
import {removeSavedItem, saveItem} from '../../../api/menu';
import Loader from '../../../components/Loader';
import MakeOfferModal from '../../../components/MakeOfferModal';
import ShareModal from '../../../components/ShareModal';
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
  resolveProductMediaItems,
  stripProductDescription,
} from '../../../utils/shopProductCard';
import {serializeProductShare} from '../../../utils/productSharePayload';
import styles from './styles';
import Video from 'react-native-video';

type TabKey = 'description' | 'rating' | 'similar';

function normalizeOptionLabel(entry: any, key: 'color' | 'size'): string {
  if (typeof entry === 'string') {
    return entry.trim();
  }
  return String(entry?.[key] ?? entry?.name ?? entry?.title ?? '').trim();
}

function buildOfferMessage(params: {
  productName: string;
  quantity: string;
  price: string;
  note: string;
  listedPrice?: string;
}): string {
  const lines = [
    `Hi, I'd like to make an offer on "${params.productName}".`,
    '',
    `Quantity: ${params.quantity}`,
    `Offer Price: $${params.price}`,
  ];

  if (params.listedPrice) {
    lines.push(`Listed Price: ${params.listedPrice}`);
  }

  const trimmedNote = params.note.trim();
  if (trimmedNote) {
    lines.push(`Note: ${trimmedNote}`);
  }

  return lines.join('\n');
}

function formatOfferPrice(value: string): string {
  const normalized = value.replace(/,/g, '').trim();
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) {
    return value.trim();
  }
  return amount % 1 === 0 ? String(amount) : amount.toFixed(2);
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
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerQuantity, setOfferQuantity] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [sendingProductShare, setSendingProductShare] = useState(false);

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

  const mediaItems = useMemo(
    () => (productDetails ? resolveProductMediaItems(productDetails) : []),
    [productDetails],
  );
  const imageUrls = mediaItems.map(item => item.url);

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
  const priceParts = productDetails
    ? getShopProductPriceParts(productDetails)
    : {current: '—', original: undefined};
  const priceLabel = priceParts.current;
  const originalPriceLabel = priceParts.original;
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
  const currentMedia = mediaItems[imageIndex];
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

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${title} - ${priceLabel}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [title, priceLabel]);

  const handleForwardToChat = useCallback(() => {
    setShareModalVisible(true);
  }, []);

  const handleSendProductToChats = useCallback(
    async (chatIds: number[]) => {
      if (!productDetails?.id || chatIds.length === 0) {
        Toast.error('Please select at least one chat.');
        return;
      }

      const message = serializeProductShare({
        v: 1,
        type: 'product_share',
        product_id: productDetails.id,
        title,
        price: priceLabel,
        image: imageUrls[0],
        vendor: vendorLabel || undefined,
      });

      setSendingProductShare(true);
      try {
        await Promise.all(
          chatIds.map(async chatId => {
            await createMessage({
              chat_id: chatId,
              message,
            });
          }),
        );

        Toast.success(
          chatIds.length === 1
            ? 'Product sent to chat.'
            : `Product sent to ${chatIds.length} chats.`,
        );
      } catch (error) {
        Toast.error(getMessage((error as any)?.message));
      } finally {
        setSendingProductShare(false);
      }
    },
    [imageUrls, productDetails?.id, title, priceLabel, vendorLabel],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={handleForwardToChat}
            style={styles.navIconButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Forward size={22} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.navShareButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Share2 size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleShare, handleForwardToChat]);

  const handleToggleSave = async () => {
    if (!productDetails?.id) {
      return;
    }

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    const payload = {
      item_id: productDetails.id,
      item_type: 'product',
    };

    try {
      if (isSaved) {
        await removeSavedItem(payload);
      } else {
        await saveItem(payload);
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
    if (!shopOwnerId) {
      Toast.error('Seller information is not available.');
      return;
    }
    setOfferQuantity(String(quantity));
    setOfferPrice('');
    setOfferNote('');
    setOfferModalVisible(true);
  };

  const handleCloseOfferModal = () => {
    if (submittingOffer) {
      return;
    }
    setOfferModalVisible(false);
  };

  const handleSubmitOffer = async () => {
    if (!shopOwnerId) {
      Toast.error('Seller information is not available.');
      return;
    }

    const trimmedQuantity = offerQuantity.trim();
    const trimmedPrice = offerPrice.trim();

    if (!trimmedQuantity) {
      Toast.error('Please enter quantity.');
      return;
    }

    if (!/^\d+$/.test(trimmedQuantity) || Number(trimmedQuantity) < 1) {
      Toast.error('Please enter a valid quantity.');
      return;
    }

    if (!trimmedPrice) {
      Toast.error('Please enter price.');
      return;
    }

    const normalizedPrice = trimmedPrice.replace(/,/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(normalizedPrice) || Number(normalizedPrice) <= 0) {
      Toast.error('Please enter a valid price.');
      return;
    }

    const formattedPrice = formatOfferPrice(normalizedPrice);
    const offerMessage = buildOfferMessage({
      productName: title,
      quantity: trimmedQuantity,
      price: formattedPrice,
      note: offerNote,
      listedPrice: priceLabel !== '—' ? priceLabel : undefined,
    });

    setSubmittingOffer(true);
    try {
      const chatRes = await createChat({user_id: shopOwnerId});
      const chatId = chatRes?.data?.data?.id;

      if (!chatId) {
        throw new Error('Unable to start chat with this store.');
      }

      await createMessage({
        chat_id: chatId,
        message: offerMessage,
      });

      setOfferModalVisible(false);
      Toast.success('Your offer has been sent to the store.');

      (navigation as any).navigate('ChatOngoing', {
        id: chatId,
        receiverId: shopOwnerId,
        name: vendorLabel || 'Seller',
        phoneNumber:
          productDetails?.shop?.user?.phone_number ??
          productDetails?.shop?.phone_number ??
          '',
        user: {
          id: shopOwnerId,
          avatar:
            productDetails?.shop?.avatar ??
            productDetails?.shop?.user?.avatar ??
            productDetails?.shop?.logo,
        },
      });
    } catch (error) {
      Toast.error(getMessage((error as any)?.message));
    } finally {
      setSubmittingOffer(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rating':
        return productId ? (
          <RatingandReviewComponent
            {...({id: productId, embedded: true} as any)}
          />
        ) : null;
      case 'similar':
        return productId ? (
          <ShopComponent {...({id: productId, embedded: true} as any)} />
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
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Product not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentCard}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageWrap}>
            {currentMedia?.type === 'video' && currentImageUrl ? (
              <Video
                source={{uri: currentImageUrl}}
                style={styles.productImage}
                resizeMode="cover"
                controls
                paused={false}
                repeat
              />
            ) : (
              <Image
                source={currentImageUrl ? {uri: currentImageUrl} : images.pro1}
                style={styles.productImage}
                resizeMode="cover"
              />
            )}

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
              {originalPriceLabel ? (
                <Text
                  style={{
                    textDecorationLine: 'line-through',
                    color: '#999',
                    fontSize: 13,
                    marginTop: 2,
                  }}>
                  {originalPriceLabel}
                </Text>
              ) : null}
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
        </ScrollView>

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

      <MakeOfferModal
        visible={offerModalVisible}
        loading={submittingOffer}
        onClose={handleCloseOfferModal}
        onSubmit={handleSubmitOffer}
        quantity={offerQuantity}
        price={offerPrice}
        note={offerNote}
        onChangeQuantity={setOfferQuantity}
        onChangePrice={setOfferPrice}
        onChangeNote={setOfferNote}
      />

      <ShareModal
        visible={shareModalVisible}
        onClose={() => {
          if (!sendingProductShare) {
            setShareModalVisible(false);
          }
        }}
        title="Share in Chat"
        showNewsfeedOption={false}
        sendLabel={sendingProductShare ? 'Sending...' : 'Send'}
        onSendToChats={handleSendProductToChats}
      />
    </View>
  );
};

export default ProductView;
