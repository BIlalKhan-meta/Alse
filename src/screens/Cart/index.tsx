import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import styles from './styles';


import { useNavigation } from '@react-navigation/native';
import CartItem from '../../components/CartItem';
import Summary from '../../components/SummaryComponent';
import { products } from '../../dummyData';
import InterMedium from '../../components/Text/InterMedium';
import CustomButton from '../../components/CustomButton';
import Card from '../../components/Card';
import { colors } from '../../utils/theme';


const Cart = () => {
    const navigation = useNavigation();

    const subTotal = products.reduce((total, product) => total + product.price * product.quantity, 0);
    const deliveryCharges = 15;
    const discount = 10
    const grandTotal = subTotal + deliveryCharges - discount;




    const handleIncrement = (index: number) => {
        // Implement increment logic here
        console.log('Increment item at index:', index);
        index + 1;
    };

    const handleDecrement = (index: number) => {
        // Implement decrement logic here
        console.log('Decrement item at index:', index);
        index - 1
    };

    const handleDelete = (index: number) => {
        // Implement delete logic here
        console.log('Delete item at index:', index);
    };


    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },

        });
    }, [navigation]);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                <Card style={styles.contentContainer}>
                    <FlatList
                        data={products}
                        renderItem={({ item, index }) => (
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
                    subTotal={subTotal}
                    deliveryCharges={deliveryCharges}
                    discount={discount}
                    grandTotal={grandTotal}


                />

                <CustomButton style={styles.checkoutButton}
                    onPress={() => navigation.navigate("CheckoutScreen")}
                >
                    Procced to Checkout
                </CustomButton>

                <CustomButton style={styles.shoppingButton} txtstyle={styles.shoppingTxt}
                    onPress={() => navigation.navigate("Shop")}
                >
                    Continue Shopping
                </CustomButton>


            </View>
        </ScrollView>
    );
};



export default Cart;
