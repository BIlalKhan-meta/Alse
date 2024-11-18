import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ViewStyle,
} from 'react-native';
import {images} from '../../utils/images';
import {vh} from '../../constant';
import InterRegular from '../Text/InterRegular';
import styles from './styles';
import InterMedium from '../Text/InterMedium';
import Row from '../Row';
import {removeSavedItem, saveItem} from '../../api/menu';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface ContentSavedProps {
  title: string;
  viewBtn: string;
  type?: string;
  item: any;
  onAddToCart: (productId: string) => void;
  onRemoveFromContentSaved: (productId: string) => void;
  onItemPress: () => void;
  style: ViewStyle;
  userId: number;
}

const ContentSavedScreen: React.FC<ContentSavedProps> = ({
  item,
  viewBtn,
  onItemPress,
  userId,
  type,
  style,
}) => {
  const [saved, setSaved] = useState(item?.is_saved);

  useEffect(() => {
    if (item) {
      setSaved(item?.is_saved);
    }
  }, [item]);

  const handleSave = async (id: number, isSaved: boolean) => {
    const data = {
      item_id: id,
      item_type: type,
    };
    const form = new FormData();
    Object.entries(data).map(([key, value]) => {
      form.append(key, value);
    });
    if (isSaved) {
      await removeSavedItem(form)
        .then(res => console.log('SAVEDDD ITEMMMMMMMMMM REMOOVEEEDDDD', res))
        .catch(err => console.log('ERRRORRRRRRRRR SAVEDDDDDDDDDDD', err));
    } else {
      await saveItem(form)
        .then(res => console.log('POSTTTT SAVEEEDDDDDDD', res))
        .catch(err => console.log('SAVEEEEDDDDDD POSTTTTT ERRORRRRRR', err));
    }
    setSaved(!saved);
  };

  return (
    <TouchableOpacity
      style={[styles.productContainer, style]}
      onPress={onItemPress}>
      <Image
        source={item?.image ? {uri: item?.image} : images.blog1}
        style={styles.productImage}
      />

      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View>
          <Row justify="space-between">
            <InterMedium lines={2} style={styles.blogTitle}>
              {item?.title}
            </InterMedium>
            {userId == item?.user_id && (
              <TouchableOpacity
                // onPress={() => onAddToCart(item.id)}
                style={
                  item?.status ? styles.activeButton : styles.inactiveButton
                }>
                <InterRegular style={styles.addButtonText}>
                  {item?.status ? 'Active' : 'Inactive'}
                </InterRegular>
              </TouchableOpacity>
            )}
          </Row>
          <InterRegular lines={3} style={styles.blogDetail}>
            {item?.content}
          </InterRegular>
        </View>

        <Row justify="space-between">
          {viewBtn && (
            <TouchableOpacity style={styles.viewBtn}>
              <InterRegular style={styles.viewText}>{viewBtn}</InterRegular>
            </TouchableOpacity>
          )}
          {userId != item?.user_id && (
            <TouchableOpacity
              onPress={() => handleSave(item?.id, item?.is_saved)}>
              <Image
                source={item?.is_saved ? images.unsave : images.save}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
        </Row>
      </View>
      {/* {userId == item?.user_id && (
          <TouchableOpacity
            // onPress={() => onAddToCart(item.id)}
            style={item?.status ? styles.activeButton : styles.inactiveButton}>
            <InterRegular style={styles.addButtonText}>
              {item?.status ? 'Active' : 'Inactive'}
            </InterRegular>
          </TouchableOpacity>
        )} */}
    </TouchableOpacity>
  );
};

export default ContentSavedScreen;
