import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { images } from '../../utils/images';
import { vh } from '../../constant';
import styles from './styles';
import InterRegular from '../Text/InterRegular';
import InterBoldAverage from '../Text/InterBoldAverage';

// interface Product {
//     id: string;
//     name: string;
//     price: number;
//     imageUrl: string;
//     size: string
// }

interface WishlistProps {
    wishlist: [];
    onAddToCart: (productId: string) => void;
    onRemoveFromWishlist: (productId: string) => void;
    heart: boolean;
    addCart: boolean;
    product: boolean;
    onPress: () => void;
}

const WishlistScreen: React.FC<WishlistProps> = ({ wishlist, onAddToCart, onRemoveFromWishlist, heart, addCart, product, onPress }) => {

    const renderItem = ({ item }) => {
        console.log('====================================');
        console.log(item, "Itemmmm frommmm my shoppppppp????");
        console.log('====================================');
        return (
            <TouchableOpacity style={styles.productContainer}
                // onPress={onPress}
                onPress={() => onPress(item.id, item.user_id)}
            >
                <Image source={item?.banner ? { uri: item.banner } : item?.images[0].path ? { uri: item.images[0].path } : null} style={styles.productImage} />
                {heart &&
                    <TouchableOpacity onPress={() => onRemoveFromWishlist(item.id)} style={styles.heartIconContainer}>
                        <Image source={images.heartIcon} />
                    </TouchableOpacity>
                }
                {addCart &&
                    <TouchableOpacity onPress={() => onAddToCart(item.id)} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                }
                <View>
                    <View style={styles.productDetails}>

                        <InterRegular style={styles.productName}>{product ? item?.title : item.shop_name}</InterRegular>
                        {item?.price ? (
                            <InterBoldAverage style={styles.productPrice}>$
                                {Number(item?.price)?.toFixed(2)}
                            </InterBoldAverage>
                        ) : <Text> </Text>}
                    </View>
                    {product && item.size &&
                        <InterRegular style={styles.product}>Size: {item.size}</InterRegular>
                    }
                    {item.colors && <InterRegular style={styles.product}>Color: Red, Green, Blue</InterRegular>}

                </View>
            </TouchableOpacity>
        )
    }

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <InterRegular style={styles.emptyText}>No Data to Show.</InterRegular>
        </View>
    );

    return (
        <FlatList
            data={wishlist}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.container}
            ListEmptyComponent={renderEmpty}

        />
    );
};



export default WishlistScreen;
