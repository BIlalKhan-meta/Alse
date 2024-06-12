// CheckboxComponent.tsx
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Checkbox from 'expo-checkbox';
import styles from './styles';
import InterRegular from '../Text/InterRegular';

interface CheckboxComponentProps {
  label: string;
  isChecked: boolean;
  onValueChange: (value: boolean) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const CheckboxComponent: React.FC<CheckboxComponentProps> = ({ label, isChecked, onValueChange, containerStyle }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Checkbox
        value={isChecked}
        onValueChange={onValueChange}
        style={styles.checkbox}
      />
      <InterRegular style={styles.label}>{label}</InterRegular>
    </View>
  );
};



export default CheckboxComponent;
