import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  Image,
} from 'react-native';
import styles from './styles';

import DatePickerInput from '../TextInput/DatePickerTextInput2';
import DropDownTextInput2 from '../TextInput/DropDownTextInput2';
import InterRegular from '../Text/InterRegular';

const windowWidth = Dimensions.get('window').width;

const items = [
  {label: 'All', value: 'All'},
  {label: 'Pending', value: 'Pending'},
  {label: 'Delivered', value: 'Delivered'},
  {label: 'Rejected', value: 'Rejected'},
  {label: 'Accepted', value: 'Accepted'},
];

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  fromDate: Date | null;
  toDate: Date | null;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  style: StyleProp<ViewStyle>;
  filterStatus?: boolean;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  filterStatus,
  selectedStatus,
  onStatusChange,
  style,
}) => {
  if (isVisible) {
    return (
      <TouchableOpacity
        style={[styles.modalBackground, style]}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          <InterRegular>Sort By:</InterRegular>

          <DatePickerInput
            label="From Date"
            initialDate={fromDate}
            placeholder="mm/dd/yyyy"
            onDateChange={onFromDateChange}
            style={styles.textinputbox}
          />

          <DatePickerInput
            label="To Date"
            initialDate={toDate}
            placeholder="mm/dd/yyyy"
            onDateChange={onToDateChange}
            style={styles.textinputbox}
          />

          {filterStatus && (
            <>
              <InterRegular>Status:</InterRegular>
              <View style={styles.dropdownContainer}>
                <DropDownTextInput2
                  items={items}
                  defaultValue="All"
                  value={selectedStatus}
                  setValue={onStatusChange}
                  style={styles.dropDown}
                />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return null;
};

export default FilterModal;
