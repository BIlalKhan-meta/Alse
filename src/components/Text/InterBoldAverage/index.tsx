import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterBoldAverageProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const InterBoldAverage: React.FC<InterBoldAverageProps> = (props) => {
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
    fontSize: fontSizes.f26,
    fontWeight: '600'
  },
});

export default InterBoldAverage;