import {
  Image,
  ImageSourcePropType,
  Modal,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import styles from './styles';
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';
import { vh, vw } from '../../constant';

interface BottomModalProps {
  visible: boolean;
  closeModal: () => void;
  icon: ImageSourcePropType;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
  onPressImage: () => void;
  onPressGallery: () => void;
  primaryBtn: boolean;
  secondaryBtn: boolean;
  SecondaryText1: string;
  SecondaryText2: string;
  input: boolean;
  btnStyle: StyleProp<ViewStyle>;
}

const BottomModal: React.FC<BottomModalProps> = props => {
  const {
    visible,
    closeModal,
    icon,
    title,
    message,
    buttonText,
    onPress,
    primaryBtn,
    secondaryBtn,
    SecondaryText1,
    SecondaryText2,
    input,
    btnStyle,
    onPressImage,
    onPressGallery,
  } = props;
  return (
    <>
      <Modal
        visible={visible}
        onRequestClose={closeModal}
        animationType="slide"
        transparent>
        {/* <BlurView
          style={styles.absolute}
          blurType="dark"
          blurAmount={1}
          reducedTransparencyFallbackColor="white"
        /> */}
        <TouchableOpacity style={styles.blurcontainer} onPress={closeModal} />
        <View style={styles.container}>
          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.button} onPress={onPressGallery}>
              <Image source={images.media} style={styles.buttonIcon2} />
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>

            <View
              style={{
                marginHorizontal: vw * 2,
                marginVertical: vh * 1,
                width: vw * 95,
                height: 1,
                backgroundColor: colors.borderColor,
                alignSelf: 'center',
              }}
            />

            <TouchableOpacity style={styles.button} onPress={onPressImage}>
              <Image source={images.camera} resizeMode='contain' style={styles.buttonIcon2} />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
            {onPress && (
              <View>
                <View
                  style={{
                    marginHorizontal: vw * 2,
                    marginVertical: vh * 1,
                    width: vw * 95,
                    height: 1,
                    backgroundColor: colors.borderColor,
                    alignSelf: 'center',
                  }}
                />
                <TouchableOpacity style={styles.button} onPress={onPress}>
                  <Image source={images.video} style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Upload Video</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default BottomModal;
