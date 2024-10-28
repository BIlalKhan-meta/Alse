import React from "react";
import { TextInput, TextInputProps, StyleProp, TextStyle, View, Image, TouchableOpacity, ViewStyle } from "react-native";
import TextInputWrapper from '../TextInputWrapper'
import { StyleSheet } from "react-native";
import InterBoldLabel from "../../Text/InterBoldLabel";
import { fontSizes, vh, vw } from "../../../constant";
import { colors } from "../../../utils/theme";
import fonts from "../../../assets/fonts";
// import VisibilityOffIcon from '../../../assets/icons/visibilityofficon.png';
// import EyeIcon from '../../../assets/icons/eyeicon.png';
import InterRegularSmall from "../../Text/InterRegularSmall";
import InterRegularSmaller from "../../Text/InterRegularSmaller";
import InterRegularSmallest from "../../Text/InterRegularSmallest";
import InterRegular from "../../Text/InterRegular";
import { images } from "../../../utils/images";

interface RegularTextInputProps extends TextInputProps {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
  secureTextEntry?: boolean;
  onPressCurrentPassword?: () => void;
  onPressPassword?: () => void;
  onPressCPassword?: () => void;
  submitted?: boolean;
  errors?: string;
  labelStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  maxLength: number;
}

const RegularTextInput: React.FC<RegularTextInputProps> = (props) => {
  const textInputStyle = props.multiline ? styles.textinputMultiline : styles.textinput;

  return (
    <>
      <View style={[styles.container, props.containerStyle]}>
        {props.label &&
          <InterRegular style={[styles.label, props.labelStyle]}>
            {props?.label}
          </InterRegular>}
        <TextInputWrapper style={[textInputStyle, props.style]}
          {...props}
          maxLength={props.maxLength}
        />
        {(props.label === 'Password' || props.label === 'New Password') &&
          <TouchableOpacity onPress={props?.onPressPassword} style={styles.eyeicon}>
            <Image source={props?.secureTextEntry ? images.VisibilityOffIcon : images.EyeIcon} tintColor={colors.black} />
          </TouchableOpacity>}

        {(props.label === 'Confirm Password' || props.label === 'Confirm New Password') &&
          <TouchableOpacity onPress={props?.onPressCPassword} style={styles.eyeicon}>
            <Image source={props?.secureTextEntry ? images.VisibilityOffIcon : images.EyeIcon} tintColor={colors.black} />
          </TouchableOpacity>}

        {props.label === 'Current Password' &&
          <TouchableOpacity onPress={props?.onPressCurrentPassword} style={styles.eyeicon}>
            <Image source={props?.secureTextEntry ? images.EyeIcon : images.VisibilityOffIcon} tintColor={colors.black} />
          </TouchableOpacity>
        }

        {/* {props.label=== 'New Password' && 
        <TouchableOpacity onPress={props?.onPressPassword} style={styles.eyeicon}>
        <Image source={props?.secureTextEntry ? EyeIcon : VisibilityOffIcon} />
        </TouchableOpacity>} */}

        {/* {props.label=== 'Confirm New Password' && 
        <TouchableOpacity onPress={props?.onPressCPassword} style={styles.eyeicon}>
        <Image source={props?.secureTextEntry ? EyeIcon : VisibilityOffIcon}/>
        </TouchableOpacity>} */}


      </View>

      {props?.errors &&
        <InterRegularSmallest style={styles.error}>
          {props?.errors}
        </InterRegularSmallest>}
    </>
  )
}

const styles = StyleSheet.create({
  container: { marginTop: vh * 4 },
  label: {
    marginLeft: vw * 2,
    color: colors.black,
    fontSize: fontSizes.f14
  },
  textinput: {
    // fontFamily: fonts.Inter.Bold,
    color: colors.inputText,
    fontSize: fontSizes.f11,
    height: vh * 6,
    marginTop: vh * 2,
    width: vw * 85,
    fontWeight: '300',
    borderColor: 'rgba(48, 86, 112, 0.05)',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    // backgroundColor:'rgba(48, 86, 112, 0.05)',
    backgroundColor: colors.inputcolor,
  },
  textinputMultiline: {
    color: colors.inputText,
    fontSize: fontSizes.f11,
    height: vh * 12,
    marginTop: vh * 2,
    width: vw * 85,
    fontWeight: '300',
    borderColor: 'rgba(48, 86, 112, 0.05)',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    // backgroundColor:'rgba(48, 86, 112, 0.05)',
    backgroundColor: colors.inputcolor,
    textAlignVertical: 'top',

  },
  eyeicon: {
    position: 'absolute',
    marginTop: vh * 7,
    marginLeft: vw * 77,
    height: vh * 4,
    width: vw * 8
  },
  error: {
    color: colors.redText,
    marginTop: vh * 1
  }
});

export default RegularTextInput; 