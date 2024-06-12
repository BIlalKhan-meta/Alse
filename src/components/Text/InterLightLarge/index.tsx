import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterLightLargeProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const InterLightLarge: React.FC<InterLightLargeProps> = (props) => {
  return (
    <TextWrapper style={[styles.text, props.style]}>
      {props.children}
    </TextWrapper>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Inter.Light,
    color: colors.grayText,
    fontSize: fontSizes.f14,
    fontWeight: '400'
  },
});

export default InterLightLarge;