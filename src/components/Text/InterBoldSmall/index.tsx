import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterBoldSmallProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const InterBoldSmall: React.FC<InterBoldSmallProps> = (props) => {
  return (
    <TextWrapper style={[styles.text, props.style]}>
      {props.children}
    </TextWrapper>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Inter.Bold,
    color: colors.blue,
    fontSize: fontSizes.f15,
    fontWeight: '700'
  },
});

export default InterBoldSmall;