import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterLightLargerProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const InterLightLarger: React.FC<InterLightLargerProps> = (props) => {
  return (
    <TextWrapper style={[styles.text, props.style]}>
      {props.children}
    </TextWrapper>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Inter.Light,
    color: colors.darkText,
    fontSize: fontSizes.f16,
    fontWeight: '300'
  },
});

export default InterLightLarger;