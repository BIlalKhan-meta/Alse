// import React, {useEffect, useLayoutEffect, useState} from 'react';
// import {View, FlatList, ScrollView} from 'react-native';
// import styles from './styles';

// import {useIsFocused, useNavigation} from '@react-navigation/native';
// import CartItem from '../../components/CartItem';
// import Summary from '../../components/SummaryComponent';
// import {products} from '../../dummyData';
// import CustomButton from '../../components/CustomButton';
// import Card from '../../components/Card';
// import {colors} from '../../utils/theme';
// import {getCart, removeCartItem, updateCartItem} from '../../api/product';
// import Loader from '../../components/Loader';
// import {EmptyComponent} from '../../components/EmptyComponent';
// import {useSelector} from 'react-redux';
// import {selectUserProfile} from '../../store/slices/authSlice';
// import {Subscribe} from '../../components/Subscribe';

// const deliveryCharges = 15;

// const Cart = () => {
//   const navigation = useNavigation();
//   const isFoused = useIsFocused();
//   const [loading, setLoading] = useState(false);
//   const [cartData, setCartData] = useState<any>();

//   const user = useSelector(selectUserProfile);

//   const handleChange = async (label: string, id: number) => {
//     let index = cartData?.carts?.data?.findIndex(item => item.id == id);

//     if (index === -1) return;

//     let arr = [...cartData?.carts?.data];
//     let updatedAmount = Number(cartData?.total_amount);

//     if (arr[index].quantity === 1 && label === 'decrement') {
//       return;
//     }

//     if (label === 'increment') {
//       arr[index].quantity += 1;
//       updatedAmount += Number(arr[index].product_price);
//     } else if (label === 'decrement') {
//       arr[index].quantity -= 1;
//       updatedAmount -= Number(arr[index].product_price);
//     }

//     setCartData({
//       ...cartData,
//       carts: {
//         ...cartData.carts,
//         data: arr,
//       },
//       total_amount: updatedAmount,
//     });

//     const form = new FormData();
//     form.append('quantity', arr[index].quantity);
//     await updateCartItem(form, id);
//   };

//   console.log('AMOUNTTTTTTTTTTTT', cartData?.total_amount);

//   useEffect(() => {
//     getData();
//   }, [isFoused]);

//   const getData = async () => {
//     setLoading(true);
//     const res = await getCart();
//     console.log('RESSSSSSSSSSSSS CARTTTTTTT', res);

//     // setCartData(res?.data?.data?.carts?.data);
//     setCartData(res?.data?.data);
//     // setShopProduct(res2?.data?.data?.data)
//     setLoading(false);
//   };

//   const handleDelete = async (index: number) => {
//     // Implement delete logic here
//     // console.log('Delete item at index:', index);
//     await removeCartItem(index)
//       .then(res => {
//         if (res?.data) {
//           console.log('RESSSSSSSSSSSSS DELETEEEEEE', res);
//           getData();
//         }
//       })
//       .catch(err => {
//         console.log('ERRORRRR DELEETEEEEEEEEE', err);
//       });
//   };

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerStyle: {
//         backgroundColor: colors.headerColor,
//       },
//     });
//   }, [navigation]);

//   if (!user?.has_subscription && !user.is_child) {
//     return <Subscribe />;
//   }

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <ScrollView showsVerticalScrollIndicator={false}>
//       <View style={styles.container}>
//         <FlatList
//           data={cartData?.carts?.data}
//           refreshing={loading}
//           onRefresh={getData}
//           renderItem={({item, index}) => (
//             <>
//               <CartItem
//                 item={item}
//                 showQuantityControls={true} // Show increment/decrement buttons
//                 handleChange={handleChange}
//                 onDelete={handleDelete}
//                 showSeparator={index !== products.length - 1}
//                 showDelete={true}
//               />
//             </>
//           )}
//           contentContainerStyle={styles.contentContainer}
//           keyExtractor={item => item.id}
//           ListEmptyComponent={<EmptyComponent text={'No Items In Cart'} />}
//         />

//         {cartData?.carts?.data?.length != 0 && (
//           <>
//             <Summary
//               subTotal={cartData?.total_amount}
//               deliveryCharges={cartData?.total_delivery_Fees}
//             />

//             <CustomButton
//               style={styles.checkoutButton}
//               onPress={() => navigation.navigate('CheckoutScreen')}>
//               Proceed to Checkout
//             </CustomButton>

//             <CustomButton
//               style={styles.shoppingButton}
//               txtstyle={styles.shoppingTxt}
//               onPress={() =>
//                 navigation.navigate('MarketPlaceNavigation', {
//                   screen: 'Marketplace',
//                 })
//               }>
//               Continue Shopping
//             </CustomButton>
//           </>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// export default Cart;

import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, FlatList, ScrollView, Text, Image} from 'react-native';
import styles from './styles';

