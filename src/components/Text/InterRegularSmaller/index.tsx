import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterRegularSmallerProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const InterRegularSmaller: React.FC<InterRegularSmallerProps> = (props) => {
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
    fontSize: fontSizes.f13,
    fontWeight: '300'
  },
});

export default InterRegularSmaller;