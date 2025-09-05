import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {vh, vw} from '../../constant';
import {images} from '../../utils/images';
import {AlignLeft, Camera} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';

interface CardDisplayProps {
  style?: StyleProp<ViewStyle>;
  onTextInput?: () => void;
  onImagePress?: () => void;
  onVideoPress?: () => void;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  style,
  onTextInput,
  onImagePress,
  onVideoPress,
}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const {t} = useTranslation();

  const defaultTextHandler = () => navigation.navigate('CreatePost');
  const defaultImageHandler = () =>
    navigation.navigate('CreatePost', {mediaType: 'photo'});
  const defaultVideoHandler = () =>
    navigation.navigate('CreatePost', {mediaType: 'video'});

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Image
          source={user?.avatar ? {uri: user.avatar} : images.profile}
          style={styles.avatar}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.inputField}
          activeOpacity={0.7}
          onPress={onTextInput || defaultTextHandler}>
          <Text style={styles.inputText}>
            {t('createPost')}, {user?.full_name?.split(' ')[0] || 'there'}?
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={onImagePress || defaultImageHandler}>
          <Image source={images.media} style={styles.actionIcon} />
          <Text style={styles.actionText}>{t('photo')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={onVideoPress || defaultVideoHandler}>
          <Camera style={styles.actionText} />
          <Text style={styles.actionText}>{t('camera')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={onTextInput || defaultTextHandler}>
          <AlignLeft style={styles.actionIcon} />
          <Text style={styles.actionText}>{t('text')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: vh * 2,
    marginTop: vh * 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  avatar: {
    width: vh * 5,
    height: vh * 5,
    borderRadius: vh * 2.5,
    marginRight: vh * 1.5,
  },
  inputField: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    padding: vh * 1.5,
    borderRadius: vh * 3,
    justifyContent: 'center',
  },
  inputText: {
    color: '#65676B',
    fontSize: vh * 1.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E4E6EB',
    marginVertical: vh * 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: vh * 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vh * 1,
    paddingHorizontal: vh * 2,
    borderRadius: vh * 1,
  },
  actionIcon: {
    width: vh * 2.2,
    height: vh * 2.2,
    marginRight: vh * 0.8,
    tintColor: '#65676B',
  },
  buttonIcon2: {
    width: 17,
    height: 15,
  },
  actionText: {
    fontSize: vh * 1.5,
    marginRight: vh * 0.5,
    color: '#65676B',
    fontWeight: '500',
  },
});

export default CardDisplay;
