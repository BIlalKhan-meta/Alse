import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Image} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {images} from '../../../utils/images';
import InterLight from '../../Text/InterLight';

interface DatePickerInputProps {
  label: string;
  initialDate: Date;
  placeholder: string;
  onDateChange: (date: Date) => void;
  style: object;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  initialDate,
  placeholder,
  onDateChange,
  style,
}) => {
  const [openDate, setOpenDate] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(initialDate);
  const [formattedDate, setFormattedDate] = useState<string>(placeholder);

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
          <InterLight style={{}}>{formattedDate}</InterLight>
          <Image source={images.down} style={styles.calendericon} />
        </View>
      </TouchableOpacity>
      <DatePicker
        modal
        mode="date"
        open={openDate}
        date={date ? date : new Date()}
        onConfirm={date => {
          setOpenDate(false);
          setDate(date);
          setFormattedDate(formatDate(date));
          onDateChange(date);
        }}
        onCancel={() => {
          setOpenDate(false);
        }}
      />
    </>
  );
};

export default DatePickerInput;

const styles = StyleSheet.create({
  textinputbox: {
    // Add your styles here
  },
  calendericon: {
    // Add your styles here
  },
});
