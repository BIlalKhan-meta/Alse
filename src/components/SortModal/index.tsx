// SortModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

const SortModal: React.FC<SortModalProps> = ({ visible, onClose, onSelect }) => {
  const options = [
    { name: 'Product name (a-z)', value: 'a-z' },
    { name: 'Product name (z-a)', value: 'z-a' },
    // Add more options as needed
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Sort by:</Text>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={styles.option}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
            >
              <Text style={styles.optionText}>{option.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.primary, // Adjust as needed
  },
});

export default SortModal;
