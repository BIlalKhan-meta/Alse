// DropdownComponent.tsx
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
// import styles from './styles'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {colors} from '../../../utils/theme';
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
  error?: string;
}

const DropDownTextInput: React.FC<DropdownComponentProps> = ({
  items,
  placeholder,
  defaultValue = null,
  onChangeValue,
  style,
  listMode,
  idRequired,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <View style={{zIndex: 100, marginBottom: vh}}>
      <DropDownPicker
        open={open}
        listMode={listMode}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        onSelectItem={e => {
          if (idRequired) {
            onChangeValue(e?.value || '');
          } else {
            onChangeValue(e?.value || '');
          }
        }}
        zIndex={100}
        placeholder={placeholder}
        style={[styles.dropdown, style]}
        containerStyle={{backgroundColor: 'white'}}
        iconContainerStyle={{backgroundColor: 'transparent'}}
        textStyle={styles.dropdownText}
        placeholderStyle={styles.placeholderText}
        arrowIconContainerStyle={styles.iconContainer}
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
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    tintColor: '#666',
  },
  dropdownText: {
    fontSize: 10,
    color: '#333',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
  },
  iconContainer: {
    // backgroundColor: 'transparent',
    tintColor: '#666',
  },
});

export default DropDownTextInput;
