import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Text,
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {dateHelper} from '../../../utils';
import InterRegularSmallest from '../../Text/InterRegularSmallest';
import {colors} from '../../../utils/theme';
import {fontSizes, vh, vw} from '../../../constant';

interface DatePickerInputProps {
  label?: string;
  initialDate: Date | null | string;
  placeholder: string;
  error?: string;
  onDateChange: (date: Date) => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  maxDate?: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  initialDate,
  placeholder,
  onDateChange,
  style,
  containerStyle,
  error,
  maxDate,
}) => {
  const [openDate, setOpenDate] = useState<boolean>(false);
  const hasValue = Boolean(initialDate);
  const [formattedDate, setFormattedDate] = useState<string>(
    initialDate ? dateHelper(initialDate) : '',
  );

  useEffect(() => {
    setFormattedDate(initialDate ? dateHelper(initialDate) : '');
  }, [initialDate]);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={() => setOpenDate(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={placeholder}>
        <View style={[styles.textinputbox, style]}>
          <Text
            style={[
              styles.valueText,
              !hasValue && !formattedDate && styles.placeholderText,
            ]}
            numberOfLines={1}>
            {formattedDate || placeholder}
          </Text>
        </View>
      </TouchableOpacity>
      <DateTimePicker
        mode="date"
        isVisible={openDate}
        date={
          initialDate
            ? initialDate instanceof Date
              ? initialDate
              : new Date(initialDate)
            : new Date(2000, 0, 1)
        }
        onConfirm={date => {
          setOpenDate(false);
          setFormattedDate(formatDate(date));
          onDateChange(date);
        }}
        onCancel={() => {
          setOpenDate(false);
        }}
        {...(maxDate ? {maximumDate: new Date()} : {})}
      />

      {error ? (
        <InterRegularSmallest style={styles.error}>{error}</InterRegularSmallest>
      ) : null}
    </View>
  );
};

export default DatePickerInput;

const styles = StyleSheet.create({
  container: {
    marginTop: vh * 3,
    width: '100%',
    alignItems: 'center',
  },
  textinputbox: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  valueText: {
    color: colors.black,
    fontSize: fontSizes.f11,
    fontWeight: '300',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  placeholderText: {
    color: colors.darkGray,
  },
  error: {
    color: colors.redText,
    marginTop: vh * 1,
    width: '100%',
    marginLeft: vw * 2,
    alignSelf: 'flex-start',
  },
});
