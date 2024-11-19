// MediaCard.tsx
import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Video from 'react-native-video';
import styles from './styles';
import {images} from '../../utils/images';
import InterRegular from '../Text/InterRegular';
import InterMedium from '../Text/InterMedium';
import {useSelector} from 'react-redux';
import {GetUserProfile, selectUserProfile} from '../../store/slices/authSlice';

interface MediaCardProps {
  type: 'image' | 'video';
  source: string;
  title: string;
  description: string;
  user_id?: boolean;
  control?: boolean;
  category: string;
  onBookmarkPress: () => void;
  onItemPress: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  type,
  source,
  title,
  description,
  category,
  control,
  onBookmarkPress,
  onItemPress,
  user_id,
}) => {
  const user = useSelector(selectUserProfile);
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onItemPress}>
      {type === 'video' ? (
        <Video
          source={{uri: source}}
          paused={false}
          style={styles.media}
          controls={control ? control : true}
          resizeMode="cover"
        />
      ) : (
        <Image source={{uri: source}} style={styles.media} />
      )}
      <View style={{flexDirection: 'row'}}>
        <View style={styles.textContainer}>
          <InterMedium style={styles.title}>{title}</InterMedium>
          <InterRegular style={styles.description}>{description}</InterRegular>
          <InterRegular style={styles.category}>{category?.title}</InterRegular>
        </View>

        {user_id != user?.id && (
          <TouchableOpacity
            onPress={onBookmarkPress}
            style={styles.bookmarkContainer}>
            <Image source={images.save} style={styles.bookmarkIcon} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MediaCard;
