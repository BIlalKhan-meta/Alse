import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterMediumProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  lines?: number;
}

const InterMedium: React.FC<InterMediumProps> = (props) => {
  return (
    <TextWrapper  lines={props.lines} style={[styles.text, props.style]}>
      {props.children}
    </TextWrapper>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Inter.Medium,
    color: colors.darkText,
    fontSize: fontSizes.f12,
    fontWeight: '500'
  },
});

export default InterMedium;