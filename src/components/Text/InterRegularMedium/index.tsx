import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterRegularMediumProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const InterRegularMedium: React.FC<InterRegularMediumProps> = (props) => {
  return (
    <TextWrapper style={[styles.text, props.style]}>
      {props.children}
    </TextWrapper>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Inter.Regular,
    color: colors.grayText,
    fontSize: fontSizes.f14,
    fontWeight: '300'
  },
});

export default InterRegularMedium;