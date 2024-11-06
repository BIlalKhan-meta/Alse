import React from 'react';
import {View} from 'react-native';
import InterBoldLabel from '../Text/InterBoldLabel';
import CustomButton from '../CustomButton';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../utils/theme';

export const Subscribe = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.headerColor,
      }}>
      <InterBoldLabel>Subscription Required</InterBoldLabel>
      <CustomButton onPress={() => navigation.navigate('SubscriptionPlan')}>
        Subscribe
      </CustomButton>
    </View>
  );
};
