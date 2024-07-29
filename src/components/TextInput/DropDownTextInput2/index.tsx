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
  textStyle?: StyleProp<TextStyle>;
  value: string | null;
  setValue: (value: string | null) => void;
}

const DropDownTextInput2: React.FC<DropdownComponentProps> = ({
  items,
  placeholder,
  defaultValue = null,
  onChangeValue,
  style,
  value,
  setValue,
  textStyle
}) => {
  const [open, setOpen] = useState(false);
  // const [value, setValue] = useState<string | null>(defaultValue);
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
      setValue={setValue}
      // setValue={(val) => {
      //   setValue(val);
      //   if (onChangeValue) {
      //     onChangeValue(val);
      //   }
      // }}
      setItems={setDropdownItems}
      placeholder={placeholder}
      style={[styles.dropdown, style]}

      iconContainerStyle={{ backgroundColor: colors.pattenBlue }}
      zIndex={2000}
      zIndexInverse={2000}
      textStyle={textStyle}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: 'rgba(48, 86, 112, 0.05)',
    //   borderColor: 'grey',
    borderRadius: 4,
    // opacity: 0.3,
    color: "red",

  },

  icon: {
    color: 'grey',
  },
});

export default DropDownTextInput2;
