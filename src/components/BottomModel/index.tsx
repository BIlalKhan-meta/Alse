import { Image, ImageSourcePropType, Modal, StyleProp, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import styles from './styles';
import { BlurView } from '@react-native-community/blur';

import InterBold from '../Text/InterBold';
import { images } from '../../utils/images';

interface BottomModalProps {
  visible: boolean;
  closeModal: () => void;
  icon: ImageSourcePropType;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
  onPressImage: () => void;
  onPressCamera: () => void;
  primaryBtn: boolean;
  secondaryBtn: boolean;
  SecondaryText1: string;
  SecondaryText2: string;
  input: boolean;
  btnStyle: StyleProp<ViewStyle>

}

const BottomModal: React.FC<BottomModalProps> = props => {
  const { visible, closeModal, icon, title, message, buttonText, onPress, primaryBtn, secondaryBtn, SecondaryText1, SecondaryText2, input, btnStyle, onPressImage, onPressCamera } = props;
  return (
    <>
      <Modal
        visible={visible}
        onRequestClose={closeModal}
        animationType='slide'
        transparent>
        {/* <BlurView
          style={styles.absolute}
          blurType="dark"
          blurAmount={1}
          reducedTransparencyFallbackColor="white"
        /> */}
        <TouchableOpacity
          style={styles.blurcontainer}
          onPress={closeModal} />
        <View style={styles.container}>


          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.button} onPress={onPressCamera}>
              <Image
                source={images.camera}
                style={styles.buttonIcon2}
              />
              <Text style={styles.buttonText}>Capture Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onPressImage}>
              <Image
                source={images.media}
                style={styles.buttonIcon2}
              />
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}
              onPress={onPress}
            >
              <Image
                source={images.video}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Upload Video</Text>
            </TouchableOpacity>

          </View>

        </View>
      </Modal>
    </>
  );
};


export default BottomModal;