// MediaCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import styles from './styles';
import { images } from '../../utils/images';
import InterRegular from '../Text/InterRegular';
import InterMedium from '../Text/InterMedium';

interface MediaCardProps {
    type: 'image' | 'video';
    source: string;
    title: string;
    description: string;
    category: string;
    onBookmarkPress: () => void;
    onItemPress: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ type, source, title, description, category, onBookmarkPress, onItemPress }) => {
    return (
        <TouchableOpacity style={styles.cardContainer}
            onPress={onItemPress}
        >
            {type === 'video' ? (
                <Video
                    source={{ uri: source }}
                    style={styles.media}
                    controls={true}
                    resizeMode="cover"
                />
            ) : (
                <Image source={{ uri: source }} style={styles.media} />
            )}
            <View style={{ flexDirection: "row" }}>

                <View style={styles.textContainer}>
                    <InterMedium style={styles.title}>{title}</InterMedium>
                    <InterRegular style={styles.description}>{description}</InterRegular>
                    <InterRegular style={styles.category}>{category}</InterRegular>
                </View>
                <TouchableOpacity onPress={onBookmarkPress} style={styles.bookmarkContainer}>
                    <Image source={images.save} style={styles.bookmarkIcon} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};



export default MediaCard;
