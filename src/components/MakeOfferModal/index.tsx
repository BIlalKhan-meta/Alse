import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {X} from 'lucide-react-native';
import {colors} from '../../utils/theme';

export type MakeOfferModalProps = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  quantity: string;
  price: string;
  note: string;
  onChangeQuantity: (value: string) => void;
  onChangePrice: (value: string) => void;
  onChangeNote: (value: string) => void;
};

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  visible,
  loading = false,
  onClose,
  onSubmit,
  quantity,
  price,
  note,
  onChangeQuantity,
  onChangePrice,
  onChangeNote,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Make an Offer</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <X size={18} color="#666" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Enter Quantity"
                placeholderTextColor="#999"
                value={quantity}
                onChangeText={onChangeQuantity}
                keyboardType="number-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter Price"
                placeholderTextColor="#999"
                value={price}
                onChangeText={onChangePrice}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder="Enter Note"
                placeholderTextColor="#999"
                value={note}
                onChangeText={onChangeNote}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={onSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Make an Offer</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.black,
    marginBottom: 12,
  },
  noteInput: {
    minHeight: 110,
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: colors.themeColor,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MakeOfferModal;
