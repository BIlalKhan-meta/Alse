import React, { useEffect, useState } from 'react'
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import styles from './styles';
import WishlistScreen from '../WishList';

import { images } from '../../utils/images';
import { colors } from '../../utils/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownTextInput from '../TextInput/DropDownTextInput';
import DropDownTextInput2 from '../TextInput/DropDownTextInput2';
import { dummyWishlist } from '../../dummyData';
import InterBoldAverage from '../Text/InterBoldAverage';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
// import GeneralRatingModal from '../GeneralRatingModal';

const items = [
    { label: 'Active', value: 'active' },
    { label: 'InActive', value: 'inactive' },
];
const ShopComponent: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const type = route?.params?.type;
    const [dropdownColor, setDropdownColor] = useState(colors.red);
    const [dropdownValue, setDropdownValue] = useState<string | null>('active');
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        if (dropdownValue === 'active') {
            console.log("Coming")
            setDropdownColor(colors.green);
        } else if (dropdownValue === 'inactive') {
            console.log("ComingR")

            setDropdownColor(colors.red);
        }
    }, [dropdownValue]);

    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);

    };

    const handleAddToCart = (productId: string) => {
        // Implement your logic to add the product to cart
        console.log(`Product with id ${productId} added to cart`);
    };

    const handleRemoveFromWishlist = (productId: string) => {
        // Implement your logic to remove the product from wishlist
        console.log(`Product with id ${productId} removed from wishlist`);
    };

    const handleSubmitFeedback = (review: string, rating: number) => {
        console.log(`Review: ${review}, Rating: ${rating}`);
        // Handle the submission logic here
    };


    return (
        <View
            style={styles.container}
        >
            <View style={styles.contentContainer}>







                <WishlistScreen
                    wishlist={dummyWishlist}
                    onAddToCart={handleAddToCart}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                    heart={true}
                    addCart={true}
                    product={true}
                    type={type}
                />
            </View>
        </View>
    )
}

export default ShopComponent

