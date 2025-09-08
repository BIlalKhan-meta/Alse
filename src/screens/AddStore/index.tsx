import React, {useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {ChevronLeft, Camera} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import {createShop} from '../../api/shop';

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
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const {t} = useTranslation();

  const selectImage = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

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
      // Create FormData for the API call
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('address', values.address);
      formData.append('phone_number', values.phoneNumber);
      formData.append('country', values.country);
      formData.append('delivery_fees', '0'); // Add required delivery_fees field

      // Add shop banner image
      if (selectedImage) {
        formData.append('shop_banner', {
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || 'shop_banner.jpg',
        } as any);
      }

      console.log('Creating shop with data:', values);

      // Call the createShop API
      const response = await createShop(formData);

      console.log('Shop creation response:', response);

      if (
        response?.data?.success ||
        response?.data?.data ||
        response?.status === 200
      ) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Shop created successfully!',
        });

        // Store the form data in navigation params to pass to bank details
        const storeData = {
          name: values.name,
          description: values.description,
          address: values.address,
          phoneNumber: values.phoneNumber,
          country: values.country,
          shopId: response?.data?.data?.id || response?.data?.id,
        };

        // Navigate to bank details with the store data
        navigation.navigate('BankDetail', {storeData, isNewStore: true});
      } else {
        throw new Error('Failed to create shop');
      }
    } catch (error: any) {
      console.log('Error creating shop:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create shop',
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
                  <Text style={styles.label}>{t('addStore.name')}</Text>
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
                  <Text style={styles.label}>{t('addStore.description')}</Text>
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
                  <Text style={styles.label}>{t('addStore.address')} *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`${t('addStore.address *')}`}
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
                  <Text style={styles.label}>{t('addStore.phone')}</Text>
                  <View style={styles.phoneContainer}>
                    <TouchableOpacity style={styles.countrySelector}>
                      <Text style={styles.countryText}>USA</Text>
                      <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.textInput, styles.phoneInput]}
                      placeholder={t('enterPhone')}
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
                  <Text style={styles.label}>{t('addStore.country')}</Text>
                  <TouchableOpacity
                    style={styles.countryField}
                    onPress={() =>
                      setShowCountryDropdown(!showCountryDropdown)
                    }>
                    <View style={styles.countryDisplay}>
                      <Text style={styles.flagText}>🇺🇸</Text>
                      <Text style={styles.countryValue}>
                        {values.country || t('addStore.country')}
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

                {/* Shop Banner Upload */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Shop Banner *</Text>
                  <TouchableOpacity
                    style={styles.imageUploadButton}
                    onPress={selectImage}>
                    {selectedImage ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image
                          source={{uri: selectedImage.uri}}
                          style={styles.imagePreview}
                        />
                        <Text style={styles.changeImageText}>
                          Tap to change image
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Camera size={24} color="#666" />
                        <Text style={styles.uploadText}>
                          Tap to select shop banner
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {submitted && !selectedImage && (
                    <Text style={styles.errorText}>
                      Shop banner is required
                    </Text>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleStoreDetails(values)}
                disabled={loading}>
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating Shop...' : t('addStore.submit')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddStore;
