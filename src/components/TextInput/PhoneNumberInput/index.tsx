import React, { useRef } from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import styles from './styles';
import InterRegular from '../../Text/InterRegular';
import { colors } from '../../../utils/theme';
import InterRegularSmallest from '../../Text/InterRegularSmallest';

interface PhoneNumberInputProps {
  initialNumber?: string;
  initialCountryCode?: string;
  onNumberChange?: (phoneNumber: string) => void;
  onChangeCountry?: (phoneNumber: string) => void;

  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  errors?: string;
  submitted?: boolean;

}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  initialNumber,
  initialCountryCode = 'US',
  onNumberChange,
  onChangeCountry,
  label,
  labelStyle,
  errors,
  submitted
}) => {
  const phoneInput = useRef<PhoneInput>(null);

  const handleChange = (number: string) => {
    if (onNumberChange) {
      onNumberChange(number);
    }
  };

  const handleCountryChange = (number: string) => {
    console.log('Country Change Value:', number);
    if (onChangeCountry) {
      onChangeCountry(number);
    }
  };

  return (
    <View style={styles.container}>
      <InterRegular style={[styles.label, labelStyle]}>
        {label}
      </InterRegular>
      <PhoneInput
        ref={phoneInput}
        defaultValue={initialNumber}
        defaultCode={initialCountryCode}
        layout="first"
        onChangeFormattedText={handleChange}
        containerStyle={styles.phoneContainer}
        textContainerStyle={styles.textInput}
        // onChangeCountry={val => handleCountryChange(val?.callingCode[0])}
        onChangeCountry={val => {
          if (val?.callingCode && val.callingCode.length > 0) {
            handleCountryChange(val.callingCode[0]);
          }
        }}

      />
      {submitted && errors && <InterRegularSmallest style={styles.error}>{errors}</InterRegularSmallest>}

    </View>
  );
};


export default PhoneNumberInput;
