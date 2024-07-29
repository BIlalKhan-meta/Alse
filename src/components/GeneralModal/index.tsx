import React from 'react';
import { Image, ImageSourcePropType, Modal, TouchableOpacity, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import InterBoldSmall from '../Text/InterBoldSmall';
import InterLightAverage from '../Text/InterLightAverage';
import CustomButton from '../CustomButton';
import styles from './styles';
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';

interface GeneralModalProps {
  visible: boolean;
  closeModal: () => void;
  icon: ImageSourcePropType;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
  primaryBtn: boolean;
  secondaryBtn: boolean;
  SecondaryText1: string;
  SecondaryText2: string;
  redImage: boolean;

}

const GeneralModal: React.FC<GeneralModalProps> = ({ visible, closeModal, icon, title, message, buttonText, onPress, primaryBtn, secondaryBtn, SecondaryText1, SecondaryText2, redImage }) => {
  return (
    <Modal
      visible={visible}
      onRequestClose={closeModal}
      animationType="slide"
      transparent
    >
      <BlurView
        style={styles.absolute}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="white"
      />
      <TouchableOpacity
        style={styles.blurcontainer}
        onPress={closeModal}
      />
      <View style={styles.centeredView}>
        <View style={styles.container}>
          {redImage ? (
            <View style={styles.imageConatiner}>
              <Image source={images.linearCircle2} />
              {/* <Image source={icon} style={styles.innerImage} /> */}

            </View>
          ) : (
            <View style={styles.imageConatiner}>
              <Image source={images.linearCircle} />
              <Image source={icon} style={styles.innerImage} />

            </View>
          )}

          <InterBoldSmall style={styles.title}>{title}</InterBoldSmall>
          <InterLightAverage style={styles.message}>{message}</InterLightAverage>

          {primaryBtn && (
            <CustomButton onPress={onPress} containerStyle={styles.buttonContainerStyle}>
              {buttonText}
            </CustomButton>
          )}

          {secondaryBtn && (
            <View style={styles.secondaryBtnCon}>
              <CustomButton onPress={onPress} style={styles.secondaryBtn1}
                containerStyle={styles.buttonContainerStyle}
              >
                {SecondaryText1}
              </CustomButton>

              <CustomButton onPress={closeModal} style={styles.secondaryBtn2}
                containerStyle={styles.buttonContainerStyle}
                txtstyle={{ color: colors.themeColor }}
              >
                {SecondaryText2}
              </CustomButton>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

export default GeneralModal;