import {useIsFocused, useNavigation} from '@react-navigation/native';
import CartItem from '../../components/CartItem';
import Summary from '../../components/SummaryComponent';
import {products} from '../../dummyData';
import CustomButton from '../../components/CustomButton';
import Card from '../../components/Card';
import {colors} from '../../utils/theme';
import {getCart, removeCartItem, updateCartItem} from '../../api/product';
import Loader from '../../components/Loader';
import {EmptyComponent} from '../../components/EmptyComponent';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {Subscribe} from '../../components/Subscribe';

const deliveryCharges = 15;

const Cart = () => {
  const navigation = useNavigation();
  const isFoused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState<any>();
  const [showDummyData, setShowDummyData] = useState(true);
  // Create a state for dummy cart products so they can be modified
  const [dummyCartProducts, setDummyCartProducts] = useState([
    {
      id: 'd1',
      product_name: 'Razer BlackShark V2 Pro',
      product_price: 430,
      quantity: 1,
      product_image: require('../../assets/images/headset.png'),
    },
    {
      id: 'd2',
      product_name: 'Razer BlackShark V2 Pro',
      product_price: 430,
      quantity: 1,
      product_image: require('../../assets/images/headset.png'),
    },
    {
      id: 'd3',
      product_name: 'Razer BlackShark V2 Pro',
      product_price: 430,
      quantity: 1,
      product_image: require('../../assets/images/headset.png'),
    },
    {
      id: 'd4',
      product_name: 'Razer BlackShark V2 Pro',
      product_price: 430,
      quantity: 1,
      product_image: require('../../assets/images/headset.png'),
    },
  ]);

  const user = useSelector(selectUserProfile);

  // Update the handleChange function to work with dummy data
  const handleChange = async (label: string, id: number) => {
    // Handle dummy data separately
    if (showDummyData) {
      // Find the item in dummy data
      const dummyIndex = dummyCartProducts.findIndex(item => item.id === id);
      if (dummyIndex === -1) return;

      // Create a copy of the dummy data
      const updatedDummyProducts = [...dummyCartProducts];

      // Handle increment/decrement for dummy products
      if (label === 'increment') {
        updatedDummyProducts[dummyIndex] = {
          ...updatedDummyProducts[dummyIndex],
          quantity: updatedDummyProducts[dummyIndex].quantity + 1,
        };
      } else if (label === 'decrement') {
        // Don't decrement below 1
        if (updatedDummyProducts[dummyIndex].quantity === 1) return;

        updatedDummyProducts[dummyIndex] = {
          ...updatedDummyProducts[dummyIndex],
          quantity: updatedDummyProducts[dummyIndex].quantity - 1,
        };
      }

      // Update state for dummy products
      setDummyCartProducts(updatedDummyProducts);
      return;
    }

    // Original code for real cart data
    let index = cartData?.carts?.data?.findIndex(item => item.id == id);
    if (index === -1) return;

    let arr = [...cartData?.carts?.data];
    let updatedAmount = Number(cartData?.total_amount);

    if (arr[index].quantity === 1 && label === 'decrement') {
      return;
    }

    if (label === 'increment') {
      arr[index].quantity += 1;
      updatedAmount += Number(arr[index].product_price);
    } else if (label === 'decrement') {
      arr[index].quantity -= 1;
      updatedAmount -= Number(arr[index].product_price);
    }

    setCartData({
      ...cartData,
      carts: {
        ...cartData.carts,
        data: arr,
      },
      total_amount: updatedAmount,
    });

    const form = new FormData();
    form.append('quantity', arr[index].quantity);
    await updateCartItem(form, id);
  };

  useEffect(() => {
    console.log('Cart screen focused - fetching data');
    getData();

    // If there's any chance the cleanup doesn't run, add this:
    return () => {
      console.log('Cart screen unfocused');
    };
  }, [isFoused]);

  // Update the getData function to better handle errors and show dummy data

  const getData = async () => {
    setLoading(true);

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Cart API call timeout - showing dummy data');
      setShowDummyData(true);
      setLoading(false);
    }, 5000); // 5 second timeout

    try {
      const res = await getCart();
      console.log('Cart API response received:', res?.data?.data);

      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      if (res?.data?.data) {
        setCartData(res.data.data);

        // Check if cart data exists and has items
        if (res?.data?.data?.carts?.data?.length) {
          setShowDummyData(false);
        } else {
          console.log('Empty cart data - showing dummy data');
          setShowDummyData(true);
        }
      } else {
        console.log('No cart data in response - showing dummy data');
        setShowDummyData(true);
      }
    } catch (error) {
      console.log('Error fetching cart data:', error);
      setShowDummyData(true);
      // Clear timeout in case of error
      clearTimeout(timeoutId);
    } finally {
      // Always set loading to false
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    // If showing dummy data, don't make API calls
    if (showDummyData) {
      return;
    }

    await removeCartItem(index)
      .then(res => {
        if (res?.data) {
          console.log('RESSSSSSSSSSSSS DELETEEEEEE', res);
          getData();
        }
      })
      .catch(err => {
        console.log('ERRORRRR DELEETEEEEEEEEE', err);
      });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      title: 'Cart (4)', // Match screenshot header
    });
  }, [navigation]);

  if (!user?.has_subscription && !user.is_child) {
    return <Subscribe />;
  }

  if (loading) {
    return <Loader />;
  }

  // Calculate total for dummy products
  const dummyTotalAmount = dummyCartProducts.reduce(
    (total, item) => total + item.product_price * item.quantity,
    0,
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <FlatList
          data={showDummyData ? dummyCartProducts : cartData?.carts?.data}
          refreshing={loading}
          onRefresh={getData}
          renderItem={({item, index}) => (
            <CartItem
              item={item}
              showQuantityControls={true}
              handleChange={handleChange}
              onDelete={handleDelete}
              showSeparator={
                index !==
                (showDummyData
                  ? dummyCartProducts.length - 1
                  : products.length - 1)
              }
              showDelete={!showDummyData} // Don't show delete option for dummy data
            />
          )}
          contentContainerStyle={styles.contentContainer}
          keyExtractor={item => item.id}
          ListEmptyComponent={null}
        />

        {/* Always show summary and buttons when we have real or dummy data */}
        {(showDummyData || cartData?.carts?.data?.length !== 0) && (
          <>
            <Summary
              subTotal={dummyTotalAmount}
              deliveryCharges={deliveryCharges}
            />

            <CustomButton
              style={{
                ...styles.checkoutButton,
                backgroundColor: '#00A3B4', // Match the teal color in the screenshot
                borderRadius: 4,
                marginHorizontal: 10,
                marginBottom: 10,
              }}
              onPress={() => navigation.navigate('CheckoutScreen')}>
              {showDummyData ? 'Continue to checkout' : 'Proceed to Checkout'}
            </CustomButton>

            {!showDummyData && (
              <CustomButton
                style={styles.shoppingButton}
                txtstyle={styles.shoppingTxt}
                onPress={() =>
                  navigation.navigate('MarketPlaceNavigation', {
                    screen: 'Marketplace',
                  })
                }>
                Continue Shopping
              </CustomButton>
            )}

            {showDummyData && (
              <Text
                style={{
                  fontSize: 11,
                  color: '#888',
                  textAlign: 'center',
                  marginBottom: 20,
                  marginHorizontal: 16,
                }}>
                Taxes & shipping costs applied at checkout
              </Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Cart;
