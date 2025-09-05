// CardComponent.tsx
import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import Card from '../Card';
import RegularTextInput from '../TextInput/RegularTextInput';
import DropDownPicker from 'react-native-dropdown-picker';
import {vh, vw} from '../../constant';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useTranslation} from 'react-i18next';

interface CardComponentProps {
  onTextInput: () => void;
  // notifiVisible: boolean;
  // chatVisible: boolean;
  // searchVisible: boolean;
  // back: boolean;
  onVideoPress: () => void;
  onImagePress: () => void;
  onCameraPress: () => void;
  value: string;
  ListOptions?: any;
  privacy?: string;
  setPrivacy?: () => void;
  handleOnChangeText: () => void;
  removeMedia: () => void;
  image?: object | null;
  // dots: boolean;
}
const CardComponent: React.FC<CardComponentProps> = ({
  handleOnChangeText,
  onImagePress,
  onVideoPress,
  onCameraPress,
  ListOptions,
  value,
  setPrivacy,
  privacy,
  image,
  removeMedia,
}) => {
  const [open, setOpen] = useState(false);
  const user = useSelector(selectUserProfile);
  const {t} = useTranslation();

  // console.log('USERRRRRRRRRRRRRRRRRRRRR', user);

  return (
    <Card>
      <View style={styles.card}>
        <Image
          source={user ? {uri: user?.avatar} : images.user}
          style={styles.avatar}
        />

        <TextInput
          // onPress={() => onTextInput()}
          style={styles.input}
          placeholder={`${t('createPost')}?`}
          placeholderTextColor={colors.inputText}
          onChangeText={handleOnChangeText}
          multiline
          value={value}
        />
      </View>
      {ListOptions && privacy && setPrivacy && (
        <View style={{marginVertical: vh * 5, zIndex: 10, marginTop: -4}}>
          <DropDownPicker
            open={open}
            setOpen={setOpen}
            placeholder={t('select')}
            items={ListOptions}
            containerStyle={{height: vh * 3}}
            style={{
              borderWidth: 0,
              width: vw * 30,
              height: vh * 3,
              borderRadius: vh,
              backgroundColor: colors.redShadeLight,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            labelStyle={{color: colors.redStatus}}
            textStyle={{color: colors.redStatus}}
            dropDownContainerStyle={{
              width: vw * 30,
              backgroundColor: colors.redShadeLight,
              borderWidth: 0,
            }}
            value={privacy}
            setValue={setPrivacy}
          />
        </View>
      )}
      <View style={styles.uploadOptions}>
        <TouchableOpacity style={styles.button} onPress={onVideoPress}>
          <Image source={images.video} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{t('video')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onImagePress}>
          <Image source={images.media} style={styles.buttonIcon2} />
          <Text style={styles.buttonText}>{t('image')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onCameraPress}>
          <Image
            source={images.camera}
            resizeMode="contain"
            style={styles.buttonIcon2}
          />
          <Text style={styles.buttonText}>{t('camera')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.media_main}>
        {image && (
          <View style={styles.media_box}>
            <TouchableOpacity
              onPress={() => removeMedia()}
              style={styles.cross_box}>
              <Image source={images.cross} style={styles.cross_icon} />
            </TouchableOpacity>
            <Image
              source={image?.uri ? {uri: image?.uri} : {uri: image}}
              style={styles.media_style}
            />
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  cross_box: {
    width: vh * 2.5,
    height: vh * 2.5,
    borderRadius: vh * 2.5,
    borderWidth: 2,
    backgroundColor: 'transparent',
    zIndex: 99,
    position: 'absolute',
    right: vw * 1.5,
    top: vh * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.white,
  },
  cross_icon: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
  },
  media_main: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-between',
  },
  media_box: {
    width: '100%',
    height: vh * 20,
    borderRadius: vh,
    overflow: 'hidden',
    marginTop: vh * 2,
    marginRight: vw * 2.8,
  },
  media_style: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    // zIndex : 98,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputcolor,
    color: colors.inputText,
    padding: 10,
    borderRadius: 10,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputcolor,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonIcon: {
    width: 17,
    height: 10,
  },
  buttonIcon2: {
    width: 17,
    height: 15,
  },
  buttonText: {
    color: colors.inputText,
    fontSize: 16,
    marginLeft: 5,
  },
});

export default CardComponent;
