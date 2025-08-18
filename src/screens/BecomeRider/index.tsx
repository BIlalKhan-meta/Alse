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

const BecomeRider: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    vehicleInfo: '',
    idLicense: '',
    contactNumber: '',
    email: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
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

    try {
      // Submit the form via API
      // const applicationData: RiderApplicationData = {
      //   name: formData.name,
      //   vehicleInfo: formData.vehicleInfo,
      //   idLicense: formData.idLicense,
      //   contactNumber: formData.contactNumber,
      //   email: formData.email,
      // };

      // await submitRiderApplication(applicationData);

      // Navigate to verification pending screen
      (navigation as any).navigate('VerificationPending', {
        riderData: {
          name: formData.name,
          email: formData.email,
        },
      });
    } catch (error) {
      console.error('Error submitting rider application:', error);
      Alert.alert(
        'Error',
        'Failed to submit your application. Please try again.',
      );
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
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BecomeRider;
