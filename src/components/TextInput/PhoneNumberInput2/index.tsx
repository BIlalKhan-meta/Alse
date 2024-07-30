import React, { useRef } from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { colors } from '../../../utils/theme';
import styles from './styles';
import InterRegular from '../../Text/InterRegular';

interface PhoneNumberInput2Props {
    initialNumber?: string;
    onNumberChange?: (phoneNumber: string) => void;
    label?: string;
    labelStyle?: StyleProp<TextStyle>;

}

const PhoneNumberInput2: React.FC<PhoneNumberInput2Props> = ({ initialNumber, onNumberChange, label, labelStyle }) => {
    const phoneInput = useRef<PhoneInput>(null);

    const handleChange = (number: string) => {
        if (onNumberChange) {
            onNumberChange(number);
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
                defaultCode="US"
                layout="first"
                onChangeFormattedText={handleChange}
                containerStyle={styles.phoneContainer}
                textContainerStyle={styles.textInput}
            />

        </View>
    );
};


export default PhoneNumberInput2;
