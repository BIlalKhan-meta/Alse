import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { images } from '../../utils/images';
import { vh } from '../../constant';
import styles from './styles';
import InterRegular from '../Text/InterRegular';
import InterBoldAverage from '../Text/InterBoldAverage';

interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
}

interface WishlistProps {
    wishlist: Product[];
    onAddToCart: (productId: string) => void;
    onRemoveFromWishlist: (productId: string) => void;
    heart: boolean;
    addCart: boolean;
    product: boolean;
    onPress: () => void;
}

const WishlistScreen: React.FC<WishlistProps> = ({ wishlist, onAddToCart, onRemoveFromWishlist, heart, addCart, product, onPress }) => {
    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.productContainer}
            onPress={onPress}
        >
            <Image source={item.imageUrl} style={styles.productImage} />
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

                    <InterRegular style={styles.productName}>{product ? "Product Name" : item.name}</InterRegular>
                    {item.price ? (
                        <InterBoldAverage style={styles.productPrice}>${item.price.toFixed(2)}</InterBoldAverage>
                    ) : <Text> </Text>}
                </View>
                {product &&
                    <InterRegular style={styles.product}>{item.name}</InterRegular>
                }
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={wishlist}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.container}
        />
    );
};



export default WishlistScreen;
