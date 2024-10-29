import React, { useState } from 'react'
import { Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';
import styles from './styles';
// import TabsComponent from '../TabsComponent';
import InterBold from '../Text/InterBold';
import InterRegular from '../Text/InterRegular';
import CustomButton from '../CustomButton';
import QunatityControls from '../QuantityControls';
import Selection from '../Selection';
import { useNavigation } from '@react-navigation/native';
import { addProductToCart } from '../../api/product';
import { getMessage, Toast } from '../../utils/helpers';

const colorsType = ['red', 'blue', 'green',];
const sizes = ['S', 'M', 'L'];

const StoreOrderComponent: React.FC = (props) => {

    const navigation = useNavigation();
    const productItem = props?.productItem;
    console.log('====================================');
    console.log(productItem, "Frommm propssssss ");
    console.log('====================================');
    const [selectedColor, setSelectedColor] = useState<string | null>('red');
    const [selectedSize, setSelectedSize] = useState<string | null>('L');






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


    const handleAddToCart = async () => {

        try {
            const res = await addProductToCart(productItem?.id)
            console.log('response from addtocartttt ====>', res?.data?.message);
            Toast.success(getMessage(res?.data?.message));

        } catch (error) {
            Toast.error(getMessage(error?.message));
            console.log("Fromm add tocartt erro", error);
        }


        // .then((res) => {
        //     console.log('response from addtocartttt ====>', res);

        //     // Optionally navigate or show success message
        //     // navigation.navigate("Login");
        //     // resetForm()
        //     // setSuccessModel(true)
        //     // setSubmitted(false)
        // })
        // .catch((error) => {
        //     console.error("addtoCarttt error:", error.response);
        //     Toast.error(getMessage(error?.message));
        // });
    }


    // return(
    //     <View style={{backgroundColor:"red",flex:1,borderWidth:1}}>
    //         <Text>HRy</Text>
    //     </View>
    // )

    return (

        <View style={styles.container}>

            <View>
                <InterRegular style={styles.label}>
                    {productItem?.description}
                </InterRegular>
            </View>

            <View style={styles.selectionCon}>

                <Selection
                    mode="color"
                    options={colorsType}
                    selectedOption={selectedColor}
                    setSelectedOption={setSelectedColor}
                />
                <Selection
                    mode="size"
                    options={sizes}
                    selectedOption={selectedSize}
                    setSelectedOption={setSelectedSize}
                />
            </View>


            <View style={styles.btnContainer}>
                <CustomButton containerStyle={styles.checkoutButton}
                    // onPress={() => navigation.navigate("Cart")}
                    onPress={() => handleAddToCart()}
                >
                    Add to Cart
                </CustomButton>

                <QunatityControls
                    quantity={1}
                    onIncrement={() => handleIncrement(1)}
                    onDecrement={() => handleDecrement(1)}
                />
            </View>


        </View>

    )
}

export default StoreOrderComponent

