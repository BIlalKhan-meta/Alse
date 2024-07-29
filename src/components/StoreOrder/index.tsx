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

const colorsType = ['red', 'blue', 'green',];
const sizes = ['S', 'M', 'L'];

const StoreOrderComponent: React.FC = () => {
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);






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

    return (

        <View style={styles.container}>

            <View>
                <InterRegular style={styles.label}>
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution.
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
                <CustomButton style={styles.checkoutButton}>
                    Add to Cart
                </CustomButton>

                <QunatityControls
                    quantity={1}
                    onIncrement={() => handleIncrement(index)}
                    onDecrement={() => handleDecrement(index)}
                />
            </View>


        </View>

    )
}

export default StoreOrderComponent

