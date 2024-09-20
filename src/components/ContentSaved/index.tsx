import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ViewStyle } from 'react-native';
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
    title: string;
    viewBtn: string;
    item: {};
    onAddToCart: (productId: string) => void;
    onRemoveFromContentSaved: (productId: string) => void;
    onItemPress: () => void;
    style: ViewStyle
}

const ContentSavedScreen: React.FC<ContentSavedProps> = ({ item, onAddToCart, onRemoveFromContentSaved, title, viewBtn, onItemPress, style }) => {



    return (
        <TouchableOpacity style={[styles.productContainer, style]}
            onPress={onItemPress}
        >
            <Image source={item.imageUrl} style={styles.productImage} />

            <View style={styles.productDetails}>
                <View>
                    <InterMedium style={styles.blogTitle}>{title}</InterMedium>
                    <InterRegular style={styles.blogDetail}>{item.name}</InterRegular>
                    {viewBtn && (
                        <TouchableOpacity style={styles.viewBtn}>
                            <InterRegular style={styles.viewText}>{viewBtn}</InterRegular>
                        </TouchableOpacity>
                    )}

                </View>
                {item.active ? <TouchableOpacity
                    // onPress={() => onAddToCart(item.id)}
                    style={styles.activeButton}
                >
                    <InterRegular style={styles.addButtonText}>Active</InterRegular>
                </TouchableOpacity> : <TouchableOpacity
                    // onPress={() => onAddToCart(item.id)}
                    style={styles.inactiveButton}
                >
                    <InterRegular style={styles.addButtonText}>InActive</InterRegular>
                </TouchableOpacity>}
            </View>

        </TouchableOpacity>

    );
};



export default ContentSavedScreen;
