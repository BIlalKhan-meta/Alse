import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface PoppinsLabelProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const PoppinsLabel: React.FC<PoppinsLabelProps> = (props) => {
  return (
    <TextWrapper style={[styles.text, props.style]}>
      {props.children}
    </TextWrapper>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Poppins.Regular,
    color: colors.black,
    fontSize: fontSizes.f14,
    fontWeight: '400'
  },
});

export default PoppinsLabel;
