import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronLeft, ChevronDown} from 'lucide-react-native';
// Correct import path - BecomeSeller is in src/screens/BecomeSeller/
import * as authAPI from '../../api/auth';
import {signupSeller as directSignupSeller} from '../../api/auth';
import {getCountriesList} from '../../api/home';
import {checkIsSeller} from '../../api/shop';
import axiosInstance from '../../api';
import endpoints from '../../api/endpoints';

// Debug: Check if signupSeller is imported correctly
console.log('authAPI:', authAPI);
console.log('signupSeller function:', authAPI.signupSeller);
console.log('directSignupSeller function:', directSignupSeller);
console.log('typeof signupSeller:', typeof authAPI.signupSeller);
console.log('typeof directSignupSeller:', typeof directSignupSeller);

// Test if we can call the function
if (typeof authAPI.signupSeller === 'function') {
  console.log('signupSeller is a function - good!');
} else if (typeof directSignupSeller === 'function') {
  console.log('directSignupSeller is a function - using this one!');
} else {
  console.log('Neither signupSeller is a function - problem!');
  console.log('Available functions:', Object.keys(authAPI));
}

// Temporary inline function to test API call
const signupSellerInline = (data: {
  full_name: string;
  bio: string;
  address: string;
  phone_number: string;
  country_id: number;
  password: string;
  password_confirmation: string;
}) => {
  console.log('Using inline signupSeller function');
  const formData = new FormData();
  formData.append('full_name', data.full_name);
  formData.append('bio', data.bio);
  formData.append('address', data.address);
  formData.append('phone_number', data.phone_number);
  formData.append('country_id', data.country_id.toString());
  formData.append('password', data.password);
  formData.append('password_confirmation', data.password_confirmation);

  return axiosInstance.post(endpoints.auth.signupSeller, formData, {
    formData: true,
  });
};

const BecomeSeller: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    address: '',
    phone_number: '',
    country_id: 0,
    password: '',
    password_confirmation: '',
  });

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [checkingSellerStatus, setCheckingSellerStatus] = useState(true);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const checkSellerStatus = useCallback(async () => {
    try {
      setCheckingSellerStatus(true);
      const response = await checkIsSeller();

      // If user has shops, redirect to existing seller screen
      // Based on the API response structure: response.data.data.data contains the shops array
      if (response.data?.data?.data && response.data.data.data.length > 0) {
        (navigation as any).navigate('ExistingSeller');
        return;
      }
    } catch (error) {
      console.log('Error checking seller status:', error);
      // If there's an error, we'll still show the form
      // This handles cases where the API might not be available
    } finally {
      setCheckingSellerStatus(false);
    }
  }, [navigation]);

  // Check seller status and load countries on component mount
  useEffect(() => {
    checkSellerStatus();
    loadCountries();
  }, [checkSellerStatus]);

  const loadCountries = async () => {
    try {
      setCountriesLoading(true);
      const response = await getCountriesList();
      if (response.data?.data) {
        setCountries(response.data.data);
        // Set default country (USA) if available
        const defaultCountry = response.data.data.find(
          (country: any) => country.name === 'United States',
        );
        if (defaultCountry) {
          setSelectedCountry(defaultCountry);
          setFormData(prev => ({
            ...prev,
            country_id: defaultCountry.id,
          }));
        }
      }
    } catch (error) {
      console.log('Error loading countries:', error);
      Alert.alert('Error', 'Failed to load countries list');
    } finally {
      setCountriesLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!formData.bio.trim()) {
      Alert.alert('Error', 'Description is required');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Address is required');
      return;
    }
    if (!formData.phone_number.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    if (formData.country_id === 0) {
      Alert.alert('Error', 'Please select a country');
      return;
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      // Use inline function for now to test API call
      console.log('Using inline signupSeller function');
      console.log('Form data being sent:', formData);
      console.log('API endpoint:', endpoints.auth.signupSeller);
      const response = await signupSellerInline(formData);
      console.log('API response:', response);

      if (response.data?.status === true || response.data?.success) {
        Alert.alert(
          'Success',
          'Seller account created successfully! You can now start selling.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        // Show the exact API error message
        const errorMessage =
          response.data?.message || 'Failed to create seller account';
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.log('Error creating seller account:', error);
      console.log('Error response:', error.response?.data);

      // Show the exact API error message from the response
      let errorMessage = 'Failed to create seller account';

      if (error.response?.data) {
        // Check for different possible error message fields
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          error.response.data.errors ||
          error.response.data.message?.message ||
          JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking seller status
  if (checkingSellerStatus) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Store Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A19D" />
          <Text style={styles.loadingText}>Checking your seller status...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Store Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              value={formData.full_name}
              onChangeText={value => handleInputChange('full_name', value)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Description Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Description"
              value={formData.bio}
              onChangeText={value => handleInputChange('bio', value)}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Address Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Address (Area and Street) *"
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Phone Number Field */}
          <View style={styles.inputContainer}>
            <View style={styles.phoneContainer}>
              <TouchableOpacity style={styles.countryCodeButton}>
                <Text style={styles.countryCodeText}>+1</Text>
                <ChevronDown size={16} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter phone number"
                value={formData.phone_number}
                onChangeText={value => handleInputChange('phone_number', value)}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Country Field */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.countryButton}
              onPress={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              disabled={countriesLoading}>
              <View style={styles.countryButtonContent}>
                {countriesLoading ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <>
                    <Text style={styles.countryFlag}>
                      {selectedCountry?.flag || '🇺🇸'}
                    </Text>
                    <Text style={styles.countryPlaceholder}>
                      {selectedCountry?.name || 'Country'}
                    </Text>
                  </>
                )}
                <ChevronDown size={16} color="#666" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Country Dropdown */}
          {isCountryDropdownOpen && !countriesLoading && (
            <View style={styles.dropdownContainer}>
              {countries.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCountry(country);
                    handleInputChange('country_id', country.id);
                    setIsCountryDropdownOpen(false);
                  }}>
                  <Text style={styles.dropdownFlag}>{country.flag}</Text>
                  <Text style={styles.dropdownText}>{country.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Password *"
              value={formData.password}
              onChangeText={value => handleInputChange('password', value)}
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Confirm Password *"
              value={formData.password_confirmation}
              onChangeText={value =>
                handleInputChange('password_confirmation', value)
              }
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Details</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  phoneContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  countryButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  countryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 12,
  },
  countryPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownFlag: {
    fontSize: 16,
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#00A19D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default BecomeSeller;
