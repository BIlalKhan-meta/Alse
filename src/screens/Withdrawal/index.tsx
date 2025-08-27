import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../utils/theme';
import {ChevronLeft, X} from 'lucide-react-native';

const Withdrawal: React.FC = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('Mobile Wallet');

  const withdrawalOptions = [
    {
      id: 'Bank Transfer',
      title: 'Bank Transfer',
      isSelected: selectedOption === 'Bank Transfer',
    },
    {
      id: 'Paypal',
      title: 'Paypal',
      isSelected: selectedOption === 'Paypal',
    },
    {
      id: 'Mobile Wallet',
      title: 'Mobile Wallet',
      isSelected: selectedOption === 'Mobile Wallet',
      isPrimary: true,
    },
  ];

  const handleConfirm = () => {
    // Navigate to Enter Details screen
    navigation.navigate('EnterDetails');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <X size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Withdrawal Options */}
        <View style={styles.optionsContainer}>
          {withdrawalOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                option.isSelected && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption(option.id)}>
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionText,
                    option.isSelected && styles.selectedOptionText,
                  ]}>
                  {option.title}
                </Text>
                {option.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    marginTop: 30,
    gap: 15,
  },
  optionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  selectedOption: {
    backgroundColor: 'rgba(12, 149, 155, 0.06)',
    borderColor: colors.themeColor,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#000',
  },
  primaryBadge: {
    backgroundColor: colors.themeColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Withdrawal;
