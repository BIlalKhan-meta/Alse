import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, FlatList, ScrollView} from 'react-native';
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

  const user = useSelector(selectUserProfile);

  const handleChange = async (label: string, id: number) => {
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

  console.log('AMOUNTTTTTTTTTTTT', cartData?.total_amount);

  useEffect(() => {
    getData();
  }, [isFoused]);

  const getData = async () => {
    setLoading(true);
    const res = await getCart();

    // setCartData(res?.data?.data?.carts?.data);
    setCartData(res?.data?.data);
    // setShopProduct(res2?.data?.data?.data)
    setLoading(false);
  };

  const handleDelete = async (index: number) => {
    // Implement delete logic here
    // console.log('Delete item at index:', index);
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
    });
  }, [navigation]);

  if (!user?.has_subscription && !user.is_child) {
    return <Subscribe />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <FlatList
          data={cartData?.carts?.data}
          refreshing={loading}
          onRefresh={getData}
          renderItem={({item, index}) => (
            <>
              <CartItem
                item={item}
                showQuantityControls={true} // Show increment/decrement buttons
                handleChange={handleChange}
                onDelete={handleDelete}
                showSeparator={index !== products.length - 1}
                showDelete={true}
              />
            </>
          )}
          contentContainerStyle={styles.contentContainer}
          keyExtractor={item => item.id}
          ListEmptyComponent={<EmptyComponent text={'No Items In Cart'} />}
        />

        {cartData?.carts?.data?.length != 0 && (
          <>
            <Summary
              subTotal={cartData?.total_amount}
              deliveryCharges={cartData?.total_delivery_Fees}
            />

            <CustomButton
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('CheckoutScreen')}>
              Proceed to Checkout
            </CustomButton>

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
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Cart;
