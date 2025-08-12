// Summary.tsx
import React from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import HorizontalSeparator from '../../components/HorizontalSeparator';

import Card from '../../components/Card';
import styles from './styles';
import InterBoldSmall from '../Text/InterBoldSmall';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import CustomButton from '../CustomButton';

interface SummaryProps {
  subTotal: number;
  deliveryCharges: number;

  style: StyleProp<ViewStyle>;
  titleStyle: StyleProp<TextStyle>;
}

const Summary: React.FC<SummaryProps> = ({
  subTotal,
  deliveryCharges,
  style,
  titleStyle,
}) => (
  <View style={[styles.summaryContainer, style]}>
    <View style={styles.summaryTxtContainer}>
      <InterMedium style={styles.summaryText}>Subtotal:</InterMedium>
      <InterRegular style={styles.summaryPrice}>
        ${Number(subTotal) + Number(deliveryCharges)}
      </InterRegular>
    </View>
  </View>
);

export default Summary;
