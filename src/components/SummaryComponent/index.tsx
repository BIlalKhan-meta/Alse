// Summary.tsx
import React from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import styles from './styles';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import {useTranslation} from 'react-i18next';

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
}) => {
  const {t} = useTranslation();
  return (
    <View style={[styles.summaryContainer, style]}>
      <View style={styles.summaryTxtContainer}>
        <InterMedium style={styles.summaryText}>{t('subtotal')}</InterMedium>
        <InterRegular style={styles.summaryPrice}>
          ${Number(subTotal) + Number(deliveryCharges)}
        </InterRegular>
      </View>
    </View>
  );
};

export default Summary;
