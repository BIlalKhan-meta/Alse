import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import DatePicker from 'react-native-date-picker';
import InterLight from '../../Text/InterLight';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {dateHelper} from '../../../utils';
import InterRegularSmallest from '../../Text/InterRegularSmallest';
import {colors} from '../../../utils/theme';
import {vh, vw} from '../../../constant';

interface DatePickerInputProps {
  label: string;
  initialDate: Date | null;
  placeholder: string;
  error?: string;
  onDateChange: (date: Date) => void;
  style: object;
  maxDate?: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  initialDate,
  placeholder,
  onDateChange,
  style,
  error,
  maxDate,
}) => {
  const [openDate, setOpenDate] = useState<boolean>(false);
  const [formattedDate, setFormattedDate] = useState<string>(
    initialDate ? dateHelper(initialDate) : placeholder,
  );

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <>
      <TouchableOpacity onPress={() => setOpenDate(true)}>
        <View style={[styles.textinputbox, style]}>
          <InterLight>{formattedDate}</InterLight>
        </View>
      </TouchableOpacity>
      {/* <DatePicker
        modal
        mode="date"
        open={openDate}
        date={initialDate ? initialDate : new Date()}
        onConfirm={date => {
          setOpenDate(false);
          setFormattedDate(formatDate(date));
          onDateChange(date);
        }}
        onCancel={() => {
          setOpenDate(false);
        }}
      /> */}
      <DateTimePicker
        mode="date"
        // open={openDate}
        isVisible={openDate}
        date={initialDate ? initialDate : new Date()}
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

      {error && (
        <InterRegularSmallest style={styles.error}>
          {error}
        </InterRegularSmallest>
      )}
    </>
  );
};

export default DatePickerInput;

const styles = StyleSheet.create({
  textinputbox: {
    // Add your styles here
  },
  error: {
    color: colors.redText,
    marginTop: vh * 1,
    width: '100%',
    marginLeft: vw * 2,
    alignSelf: 'flex-start',
  },
  calendericon: {
    // Add your styles here
  },
});
