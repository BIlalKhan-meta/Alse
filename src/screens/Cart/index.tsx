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
import {getCart} from '../../api/product';
import Loader from '../../components/Loader';

const deliveryCharges = 15;
const discount = 10;

const Cart = () => {
  const navigation = useNavigation();
  const isFoused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState([]);

  const handleIncrement = (index: number) => {
    // Implement increment logic here
    console.log('Increment item at index:', index);
    index + 1;
  };

  const handleDecrement = (index: number) => {
    // Implement decrement logic here
    console.log('Decrement item at index:', index);
    index - 1;
  };

  const handleDelete = (index: number) => {
    // Implement delete logic here
    console.log('Delete item at index:', index);
  };

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
    console.log('====================================');
    console.log(res?.data?.data?.carts?.data, '====ressss');
    console.log('====================================');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
    });
  }, [navigation]);

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Card style={styles.contentContainer}>
          <FlatList
            data={cartData?.carts?.data}
            renderItem={({item, index}) => (
              <>
                <CartItem
                  item={item}
                  showQuantityControls={true} // Show increment/decrement buttons
                  onIncrement={() => handleIncrement(index)}
                  onDecrement={() => handleDecrement(index)}
                  onDelete={() => handleDelete(index)}
                  showSeparator={index !== products.length - 1}
                  showDelete={true}
                />
              </>
            )}
            keyExtractor={item => item.id}
          />
        </Card>

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
          onPress={() => navigation.navigate('Shop')}>
          Continue Shopping
        </CustomButton>
      </View>
    </ScrollView>
  );
};

export default Cart;
