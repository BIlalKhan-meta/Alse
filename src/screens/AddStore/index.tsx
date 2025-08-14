import React, {useLayoutEffect, useState} from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';

import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {ChevronLeft} from 'lucide-react-native';

const initialValues = {
  name: '',
  description: '',
  address: '',
  phoneNumber: '',
  country: '',
};

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  address: yup.string().required('Address is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  country: yup.string().required('Country is required'),
});

const AddStore: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();

  const title = route?.params?.title || 'Submit Store Details';

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#f8f8f8',
      },
      headerTitleStyle: {
        color: '#333',
        fontSize: 18,
        fontWeight: '600',
      },
      title: title,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title]);

  const handleStoreDetails = async (values: any) => {
    setLoading(true);
    setSubmitted(true);

    try {
      // Store the form data in navigation params to pass to bank details
      const storeData = {
        name: values.name,
        description: values.description,
        address: values.address,
        phoneNumber: values.phoneNumber,
        country: values.country,
      };

      // Navigate to bank details with the store data
      navigation.navigate('BankDetail', {storeData, isNewStore: true});
    } catch (error) {
      console.log('Error saving store details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save store details',
      });
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    {label: 'USA', value: 'USA', flag: '🇺🇸'},
    {label: 'Canada', value: 'Canada', flag: '🇨🇦'},
    {label: 'UK', value: 'UK', flag: '🇬🇧'},
    {label: 'Australia', value: 'Australia', flag: '🇦🇺'},
  ];

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleStoreDetails}>
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            setFieldValue,
          }) => (
            <>
              <View style={styles.formContainer}>
                {/* Name Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Name"
                    placeholderTextColor="#999"
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                  />
                  {submitted && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                {/* Description Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    value={values.description}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {submitted && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>

                {/* Address Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Address (Area and Street) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Address (Area and Street) *"
                    placeholderTextColor="#999"
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    value={values.address}
                  />
                  {submitted && errors.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}
                </View>

                {/* Phone Number Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.phoneContainer}>
                    <TouchableOpacity style={styles.countrySelector}>
                      <Text style={styles.countryText}>USA</Text>
                      <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.textInput, styles.phoneInput]}
                      placeholder="Enter phone number"
                      placeholderTextColor="#999"
                      onChangeText={handleChange('phoneNumber')}
                      onBlur={handleBlur('phoneNumber')}
                      value={values.phoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                  {submitted && errors.phoneNumber && (
                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                  )}
                </View>

                {/* Country Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Country</Text>
                  <TouchableOpacity
                    style={styles.countryField}
                    onPress={() =>
                      setShowCountryDropdown(!showCountryDropdown)
                    }>
                    <View style={styles.countryDisplay}>
                      <Text style={styles.flagText}>🇺🇸</Text>
                      <Text style={styles.countryValue}>
                        {values.country || 'Country'}
                      </Text>
                    </View>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>

                  {showCountryDropdown && (
                    <View style={styles.dropdownContainer}>
                      {countries.map((country, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setFieldValue('country', country.label);
                            setShowCountryDropdown(false);
                          }}>
                          <Text style={styles.flagText}>{country.flag}</Text>
                          <Text style={styles.dropdownItemText}>
                            {country.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {submitted && errors.country && (
                    <Text style={styles.errorText}>{errors.country}</Text>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmit()}
                disabled={loading}>
                <Text style={styles.submitButtonText}>Submit Details</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddStore;
