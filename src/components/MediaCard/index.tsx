// MediaCard.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Video from 'react-native-video';
import styles from './styles';
import {images} from '../../utils/images';
import InterRegular from '../Text/InterRegular';
import InterMedium from '../Text/InterMedium';
import {useSelector} from 'react-redux';
import {GetUserProfile, selectUserProfile} from '../../store/slices/authSlice';
import {removeSavedItem, saveItem} from '../../api/menu';

interface MediaCardProps {
  type: 'image' | 'video';
  source: string;
  title: string;
  item: any;
  description: string;
  user_id?: boolean;
  control?: boolean;
  category: string;
  onItemPress: () => void;
  onSavePress?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  type,
  item,
  source,
  title,
  description,
  category,
  control,
  onItemPress,
  user_id,
  onSavePress,
}) => {
  const user = useSelector(selectUserProfile);
  const [saved, setSaved] = useState(item?.is_saved);

  useEffect(() => {
    if (item) {
      setSaved(item?.is_saved);
    }
  }, [item]);

  const handleSave = async (id: number, isSaved: boolean) => {
    console.log('IDDDDDDDDDDDD', id);
    if (onSavePress) {
      onSavePress();
    }
    setSaved(!saved);
    const payload = {
      item_id: id,
      item_type: type,
    };
    if (isSaved) {
      await removeSavedItem(payload)
        .then(res => console.log('SAVEDDD ITEMMMMMMMMMM REMOOVEEEDDDD', res))
        .catch(err => console.log('ERRRORRRRRRRRR SAVEDDDDDDDDDDD', err));
    } else {
      await saveItem(payload)
        .then(res => console.log('POSTTTT SAVEEEDDDDDDD', res))
        .catch(err => console.log('SAVEEEEDDDDDD POSTTTTT ERRORRRRRR', err));
    }
    setSaved(!saved);
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onItemPress}>
      {type === 'video' ? (
        <Video
          source={{uri: source}}
          paused={false}
          style={styles.media}
          controls={control ? control : false}
          resizeMode="contain"
        />
      ) : (
        <Image source={{uri: source}} style={styles.media} />
      )}
      <View style={{flexDirection: 'row'}}>
        <View style={styles.textContainer}>
          <InterMedium style={styles.title}>{title}</InterMedium>
          <InterRegular style={styles.description}>{description}</InterRegular>
          <InterRegular style={styles.category}>{category}</InterRegular>
        </View>

        {user_id != user?.id && (
          <TouchableOpacity
            onPress={() => handleSave(item?.id, item?.is_saved)}
            style={styles.bookmarkContainer}>
            <Image
              source={saved ? images.unsave : images.save}
              style={styles.bookmarkIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MediaCard;
