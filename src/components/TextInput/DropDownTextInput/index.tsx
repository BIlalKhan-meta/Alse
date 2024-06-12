// DropdownComponent.tsx
import React, { useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
// import styles from './styles'
import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { colors } from '../../../utils/theme';
interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownComponentProps {
  items: DropdownItem[];
  placeholder: string;
  defaultValue?: string;
  onChangeValue?: (value: string | null) => void;
  style?: StyleProp<ViewStyle>
}

const DropDownTextInput: React.FC<DropdownComponentProps> = ({
  items,
  placeholder,
  defaultValue = null,
  onChangeValue,
  style
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(defaultValue);
  const [dropdownItems, setDropdownItems] = useState(items);
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  return (
    <DropDownPicker
      open={open}
      value={value}
      items={dropdownItems}
      setOpen={setOpen}
      setValue={(val) => {
        setValue(val);
        if (onChangeValue) {
          onChangeValue(val);
        }
      }}
      setItems={setDropdownItems}
      placeholder={placeholder}
      style={[styles.dropdown,style]}
      
      iconContainerStyle={{backgroundColor:colors.pattenBlue}}
    
    />
  );
};

const styles = StyleSheet.create({
    dropdown: {
      backgroundColor: '#C7EEFF',
    //   borderColor: 'grey',
      borderRadius: 10,
      opacity:0.3,
      color:"red",
      
    },
  
    icon: {
      color: 'grey',
    },
  });

export default DropDownTextInput;
