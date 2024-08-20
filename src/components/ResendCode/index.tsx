import { StyleProp, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import fonts from '../../assets/fonts';

import { useState } from 'react';
import CheckBox from 'expo-checkbox';
import InterLight from '../Text/InterLight';

interface ResendCodeProps {
  onPress: () => void;
}

const ResendCode: React.FC<ResendCodeProps> = (props) => {

  const { onPress } = props;

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.resendcodecontainer} onPress={onPress}>
          <InterLight style={styles.resendcode}>Resend Code</InterLight>
        </TouchableOpacity>

      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { alignSelf: 'flex-end', marginTop: vh * 2, marginRight: vw * 4 },
  resendcodecontainer: { alignSelf: 'flex-end', marginRight: vw * 3 },
  resendcode: { color: colors.redText, borderBottomWidth: 1, borderBottomColor: colors.redText }
});

export default ResendCode;