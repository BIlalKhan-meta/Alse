// DropdownComponent.tsx
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
// import styles from './styles'
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '../../../utils/theme';
import InterBoldSmall from '../../Text/InterBoldSmall';
import InterRegularSmallest from '../../Text/InterRegularSmallest';
import {vh, vw} from '../../../constant';
interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownComponentProps {
  items: DropdownItem[];
  placeholder: string;
  defaultValue?: string;
  onChangeValue: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  listMode?: 'DEFAULT' | 'FLATLIST' | 'SCROLLVIEW' | 'MODAL';
  idRequired?: boolean;
  label?: string;
}

const DropDownTextInput: React.FC<DropdownComponentProps> = ({
  items,
  placeholder,
  defaultValue = null,
  onChangeValue,
  style,
  listMode,
  idRequired,
  label,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(defaultValue);
  const [dropdownItems, setDropdownItems] = useState(items);
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  return (
    <View>
      <DropDownPicker
        open={open}
        listMode={listMode}
        value={value}
        items={items}
        setOpen={setOpen}
        // setValue={(val) => {
        //   setValue(val);
        //   if (onChangeValue) {
        //     onChangeValue(val);
        //   }
        // }}
        onSelectItem={e => {
          if (idRequired) {
            onChangeValue(e);
          } else {
            onChangeValue(e?.value);
          }
        }}
        zIndex={100}
        setItems={setDropdownItems}
        placeholder={placeholder}
        style={[styles.dropdown, style]}
        containerStyle={{backgroundColor: colors.inputcolor}}
        iconContainerStyle={{backgroundColor: colors.pattenBlue}}
      />
      {error && (
        <InterRegularSmallest style={styles.error}>
          {error}
        </InterRegularSmallest>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: colors.inputcolor,
    //   borderColor: 'grey',
    borderRadius: 10,
    opacity: 0.3,
    color: 'red',
  },

  error: {
    color: colors.redText,
    marginTop: vh * 1,
    width: '100%',
    alignSelf: 'flex-start',
    marginLeft: vw * 2,
    zIndex: -99,
  },
  icon: {
    color: 'grey',
  },
});

export default DropDownTextInput;
