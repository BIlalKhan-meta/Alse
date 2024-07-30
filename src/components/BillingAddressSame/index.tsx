

import { StyleProp, Switch, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import fonts from '../../assets/fonts';
import { useState } from 'react';
import Checkbox from 'expo-checkbox';
import InterLight from '../Text/InterLight';

interface BillingAddressSameProps {
  isSelected: boolean;
  setIsSelected: (isSelected: boolean) => void;
  onPress: () => void;
}

const BillingAddressSame: React.FC<BillingAddressSameProps> = (props) => {

  const { isSelected, setIsSelected, onPress } = props;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.remembermecontainer}>

          <View style={styles.switchContainer}>
            <Checkbox
              color={colors.blue}
              value={isSelected}
              onValueChange={() => setIsSelected(!isSelected)}
            />
          </View>

          <InterLight style={styles.remembermetext}>Is billing address same as shipping address?</InterLight>
        </View>


      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginVertical: vh * 2, alignItems: 'center' },
  remembermecontainer: { flexDirection: 'row', alignItems: 'center' },
  remembermetext: { marginLeft: vw * 2, color: colors.inputText, fontSize: fontSizes.f12 },
  forgottextcontainer: { marginLeft: 'auto', marginRight: vw * 3, borderBottomWidth: 1, borderBottomColor: colors.blue },
  forgottext: { color: colors.blue, fontSize: fontSizes.f10, },
  switchContainer: { borderRadius: 20 },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } // Scale down the thumb
});

export default BillingAddressSame;  
