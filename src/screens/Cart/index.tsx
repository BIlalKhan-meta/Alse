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
const discount = 10;

const Cart = () => {
  const navigation = useNavigation();
  const isFoused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState<any>();

  const user = useSelector(selectUserProfile);

  const handleChange = async (label: string, id: number) => {
    // Implement increment logic here
    // console.log('Increment item at index:', index);

    let index = cartData?.carts?.data?.findIndex(item => item.id == id);

    let arr = [...cartData?.carts?.data];
    if (arr[index].quantity == 1 && label == 'decrement') {
      return;
    }
    if (label == 'increment') {
      arr[index].quantity = arr[index].quantity + 1;
    } else {
      arr[index].quantity = arr[index].quantity - 1;
    }

    setCartData({...cartData, data: arr});
    const form = new FormData();
    form.append('quantity', arr[index].quantity);
    await updateCartItem(form, id);
  };

  useEffect(() => {
    if (user?.has_subscription) {
      getData();
    }
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

  if (!user?.has_subscription) {
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
              deliveryCharges={deliveryCharges}
              discount={discount}
              // grandTotal={grandTotal}
              grandTotal={cartData?.total_amount + deliveryCharges - discount}
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
