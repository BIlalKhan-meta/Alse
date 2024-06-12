import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { images } from '../../utils/images';

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
}

const WishlistScreen: React.FC<WishlistProps> = ({ wishlist, onAddToCart, onRemoveFromWishlist }) => {
    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.productContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            <TouchableOpacity onPress={() => onRemoveFromWishlist(item.id)} style={styles.heartIconContainer}>
                <Image source={images.heartIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onAddToCart(item.id)} style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
            <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            </View>
        </View>
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

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    productContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    heartIconContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 1,
    },
    addButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'blue',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    addButtonText: {
        color: 'white',
        fontSize: 20,
    },
    productDetails: {
        padding: 10,
        width: '100%',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    productPrice: {
        fontSize: 14,
        color: 'gray',
    },
});

export default WishlistScreen;
