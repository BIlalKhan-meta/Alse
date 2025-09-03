import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import {Picker} from '@react-native-picker/picker';
import {ChevronDown} from 'lucide-react-native';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import InterLightAverage from '../../components/Text/InterLightAverage';
import InterRegular from '../../components/Text/InterRegular';
import {colors} from '../../utils/theme';
import {getCountriesList, getState, getCity} from '../../api/home';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

interface Country {
  id: number;
  name: string;
  dialing_code?: string;
}

interface State {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface ShippingAddressForm {
  fullName: string;
  address: string;
  countryCode: string;
  phoneNumber: string;
  country: string;
  postalCode: string;
  landmark: string;
  city: string;
  state: string;
}

const validationSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  address: yup.string().required('Address is required'),
  countryCode: yup.string().required('Country code is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  country: yup.string().required('Country is required'),
  postalCode: yup.string().required('Postal code is required'),
  landmark: yup.string().required('Landmark is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
});

const ShippingAddress = () => {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [_selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null,
  );
  const [_selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const {t} = useTranslation();

  const initialValues: ShippingAddressForm = {
    fullName: '',
    address: '',
    countryCode: 'USA',
    phoneNumber: '',
    country: '',
    postalCode: '',
    landmark: '',
    city: '',
    state: '',
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await getCountriesList();
      if (response?.data?.data) {
        setCountries(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load countries',
      });
    }
  };

  const fetchStates = async (countryId: number) => {
    try {
      const response = await getState(countryId);
      if (response?.data?.data) {
        setStates(response.data.data);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    }
  };

  const fetchCities = async (stateId: number) => {
    try {
      const response = await getCity(stateId);
      if (response?.data?.data) {
        setCities(response.data.data);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const handleCountryChange = (countryName: string) => {
    const selectedCountry = countries.find(c => c.name === countryName);
    if (selectedCountry) {
      setSelectedCountryId(selectedCountry.id);
      fetchStates(selectedCountry.id);
      setStates([]);
      setCities([]);
    }
  };

  const handleStateChange = (stateName: string) => {
    const selectedState = states.find(s => s.name === stateName);
    if (selectedState) {
      setSelectedStateId(selectedState.id);
      fetchCities(selectedState.id);
      setCities([]);
    }
  };

  const handleSubmit = async (values: ShippingAddressForm) => {
    setLoading(true);

    try {
      // Prepare data for API
      const shippingData = {
        full_name: values.fullName,
        address: values.address,
        country_code: values.countryCode,
        phone_number: values.phoneNumber,
        country: values.country,
        postal_code: values.postalCode,
        landmark: values.landmark,
        city: values.city,
        state: values.state,
      };

      console.log('Shipping address data:', shippingData);

      // Simulate API call since the endpoint doesn't exist yet
      await new Promise(resolve => setTimeout(resolve, 1000));

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Shipping address saved successfully!',
      });

      // Navigate back after success
      // navigation.goBack();
    } catch (error: any) {
      console.error('Error saving shipping address:', error);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save shipping address. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const countryCodeOptions = [
    {label: 'USA', value: 'USA'},
    {label: 'Canada', value: 'Canada'},
    {label: 'UK', value: 'UK'},
    {label: 'Australia', value: 'Australia'},
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Shipping Address Header */}
        <View style={styles.languageHeader}>
          <InterLightAverage style={styles.languageTitle}>
            {t('shippingAddress.title')}
          </InterLightAverage>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={false}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              setFieldValue,
            }) => (
              <View>
                {/* Full Name Input */}
                <View style={styles.shippingInputContainer}>
                  <TextInput
                    style={styles.shippingTextInput}
                    placeholder={t('shippingAddress.name')}
                    placeholderTextColor={colors.lightGrey}
                    value={values.fullName}
                    onChangeText={handleChange('fullName')}
                    onBlur={handleBlur('fullName')}
                  />
                  {errors.fullName && (
                    <InterRegular style={styles.shippingErrorText}>
                      {errors.fullName}
                    </InterRegular>
                  )}
                </View>

                {/* Address Input */}
                <View style={styles.shippingInputContainer}>
                  <TextInput
                    style={styles.shippingTextInput}
                    placeholder={t('shippingAddress.address')}
                    placeholderTextColor={colors.lightGrey}
                    value={values.address}
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                  />
                  {errors.address && (
                    <InterRegular style={styles.shippingErrorText}>
                      {errors.address}
                    </InterRegular>
                  )}
                </View>

                {/* Phone Number Input */}
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeContainer}>
                    <Picker
                      selectedValue={values.countryCode}
                      onValueChange={value =>
                        setFieldValue('countryCode', value)
                      }
                      style={styles.countryCodePicker}>
                      {countryCodeOptions.map(option => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Picker>
                    <ChevronDown size={16} color={colors.lightGrey} />
                  </View>
                  <View style={styles.phoneNumberContainer}>
                    <TextInput
                      style={styles.phoneNumberInput}
                      placeholder={t('shippingAddress.phoneNumber')}
                      placeholderTextColor={colors.lightGrey}
                      value={values.phoneNumber}
                      onChangeText={handleChange('phoneNumber')}
                      onBlur={handleBlur('phoneNumber')}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                {errors.phoneNumber && (
                  <InterRegular style={styles.shippingErrorText}>
                    {errors.phoneNumber}
                  </InterRegular>
                )}

                {/* Country Input */}
                <View style={styles.shippingInputContainer}>
                  <TouchableOpacity
                    style={styles.dropdownInput}
                    onPress={() => setShowCountryPicker(!showCountryPicker)}>
                    <View style={styles.dropdownContent}>
                      <InterRegular style={styles.dropdownText}>
                        {values.country || t('shippingAddress.country')}
                      </InterRegular>
                      <ChevronDown size={16} color={colors.lightGrey} />
                    </View>
                  </TouchableOpacity>
                  {showCountryPicker && (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={values.country}
                        onValueChange={value => {
                          setFieldValue('country', value);
                          handleCountryChange(value);
                          setShowCountryPicker(false);
                        }}
                        style={styles.shippingPicker}>
                        <Picker.Item label={t('selectCountry')} value="" />
                        {countries.map(country => (
                          <Picker.Item
                            key={country.id}
                            label={country.name}
                            value={country.name}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                  {errors.country && (
                    <InterRegular style={styles.shippingErrorText}>
                      {errors.country}
                    </InterRegular>
                  )}
                </View>

                {/* Postal Code Input */}
                <View style={styles.shippingInputContainer}>
                  <TextInput
                    style={styles.shippingTextInput}
                    placeholder={t('shippingAddress.postalCode')}
                    placeholderTextColor={colors.lightGrey}
                    value={values.postalCode}
                    onChangeText={handleChange('postalCode')}
                    onBlur={handleBlur('postalCode')}
                    keyboardType="numeric"
                  />
                  {errors.postalCode && (
                    <InterRegular style={styles.shippingErrorText}>
                      {errors.postalCode}
                    </InterRegular>
                  )}
                </View>

                {/* Landmark Input */}
                <View style={styles.shippingInputContainer}>
                  <TextInput
                    style={styles.shippingTextInput}
                    placeholder={t('shippingAddress.landmark')}
                    placeholderTextColor={colors.lightGrey}
                    value={values.landmark}
                    onChangeText={handleChange('landmark')}
                    onBlur={handleBlur('landmark')}
                  />
                  {errors.landmark && (
                    <InterRegular style={styles.shippingErrorText}>
                      {errors.landmark}
                    </InterRegular>
                  )}
                </View>

                {/* City and State Row */}
                <View style={styles.rowContainer}>
                  {/* City Input */}
                  <View
                    style={[styles.shippingInputContainer, styles.halfWidth]}>
                    <TouchableOpacity
                      style={styles.dropdownInput}
                      onPress={() => setShowCityPicker(!showCityPicker)}>
                      <View style={styles.dropdownContent}>
                        <InterRegular style={styles.dropdownText}>
                          {values.city || t('shippingAddress.city')}
                        </InterRegular>
                        <ChevronDown size={16} color={colors.lightGrey} />
                      </View>
                    </TouchableOpacity>
                    {showCityPicker && (
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={values.city}
                          onValueChange={value => {
                            setFieldValue('city', value);
                            setShowCityPicker(false);
                          }}
                          style={styles.shippingPicker}>
                          <Picker.Item label={t('selectCity')} value="" />
                          {cities.map(city => (
                            <Picker.Item
                              key={city.id}
                              label={city.name}
                              value={city.name}
                            />
                          ))}
                        </Picker>
                      </View>
                    )}
                    {errors.city && (
                      <InterRegular style={styles.shippingErrorText}>
                        {errors.city}
                      </InterRegular>
                    )}
                  </View>

                  {/* State Input */}
                  <View
                    style={[styles.shippingInputContainer, styles.halfWidth]}>
                    <TouchableOpacity
                      style={styles.dropdownInput}
                      onPress={() => setShowStatePicker(!showStatePicker)}>
                      <View style={styles.dropdownContent}>
                        <InterRegular style={styles.dropdownText}>
                          {values.state || t('shippingAddress.state')}
                        </InterRegular>
                        <ChevronDown size={16} color={colors.lightGrey} />
                      </View>
                    </TouchableOpacity>
                    {showStatePicker && (
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={values.state}
                          onValueChange={value => {
                            setFieldValue('state', value);
                            handleStateChange(value);
                            setShowStatePicker(false);
                          }}
                          style={styles.shippingPicker}>
                          <Picker.Item label={t('selectState')} value="" />
                          {states.map(state => (
                            <Picker.Item
                              key={state.id}
                              label={state.name}
                              value={state.name}
                            />
                          ))}
                        </Picker>
                      </View>
                    )}
                    {errors.state && (
                      <InterRegular style={styles.shippingErrorText}>
                        {errors.state}
                      </InterRegular>
                    )}
                  </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    loading && styles.saveButtonDisabled,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <InterRegular style={styles.saveButtonText}>
                      {t('save')}
                    </InterRegular>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ShippingAddress;
