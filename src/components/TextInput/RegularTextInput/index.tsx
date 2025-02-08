import React, {useState} from 'react';
import {
  TextInput,
  TextInputProps,
  StyleProp,
  TextStyle,
  View,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import TextInputWrapper from '../TextInputWrapper';
import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../../constant';
import {colors} from '../../../utils/theme';
import InterRegularSmallest from '../../Text/InterRegularSmallest';
import InterRegular from '../../Text/InterRegular';
import {images} from '../../../utils/images';

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
  maxLength?: number;
}

const RegularTextInput: React.FC<RegularTextInputProps> = props => {
  const textInputStyle = props.multiline
    ? styles.textinputMultiline
    : styles.textinput;

  return (
    <>
      <View style={[styles.container, props.containerStyle]}>
        {props.label && (
          <InterRegular style={[styles.label, props.labelStyle]}>
            {props?.label}
          </InterRegular>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={[textInputStyle, props.style]}
            {...props}
            maxLength={props.maxLength}
          />
          {props.secureTextEntry !== undefined && (
            <TouchableOpacity
              onPress={props?.onPressCurrentPassword}
              style={styles.eyeicon}>
              <Image 
                source={props.secureTextEntry ? images.VisibilityOffIcon : images.EyeIcon} 
                tintColor={colors.black}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {props?.errors && (
        <InterRegularSmallest style={styles.error}>
          {props?.errors}
        </InterRegularSmallest>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {marginTop: vh * 3},
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: vw * 2,
    color: colors.black,
    fontSize: fontSizes.f14,
  },
  textinput: {
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
    backgroundColor: colors.inputcolor,
    textAlignVertical: 'top',
  },
  eyeicon: {
    position: 'absolute',
    right: vw * 2,
    height: vh * 4,
    width: vw * 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  error: {
    color: colors.redText,
    marginTop: vh * 1,
    width: '100%',
    alignSelf: 'flex-start',
    marginLeft: vw * 2,
  },
});

export default RegularTextInput;
