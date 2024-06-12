import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import fonts from '../../../assets/fonts';
import { colors } from '../../../utils/theme';
import TextWrapper from '../TextWrapper';
import { fontSizes } from '../../../constant';

interface InterMediumAverageProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const InterMediumAverage: React.FC<InterMediumAverageProps> = (props) => {
  return (
    <TextWrapper style={[styles.text, props.style]}>
      {props.children}
    </TextWrapper>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Inter.Medium,
    color: colors.darkText,
    fontSize: fontSizes.f13,
    fontWeight: '500'
  },
});

export default InterMediumAverage;