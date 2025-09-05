import React from 'react';
import {View, TouchableOpacity, Text, StyleProp, ViewStyle} from 'react-native';
import styles from './styles';

interface Option {
  text: string;
  onPress: () => void;
}

interface ReportBlockModalProps {
  isVisible: boolean;
  options: Option[];
  onClose: () => void;
  style: StyleProp<ViewStyle>;
}

const ReportBlockModal: React.FC<ReportBlockModalProps> = ({
  isVisible,
  options,
  onClose,
  style,
}) => {
  if (isVisible) {
    return (
      <TouchableOpacity
        style={[styles.modalBackground, style]}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.modalOption}
              onPress={option.onPress}>
              <Text>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  return null;
};

export default ReportBlockModal;
