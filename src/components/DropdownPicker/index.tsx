import {StyleProp, TouchableOpacity, View, ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';

import {Picker} from '@react-native-picker/picker';

import {fontSizes, vh, vw} from '../../constant';

import fonts from '../../assets/fonts';
import InterBoldLabel from '../Text/InterBoldLabel';
import InterRegularSmall from '../Text/InterRegularSmall';
import React from 'react';

interface DropdownPickerProps {
  placeholder: string;
  onValueChange: (value: string) => void;
  selectedValue: string;
  data: {name: string; id: number}[];
  submitted?: boolean;
  errors?: string;
  label?: string;
  pickerStyle: StyleProp<ViewStyle>;
}

const DropdownPicker: React.FC<DropdownPickerProps> = props => {
  const {
    placeholder,
    onValueChange,
    selectedValue,
    data,
    submitted,
    errors,
    label,
    pickerStyle,
  } = props;

  return (
    <>
      <View style={styles.container}>
        {label && <InterBoldLabel style={styles.label}>{label}</InterBoldLabel>}
        <Picker
          style={[styles.pickercontainer, pickerStyle]}
          dropdownIconColor={colors.grayText}
          enabled={true}
          mode="dialog"
          placeholder={placeholder}
          onValueChange={onValueChange}
          selectedValue={selectedValue}
          // data={data}
        >
          <Picker.Item label={placeholder} value="" />

          {data.map(item => (
            <Picker.Item
              label={item.name.toString()}
              value={item.name.toString()}
              key={item.id.toString()}
            />
          ))}
        </Picker>

        {submitted && errors && (
          <InterRegularSmall style={styles.error}>
            {props?.errors}
          </InterRegularSmall>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {marginTop: vh * 4},
  pickercontainer: {
    fontFamily: fonts.Inter.Bold,
    color: colors.gray,
    fontSize: fontSizes.f11,
    height: vh * 6,
    marginTop: vh * 2,
    width: vw * 85,
    fontWeight: '300',
    borderColor: 'rgba(48, 86, 112, 0.05)',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(48, 86, 112, 0.05)',
  },
  error: {
    color: colors.redText,
    marginTop: vh * 1,
  },
  label: {marginLeft: vw * 2},
});

export default DropdownPicker;
