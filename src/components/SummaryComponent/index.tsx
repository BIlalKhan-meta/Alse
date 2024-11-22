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
  <Card style={[styles.summaryContainer, style]}>
    <InterBoldSmall style={[styles.summary, titleStyle]}>
      Summary
    </InterBoldSmall>
    <View style={styles.summaryTxtContainer}>
      <InterMedium style={styles.summaryText}>Sub Total:</InterMedium>
      <InterRegular style={styles.summaryPrice}>${subTotal}</InterRegular>
    </View>
    <View style={styles.summaryTxtContainer}>
      <InterMedium style={styles.summaryText}>Delivery Charges:</InterMedium>
      <InterRegular style={styles.summaryPrice}>
        ${deliveryCharges}
      </InterRegular>
    </View>
    <HorizontalSeparator />
    <View style={styles.summaryTxtContainer}>
      <InterMedium style={styles.summaryText}>Total:</InterMedium>
      <InterRegular style={styles.summaryPrice}>
        ${Number(subTotal) + Number(deliveryCharges)}
      </InterRegular>
    </View>
  </Card>
);

export default Summary;
