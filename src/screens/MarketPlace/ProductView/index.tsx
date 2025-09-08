// import React, {useEffect, useLayoutEffect, useState} from 'react';
// import {View, Text, Image, TouchableOpacity, ScrollView} from 'react-native';
// import {images} from '../../../utils/images';
// import Card from '../../../components/Card';

// import {useIsFocused, useRoute} from '@react-navigation/native';

// import GeneralModal from '../../../components/GeneralModal';
// import styles from './styles';
// import InterRegular from '../../../components/Text/InterRegular';
// import InterBoldAverage from '../../../components/Text/InterBoldAverage';
// import InterMedium from '../../../components/Text/InterMedium';
// import Swiper from 'react-native-swiper';
// import RatingandReviewComponent from '../../../components/RatingandReviewComponent';
// import ShopComponent from '../../../components/ShopComponent';
// import StoreOrderComponent from '../../../components/StoreOrder';
// import {productDetail} from '../../../api/product';
// import Loader from '../../../components/Loader';

// const ProductView: React.FC = () => {
//   const route = useRoute();
//   const {productId} = route?.params;

//   const [activeTab, setActiveTab] = useState<number>(1);
//   const [reportVisible, setReportVisible] = useState(false);
//   const [reportInput, setReportInput] = useState(false);
//   const [ReportSuccess, setReportSuccess] = useState(false);
//   const [productDetails, setProductDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const isFocused = useIsFocused();

//   useEffect(() => {
//     if (productId) {
//       getData();
//     }
//   }, [productId, isFocused]);

