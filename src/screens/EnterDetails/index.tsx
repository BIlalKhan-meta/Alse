import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../utils/theme';
import {ChevronLeft, X, ChevronDown, Check} from 'lucide-react-native';

const EnterDetails: React.FC = () => {
  const navigation = useNavigation();
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [saveDetails, setSaveDetails] = useState(true);

  const purposeOptions = [
    'Personal Use',
    'Business',
    'Investment',
    'Emergency',
    'Other',
  ];

  const handleNext = () => {
    // Navigate to Withdrawal Review screen
    navigation.navigate('WithdrawalReview');
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
        <Text style={styles.headerTitle}>Enter Details</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <X size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Account Holder Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Account Holder Name"
              placeholderTextColor="#999"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
            />
          </View>

          {/* Account Number Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Account Number"
              placeholderTextColor="#999"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
            />
          </View>

          {/* Purpose Dropdown */}
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dropdownInput}>
              <Text
                style={purpose ? styles.dropdownText : styles.placeholderText}>
                {purpose || 'Purpose'}
              </Text>
              <ChevronDown size={16} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Save Details Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setSaveDetails(!saveDetails)}>
            <View
              style={[styles.checkbox, saveDetails && styles.checkboxChecked]}>
              {saveDetails && <Check size={12} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>
              Save these details for future transactions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
  formContainer: {
    marginTop: 30,
    gap: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  dropdownInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.themeColor,
    borderColor: colors.themeColor,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  nextButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EnterDetails;
