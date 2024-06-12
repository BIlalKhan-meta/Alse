import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterBoldLabelProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const InterBoldLabel: React.FC<InterBoldLabelProps> = (props) => {
  return (
    <TextWrapper style={[styles.text, props.style]}>
      {props.children}
    </TextWrapper>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Inter.Bold,
    color: colors.black,
    fontSize: fontSizes.f14,
    fontWeight: '900'
  },
});

export default InterBoldLabel;