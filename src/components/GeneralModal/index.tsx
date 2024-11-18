import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import InterBoldSmall from '../Text/InterBoldSmall';
import InterLightAverage from '../Text/InterLightAverage';
import CustomButton from '../CustomButton';
import styles from './styles';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import RegularTextInput from '../TextInput/RegularTextInput';
import {fontSizes, vh, vw} from '../../constant';

interface GeneralModalProps {
  visible: boolean;
  closeModal: () => void;
  icon: ImageSourcePropType;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
  primaryBtn: boolean;
  secondaryBtn?: boolean;
  SecondaryText1?: string;
  SecondaryText2?: string;
  redImage?: boolean;
  loading?: boolean;
  rejectionReason?:string
}

const GeneralModal: React.FC<GeneralModalProps> = ({
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
  redImage,
  loading,
  setRejectionReason,
  rejectionReason
}) => {
  return (
    <Modal
      visible={visible}
      onRequestClose={closeModal}
      animationType="slide"
      transparent>
      <BlurView
        style={styles.absolute}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="white"
      />
      <TouchableOpacity style={styles.blurcontainer} onPress={closeModal} />
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
          {setRejectionReason && <RegularTextInput
                  placeholder="Enter Rejection Reason"
                  placeholderTextColor={colors.inputText}
                  value={rejectionReason}
                  onChangeText={val => setRejectionReason(val)}
                  style={{ 
                    color: colors.inputText,
                    fontSize: fontSizes.f11,
                    height: vh * 6,
                    width: vw * 80,
                    fontWeight: '300',
                    borderColor: 'rgba(48, 86, 112, 0.05)',
                    borderWidth: 1,
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    // backgroundColor:'rgba(48, 86, 112, 0.05)',
                    backgroundColor: colors.inputcolor,
                  }}
              
                />}
          <View style={styles.inputContainer}>
    
                </View>
          {primaryBtn && (
            <CustomButton
              onPress={onPress}
              containerStyle={styles.buttonContainerStyle}
              loading={loading}
              >
              {buttonText}
            </CustomButton>
          )}

          {secondaryBtn && (
            <View style={styles.secondaryBtnCon}>
              <CustomButton
                onPress={onPress}
                style={styles.secondaryBtn1}
                containerStyle={styles.buttonContainerStyle}
                loading={loading}>
                {SecondaryText1}
              </CustomButton>

              <CustomButton
                onPress={closeModal}
                style={styles.secondaryBtn2}
                containerStyle={styles.buttonContainerStyle}
                txtstyle={{color: colors.themeColor}}>
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