//   const getData = async () => {
//     setLoading(true);
//     await productDetail(productId).then(async res => {
//       if (res?.data) {
//         setProductDetails(res?.data?.data || {});
//         setLoading(false);
//       }
//     });
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   const renderContent = () => {
//     switch (activeTab) {
//       case 1:
//         return <StoreOrderComponent productItem={productDetails} />;
//       case 2:
//         return <RatingandReviewComponent id={productId} />;
//       case 3:
//         return <ShopComponent id={productId} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <ScrollView showsVerticalScrollIndicator={false}>
//       <View style={[styles.container]}>
//         {productDetails && productDetails.images && (
//           <Card style={styles.cardContainer}>
//             <View style={styles.banner}>
//               {productDetails?.images[0]?.path && (
//                 <Swiper
//                   showsPagination={false}
//                   nextButton={<Text style={styles.buttonText}>›</Text>}
//                   prevButton={<Text style={styles.buttonText}>‹</Text>}>
//                   {productDetails?.images?.map((image, index) => {
//                     return (
//                       <View key={index}>
//                         <Image
//                           source={{uri: image?.path}}
//                           style={styles.imageStyle}
//                         />
//                       </View>
//                     );
//                   })}
//                 </Swiper>
//               )}
//             </View>

//             <View style={styles.productDetails}>
//               <InterMedium style={styles.productName}>
//                 {productDetails?.title}
//               </InterMedium>
//               <View style={styles.priceContainer}>
//                 {productDetails?.average_rating && (
//                   <InterRegular style={styles.ratingTxt}>
//                     {productDetails?.average_rating} (
//                     {productDetails?.total_reviews > 100
//                       ? '100+'
//                       : productDetails?.total_reviews}
//                     )
//                   </InterRegular>
//                 )}
//                 <InterBoldAverage style={styles.productPrice}>
//                   ${productDetails?.price}
//                 </InterBoldAverage>
//               </View>
//             </View>

//             <View style={styles.vendorContainer}>
//               <InterRegular style={styles.vendorTxt}>
//                 {productDetails?.shop?.shop_name}
//               </InterRegular>

//               <View style={styles.bulletTextContainer}>
//                 <View style={styles.bullet} />
//                 <InterRegular style={styles.vendorTxt}>
//                   {productDetails?.category?.title}
//                 </InterRegular>
//               </View>
//             </View>

//             <View style={styles.tabBar}>
//               <TouchableOpacity
//                 style={[styles.tab, activeTab === 1 && styles.activeTab]}
//                 onPress={() => setActiveTab(1)}>
//                 <Text
//                   style={
//                     activeTab === 1 ? styles.activeText : styles.inactiveText
//                   }>
//                   Description
//                 </Text>
//               </TouchableOpacity>
//               {/* <TouchableOpacity
//                 style={[styles.tab, activeTab === 2 && styles.activeTab]}
//                 onPress={() => setActiveTab(2)}>
//                 <Text
//                   style={
//                     activeTab === 2 ? styles.activeText : styles.inactiveText
//                   }>
//                   Rating
//                 </Text>
//               </TouchableOpacity> */}
//               <TouchableOpacity
//                 style={[styles.tab, activeTab === 3 && styles.activeTab]}
//                 onPress={() => setActiveTab(3)}>
//                 <Text
//                   style={
//                     activeTab === 3 ? styles.activeText : styles.inactiveText
//                   }>
//                   Similar Products
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {renderContent()}
//           </Card>
//         )}

//         <GeneralModal
//           visible={reportVisible}
//           closeModal={() => setReportVisible(false)}
//           icon={images.qmark}
//           title="Report Store"
//           message="Are you sure you want to report this Store?"
//           buttonText="Yes"
//           buttonText2="No"
//           onPress={() => {
//             setReportVisible(false);
//             setReportInput(true);
//           }}
//           smallButtons={true}
//         />

//         <GeneralModal
//           visible={reportInput}
//           closeModal={() => setReportInput(false)}
//           // icon={images.doubleCheck}
//           title="Reason Of Report Store"
//           // message='Post has been delete successfully.'
//           buttonText="Ok"
//           inputVisible={true}
//           onPress={() => {
//             setReportInput(false);
//             setReportSuccess(true);
//           }}
//         />

//         <GeneralModal
//           visible={ReportSuccess}
//           closeModal={() => setReportSuccess(false)}
//           icon={images.doubleCheck}
//           title="Report Store"
//           message="Store has been report successfully."
//           buttonText="Ok"
//           onPress={() => {
//             setReportSuccess(false);
//           }}
//         />
//       </View>
//     </ScrollView>
//   );
// };

// export default ProductView;

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import {useIsFocused, useRoute, useNavigation} from '@react-navigation/native';
import {addProductToCart, productDetail} from '../../../api/product';
import Loader from '../../../components/Loader';
import {vh, vw} from '../../../constant';
import {
  Heart,
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Star,
  Share2,
  Check,
} from 'lucide-react-native';
import {images} from '../../../utils/images';

const ProductView: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {productId} = route?.params || {productId: 1}; // Fallback ID

  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const isFocused = useIsFocused();

  // Add new state for cart status
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const colors = [
    {id: 0, color: '#555555'}, // Dark gray
    {id: 1, color: '#3C5A99'}, // Blue
    {id: 2, color: '#C41E3A'}, // Red
    {id: 3, color: '#663399'}, // Purple
    {id: 4, color: '#228B22'}, // Green
  ];

  // Reviews will be fetched from API when available
  const reviewData = [];

  // Fetch product data or use fallback if API fails
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('ProductView: Received productId:', productId);
        if (productId) {
          const response = await productDetail(productId);
          console.log('ProductView: API response:', response);
          if (response?.data?.data) {
            console.log(
              'Product details fetched successfully:',
              response.data.data,
            );
            setProductDetails(response.data.data);
          } else {
            // Fallback data if API doesn't return expected structure
            console.log('ProductView: Using fallback data');
            setProductDetails(getFallbackProductData());
          }
        } else {
          // If no productId is provided, use fallback data
          console.log('ProductView: No productId, using fallback data');
          setProductDetails(getFallbackProductData());
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        // Use fallback data on error
        setProductDetails(getFallbackProductData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, isFocused]);

  const getFallbackProductData = () => {
    return {
      id: 1,
      title: 'Razer BlackShark V2 Pro',
      price: 25,
      oldPrice: 129,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. TriHGX spatial audio for added immersion. 50mm drivers deliver powerful sound while cooling gel-infused ear cushions provide all-day comfort.',
      images: [{path: require('../../../assets/images/headset.png')}],
      average_rating: 4.8,
      total_reviews: 246,
      shop: {
        shop_name: 'Razer Official Store',
        logo: images.xiaomiLogo,
      },
    };
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (addedToCart) {
      // If already added, navigate to cart
      navigation.navigate('Cart');
      return;
    }

    // Check if product details and ID are available
    if (!productDetails || !productDetails.id) {
      showMessage('Product information not available. Please try again.');
      return;
    }

    try {
      setAddingToCart(true);

      // Prepare form data
      const form = new FormData();
      form.append('quantity', quantity.toString());

      // Add color if available
      if (colors[selectedColor]) {
        form.append('color', colors[selectedColor].color);
      }

      console.log('Adding to cart - Product ID:', productDetails.id);
      console.log('Form data:', form);

      // Call API to add to cart - pass product ID as first parameter
      const response = await addProductToCart(productDetails.id, form);

      console.log('Add to cart response:', response);

      if (response?.data?.success || response?.data?.message) {
        setAddedToCart(true);
        showMessage(response?.data?.message || 'Product added to cart!');
      } else {
        showMessage('Failed to add product to cart.');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showMessage('Error adding product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Helper function to render stars based on rating
  const renderStars = rating => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          size={12}
          fill={index < rating ? '#FFD700' : 'none'}
          color={index < rating ? '#FFD700' : '#ccc'}
        />
      ));
  };

  // Helper to show message based on platform
  const showMessage = message => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.wishlistButton}>
          <Heart size={24} color="#000" />
        </TouchableOpacity>
      </View> */}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              typeof productDetails?.images[0]?.path === 'string'
                ? {uri: productDetails.images[0].path}
                : productDetails?.images[0]?.path ||
                  require('../../../assets/images/headset.png')
            }
            style={styles.productImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.galleryButton}>
            <Heart size={10} style={styles.galleryButtonText} />
          </TouchableOpacity>
        </View>

        {/* Product Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>
            {productDetails?.title || 'Razer BlackShark V2 Pro'}
          </Text>

          <Text style={styles.productDescription}>
            {productDetails?.description ||
              'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy Lorem Ipsum is simply dummy'}
          </Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingLeftSection}>
              <View style={styles.stars}>
                {renderStars(productDetails?.average_rating || 4.8)}
              </View>
              <Text style={styles.ratingCount}>
                {productDetails?.average_rating || '4.8'} (
                {productDetails?.total_reviews || '246'})
              </Text>
            </View>
            <View style={styles.connectButtonContainer}>
              <TouchableOpacity style={styles.iconSmallButton}>
                <Image source={images.save} style={styles.actionIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconSmallButton}>
                <Image source={images.share} style={styles.actionIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${productDetails?.price}</Text>
            <Text style={styles.oldPrice}>${productDetails?.oldPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-22%</Text>
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Select Color:</Text>
            <Text style={styles.colorName}>Space Gray</Text>
            <View style={styles.colorOptions}>
              {colors.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.colorCircle,
                    {backgroundColor: item.color},
                    selectedColor === item.id && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(item.id)}
                />
              ))}
            </View>
          </View>

          {/* Quantity Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quantity:</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}>
                <Minus size={18} color="#000" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}>
                <Plus size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Buy Now Button Row */}
          {/* <View style={styles.buyContainer}>
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <ShoppingBag size={22} color="#000" />
            </TouchableOpacity>
          </View> */}
          <View style={styles.buyContainer}>
            <TouchableOpacity
              style={[styles.buyButton, addedToCart && styles.addedButton]}
              onPress={handleAddToCart}
              disabled={addingToCart}>
              {addingToCart ? (
                <Text style={styles.buyButtonText}>Adding...</Text>
              ) : (
                <>
                  {addedToCart ? (
                    <View style={styles.addedContainer}>
                      <Check size={16} color="white" style={{marginRight: 6}} />
                      <Text style={styles.buyButtonText}>Added to Cart</Text>
                    </View>
                  ) : (
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                  )}
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Cart')}>
              <ShoppingBag size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Seller Contact Section - Added to match screenshot */}
        <View style={styles.sellerContactContainer}>
          <View style={styles.sellerContactLeft}>
            <View style={styles.questionIconContainer}>
              <Text style={styles.questionIcon}>?</Text>
            </View>
            <View>
              <Text style={styles.sellerContactTitle}>
                Still in doubt? Contact the seller!
              </Text>
              <Text style={styles.sellerContactSubtitle}>
                Sellers are willing to help you
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.askQuestionButton}>
            <Text style={styles.askQuestionText}>Ask Question</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Reviews</Text>

          {reviewData.length > 0 ? (
            reviewData.map(review => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitials}>M</Text>
                  </View>
                  <View style={styles.reviewerDetails}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <View style={styles.reviewerRating}>
                      <View style={styles.starRow}>
                        {renderStars(review.rating)}
                      </View>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <View style={styles.reviewDivider} />
              </View>
            ))
          ) : (
            <View style={styles.noReviewsContainer}>
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>
                Be the first to review this product!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
  },
  wishlistButton: {
    padding: 5,
  },
  imageContainer: {
    width: '100%',
    height: vh * 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '95%',
    height: '100%',
    backgroundColor: '#f0f8ff',
  },
  galleryButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  // Add these to your styles object
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: '#555',
  },
  connectButtonContainer: {
    flexDirection: 'row',
    alignItems: 'centre',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  iconSmallButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  infoSection: {
    padding: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#555',
    marginBottom: 15,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  oldPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    color: '#00A19D',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  colorName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  colorOptions: {
    flexDirection: 'row',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedColorCircle: {
    borderColor: '#00A19D',
    borderWidth: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  buyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  buyButton: {
    backgroundColor: '#00A19D',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 15,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },

  addedButton: {
    backgroundColor: '#009688', // A slightly different green to show state change
  },
  addedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add these to your styles object
  sellerContactContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerContactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00A19D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  questionIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sellerContactTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  sellerContactSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  askQuestionButton: {
    backgroundColor: '#00A19D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  askQuestionText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  storeSection: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginVertical: 8,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  visitStoreButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: 'flex-start',
  },
  visitStoreText: {
    fontSize: 12,
    color: '#555',
  },
  detailsSection: {
    padding: 15,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  reviewsSection: {
    padding: 15,
    paddingBottom: 30,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  reviewItem: {
    marginBottom: 15,
  },
  reviewerInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewerInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starRow: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 50,
    marginBottom: 10,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ProductView;
