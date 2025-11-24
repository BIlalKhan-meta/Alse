import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {styles} from './styles';
import {submitRiderApplication, RiderApplicationData} from '../../api/rider';
import {signup} from '../../api/auth';
import Toast from 'react-native-toast-message';

const BecomeRider: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    vehicleInfo: '',
    idLicense: '',
    contactNumber: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Validate form data
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!formData.vehicleInfo.trim()) {
      Alert.alert('Error', 'Please enter vehicle information');
      return;
    }
    if (!formData.idLicense.trim()) {
      Alert.alert('Error', 'Please enter ID/License information');
      return;
    }
    if (!formData.contactNumber.trim()) {
      Alert.alert('Error', 'Please enter your contact number');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create user account via signup API
      const signupData = {
        full_name: formData.name,
        identifier: formData.email, // Using email as identifier
        password: 'TempPassword123!', // Temporary password for rider signup
        agree: true, // Assuming they agree to terms for rider application
      };

      // console.log('Calling signup API with data:', signupData);
      const signupResponse = await signup(signupData);

      console.log('---->>>>>>', signupResponse);

      if (signupResponse?.data?.status) {
        console.log('Signup successful:', signupResponse.data);

        Toast.show({
          type: 'success',
          text1: 'Account Created',
          text2: 'Your account has been created successfully',
        });

        // Navigate to verification pending screen with rider data
        (navigation as any).navigate('VerificationPending', {
          riderData: {
            name: formData.name,
            email: formData.email,
            vehicleInfo: formData.vehicleInfo,
            idLicense: formData.idLicense,
            contactNumber: formData.contactNumber,
            userId: signupResponse.data.data?.id, // Include user ID from signup response
          },
        });
      } else {
        // Handle signup API error response
        const errorMessage =
          signupResponse?.data?.message ||
          'Failed to create account. Please try again.';
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: errorMessage,
        });
      }
    } catch (error: any) {
      console.error('Error in rider signup process:', error);

      // Handle different types of errors
      let errorMessage =
        error?.message ||
        'Failed to submit your application. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }

      Toast.show({
        type: 'error',
        text1: 'Application Failed',
        text2: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Submit Rider Details</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formFields}>
            {/* Name Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Name"
                value={formData.name}
                onChangeText={text => handleInputChange('name', text)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Vehicle Info Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Vehicle Info"
                value={formData.vehicleInfo}
                onChangeText={text => handleInputChange('vehicleInfo', text)}
                placeholderTextColor="#999"
              />
            </View>

            {/* ID/License Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="ID/License"
                value={formData.idLicense}
                onChangeText={text => handleInputChange('idLicense', text)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Contact Number Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChangeText={text => handleInputChange('contactNumber', text)}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                value={formData.email}
                onChangeText={text => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating Account...' : 'Submit Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BecomeRider;
