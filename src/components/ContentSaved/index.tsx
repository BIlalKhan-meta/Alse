import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { images } from '../../utils/images';
import { vh } from '../../constant';
import InterRegular from '../Text/InterRegular';
import InterBoldAverage from '../Text/InterBoldAverage';
import styles from './styles';
import InterMedium from '../Text/InterMedium';

interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
}

interface ContentSavedProps {
    ContentSaved: Product[];
    onAddToCart: (productId: string) => void;
    onRemoveFromContentSaved: (productId: string) => void;
}

const ContentSavedScreen: React.FC<ContentSavedProps> = ({ ContentSaved, onAddToCart, onRemoveFromContentSaved }) => {
    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.productContainer}>
            <Image source={item.imageUrl} style={styles.productImage} />

            <View style={styles.productDetails}>
                <View>
                    <InterMedium style={styles.blogTitle}>Blog Title</InterMedium>
                    <InterRegular style={styles.blogDetail}>{item.name}</InterRegular>
                </View>
                {item.active ? <TouchableOpacity
                    onPress={() => onAddToCart(item.id)}
                    style={styles.activeButton}
                >
                    <InterRegular style={styles.addButtonText}>Active</InterRegular>
                </TouchableOpacity> : <TouchableOpacity
                    onPress={() => onAddToCart(item.id)}
                    style={styles.inactiveButton}
                >
                    <InterRegular style={styles.addButtonText}>InActive</InterRegular>
                </TouchableOpacity>}
            </View>

        </View>
    );


    return (
        <FlatList
            data={ContentSaved}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.container}
        />
    );
};



export default ContentSavedScreen;
