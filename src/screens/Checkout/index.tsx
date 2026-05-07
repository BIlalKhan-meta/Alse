import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';

import styles from './styles'; // Ensure you have your styles defined
import RegularTextInput from '../../components/TextInput/RegularTextInput';

import CartItem from '../../components/CartItem';

import Summary from '../../components/SummaryComponent';
import PhoneNumberInput from '../../components/TextInput/PhoneNumberInput';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import BillingAddressSame from '../../components/BillingAddressSame';
import CustomButton from '../../components/CustomButton';
import {products} from '../../dummyData';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import Card from '../../components/Card';
import {colors} from '../../utils/theme';
import {checkout, getCart} from '../../api/product';
import Loader from '../../components/Loader';
import {Toast} from '../../utils/helpers';

import {useSelector, useDispatch} from 'react-redux';
import {countriesList, getCountries} from '../../store/slices/generalSlice';
import {getCity, getState, getCountriesList} from '../../api/home';
import eventEmitter, {EVENT_TYPES} from '../../utils/EventEmitter';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFoused = useIsFocused();

  const [isSelected, setIsSelected] = useState<boolean>(true);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState([]);
  const subTotal = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  );
  const adminCommission = 5;

  const countries = useSelector(countriesList);
  const [shippStates, setShipStates] = useState([]);
  const [billStates, setBillStates] = useState([]);
  const [shipCities, setShipCities] = useState([]);
  const [billCities, setBillCities] = useState([]);

  const validationSchema = yup.object().shape({
    shipping_first_name: yup.string().required('First Name is required'),
    shipping_last_name: yup.string().required('Last Name is required'),
    shipping_email: yup
      .string()
      .email('Invalid email')
      .required('Email is required'),
    shipping_phone: yup.string().required('Contact number is required'),
    shipping_address: yup.string().required('Shipping Address is required'),
    shipping_country: yup.string().required('Country is required'),
    shipping_state: yup.string().optional(),
    shipping_city: yup.string().optional(),
    shipping_zip: yup.string().required('Zip Code is required'),

    ...(!isSelected && {
      billing_first_name: yup.string().required('First Name is required'),
      billing_last_name: yup.string().required('Last Name is required'),
      billing_email: yup
        .string()
        .email('Invalid email')
        .required('Email is required'),
      billing_phone: yup.string().required('Phone Number is required'),
      billing_address: yup.string().required('Billing Address is required'),
      billing_country: yup.string().required('Country is required'),
      billing_state: yup.string().optional(),
      billing_city: yup.string().optional(),
      billing_zip: yup.string().required('Zip Code is required'),
    }),
  });

  const initialValues = {
    shipping_first_name: '',
    shipping_last_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_country: 'United States', // Set USA as default
    shipping_state: '', // Initialize with default value
    shipping_city: '', // Initialize with default value
    shipping_zip: '',
    billing_first_name: '',
    billing_last_name: '',
    billing_email: '',
    billing_phone: '',
    billing_address: '',
    billing_country: 'United States', // Set USA as default
    billing_state: '', // Initialize with default value
    billing_city: '', // Initialize with default value
    billing_zip: '',
  };
  const TriggerFunc = () => {
    navigation.navigate('Home');
  };
  useEffect(() => {
    eventEmitter.on(EVENT_TYPES.CHECKOUT_TRIGGER, TriggerFunc);

    return () => {
      eventEmitter.off(EVENT_TYPES.CHECKOUT_TRIGGER, TriggerFunc);
    };
  }, []);

  const handleSubmit = async (values: any) => {
    console.log('handleSubmit called with values:', values);

    setLoading(true);

    let temp = {
      ...values,
    };

    if (isSelected) {
      temp = {
        ...temp,
        billing_first_name: values.shipping_first_name,
        billing_last_name: values.shipping_last_name,
        billing_email: values.shipping_email,
        billing_phone: values.shipping_phone,
        billing_address: values.shipping_address,
        billing_country: values.shipping_country,
        billing_state: values.shipping_state,
        billing_city: values.shipping_city,
        billing_zip: values.shipping_zip,
      };
    }

    const form = new FormData();
    Object.entries(temp).forEach(([key, value]) => {
      form.append(key, value);
    });

    console.log('Form submitted:', JSON.stringify(temp, null, 4));

    try {
      // Navigate to Payment screen with order data
      console.log('Checkout Screen - Sending order data:', temp);
      console.log('Navigating to Payment screen...');
      Toast.success('Form submitted successfully! Navigating to payment...');
      (navigation as any).navigate('Payment', {orderData: temp});
    } catch (error) {
      console.error('Navigation error:', error);
      Toast.error('Failed to navigate to payment screen');
    } finally {
      setLoading(false);
    }

    // Uncomment below for actual API call
    /*
    try {
      const res = await checkout(form);
      console.log('Checkout API response:', res);
      if (res?.data) {
        // Navigate to payment page instead of opening browser
        console.log('Navigating to Payment screen...');
        Toast.success('Order placed successfully! Navigating to payment...');
        navigation.navigate('Payment' as never);
      } else {
        Toast.error('Failed to place order. Please check your details and try again.');
      }
    } catch (err: any) {
      console.log('ERRORRRRRRRRRRRRRRRRR', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to place order. Please try again.';
      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
    */
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
    });
  }, [navigation]);

  useEffect(() => {
    getData();
    loadCountries();
  }, [isFoused]);

  // Debug countries state
  useEffect(() => {
    console.log('Countries from Redux store:', countries);
    console.log('Countries length:', countries?.length);
  }, [countries]);

  const fetchState = async (id: number, ship: boolean) => {
    console.log('IDDDDDDDDDDDDDDDDD', id);
    await getState(id).then(res => {
      if (res?.data) {
        let temp = res?.data?.data?.map((item, index) => {
          return {label: item?.name, value: item?.name, id: item?.id};
        });
        if (ship) {
          setShipStates(temp);
        } else {
          setBillStates(temp);
        }
      } else {
        setShipStates([]);
        setBillStates([]);
      }
    });
  };

  const fetchCity = async (id: number, ship: boolean) => {
    await getCity(id).then(res => {
      if (res?.data) {
        let temp = res?.data?.data.map((item, index) => {
          return {label: item?.name, value: item?.name, id: item?.id};
        });
        if (ship) {
          setShipCities(temp);
        } else {
          setBillCities(temp);
        }
      } else {
        setShipCities([]);
        setBillCities([]);
      }
    });
  };

  const getData = async () => {
    setLoading(true);
    const res = await getCart();

    setCartData(res?.data?.data);
    // setShopProduct(res2?.data?.data?.data)
    setLoading(false);
  };

  const loadCountries = async () => {
    try {
      console.log('Loading countries...');
      const response = await getCountriesList();
      console.log('Countries API response:', response);

      if (response?.data?.data && response.data.data.length > 0) {
        console.log('Countries loaded:', response.data.data);
        dispatch(getCountries(response.data.data));
      } else {
        console.log(
          'No countries data received or empty array - using fallback',
        );
        // Fallback countries if API fails or returns empty array
        const fallbackCountries = [
          {id: 1, name: 'United States'},
          {id: 2, name: 'Canada'},
          {id: 3, name: 'United Kingdom'},
          {id: 4, name: 'Australia'},
          {id: 5, name: 'Germany'},
          {id: 6, name: 'France'},
          {id: 7, name: 'India'},
          {id: 8, name: 'Japan'},
          {id: 9, name: 'Brazil'},
          {id: 10, name: 'Mexico'},
        ];
        dispatch(getCountries(fallbackCountries));
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      // Fallback countries if API fails
      const fallbackCountries = [
        {id: 1, name: 'United States'},
        {id: 2, name: 'Canada'},
        {id: 3, name: 'United Kingdom'},
        {id: 4, name: 'Australia'},
        {id: 5, name: 'Germany'},
        {id: 6, name: 'France'},
        {id: 7, name: 'India'},
        {id: 8, name: 'Japan'},
        {id: 9, name: 'Brazil'},
        {id: 10, name: 'Mexico'},
      ];
      dispatch(getCountries(fallbackCountries));
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize={true}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          setFieldValue,
        }) => (
          <>
            {loading ? (
              <Loader />
            ) : (
              <>
                <Card>
                  <FlatList
                    data={cartData?.carts?.data}
                    refreshing={loading}
                    onRefresh={getData}
                    renderItem={({item, index}) => (
                      <CartItem
                        item={item}
                        showQuantityControls={false}
                        showSeparator={index !== products.length - 1}
                        quantity={true}
                        showDelete={false}
                      />
                    )}
                    keyExtractor={item => item?.id.toString()}
                  />
                </Card>
                <View style={styles.section}>
                  <Summary
                    subTotal={cartData?.total_amount}
                    deliveryCharges={cartData?.total_delivery_Fees}
                    style={{marginHorizontal: 2}}
                    titleStyle={styles.summaryText}
                  />
                </View>
              </>
            )}
            {/* Product Details and other sections as needed */}
            <Card>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shipping Address</Text>

                <RegularTextInput
                  label="First Name *"
                  placeholder="Enter First Name"
                  onChangeText={handleChange('shipping_first_name')}
                  onBlur={handleBlur('shipping_first_name')}
                  value={values.shipping_first_name}
                  errors={errors.shipping_first_name}
                  submitted={submitted}
                  containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                />
                <RegularTextInput
                  label="Last Name *"
                  placeholder="Enter Last Name"
                  onChangeText={handleChange('shipping_last_name')}
                  onBlur={handleBlur('shipping_last_name')}
                  value={values.shipping_last_name}
                  errors={errors.shipping_last_name}
                  submitted={submitted}
                  containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                />
                <RegularTextInput
                  label="Email Address *"
                  placeholder="Enter Email Address"
                  onChangeText={handleChange('shipping_email')}
                  onBlur={handleBlur('shipping_email')}
                  value={values.shipping_email}
                  errors={errors.shipping_email}
                  submitted={submitted}
                  containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                />

                <PhoneNumberInput
                  initialNumber={values.shipping_phone}
                  onNumberChange={handleChange('shipping_phone')}
                  label="Contact Number *"
                  errors={errors.shipping_phone}
                  submitted={submitted}
                  labelStyle={styles.label}
                  phoneContainerStyle={styles.fieldContainer}
                />

                <RegularTextInput
                  label="Residential Address *"
                  placeholder="Enter Address"
                  onChangeText={handleChange('shipping_address')}
                  onBlur={handleBlur('shipping_address')}
                  value={values.shipping_address}
                  errors={errors.shipping_address}
                  submitted={submitted}
                  containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                />

                <InterBoldLabel style={styles.countryLabel}>
                  Country *
                </InterBoldLabel>

                <View style={styles.dropdownContainer}>
                  <DropDownTextInput
                    key={'countries'}
                    items={
                      countries?.length > 0
                        ? countries.map((item: any) => {
                            return {
                              label: item.name,
                              value: item.name,
                              id: item?.id,
                            };
                          })
                        : []
                    }
                    listMode="MODAL"
                    idRequired
                    defaultValue={values.shipping_country}
                    // defaultValue='all'
                    placeholder="Select Country"
                    onChangeValue={e => {
                      console.log('Country selected:', e);
                      setFieldValue('shipping_country', e);
                      setFieldValue('shipping_state', '');
                      setFieldValue('shipping_city', '');
                      setShipStates([]);
                      setShipCities([]);

                      // Find the country object to get the ID
                      const selectedCountry = countries?.find(
                        (country: any) => country.name === e,
                      );
                      if (selectedCountry?.id) {
                        console.log('Country ID found:', selectedCountry.id);
                        fetchState(selectedCountry.id, true);
                      }
                    }}
                    style={styles.dropDown}
                  />
                </View>

                {values.shipping_country && shippStates.length != 0 && (
                  <>
                    <InterBoldLabel style={styles.countryLabel}>
                      State *
                    </InterBoldLabel>

                    <View style={[styles.dropdownContainer, {zIndex: 4}]}>
                      {/* <DropDownTextInput
                    items={states}
                    defaultValue={values.shipping_state}
                    // defaultValue='all'
                    placeholder="Select State"
                    onChangeValue={handleDropdownChange}
                    style={styles.dropDown}
                    /> */}
                      <DropDownTextInput
                        label="this is state"
                        key={'states'}
                        items={shippStates}
                        listMode="MODAL"
                        idRequired
                        defaultValue={values.shipping_state}
                        // defaultValue='all'
                        placeholder="Select State"
                        onChangeValue={e => {
                          console.log('State selected:', e);
                          setFieldValue('shipping_state', e);

                          // Find the state object to get the ID
                          const selectedState = shippStates?.find(
                            (state: any) => state.label === e,
                          );
                          if (selectedState?.id) {
                            console.log('State ID found:', selectedState.id);
                            fetchCity(selectedState.id, true);
                          }
                        }}
                        style={styles.dropDown}
                      />
                    </View>
                  </>
                )}

                {values.shipping_state && shipCities.length != 0 && (
                  <>
                    <InterBoldLabel style={styles.countryLabel}>
                      City *
                    </InterBoldLabel>

                    <View style={[styles.dropdownContainer, {zIndex: 3}]}>
                      {/* <DropDownTextInput
                        key={'city'}
                        items={cities}
                        defaultValue={values.shipping_city}
                        // defaultValue='all'
                        placeholder="Select City"
                        onChangeValue={handleDropdownChange}
                        style={styles.dropDown}
                      /> */}
                      <DropDownTextInput
                        key={'city'}
                        items={shipCities}
                        listMode="MODAL"
                        idRequired
                        defaultValue={values.shipping_city}
                        // defaultValue='all'
                        placeholder="Select City"
                        onChangeValue={e => {
                          console.log('City selected:', e);
                          setFieldValue('shipping_city', e);
                        }}
                        style={styles.dropDown}
                      />
                    </View>
                  </>
                )}

                <RegularTextInput
                  label="Zip Code *"
                  placeholder="Enter Zip Code"
                  onChangeText={handleChange('shipping_zip')}
                  onBlur={handleBlur('shipping_zip')}
                  value={values.shipping_zip}
                  errors={errors.shipping_zip}
                  submitted={submitted}
                  containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                />
              </View>

              <BillingAddressSame
                isSelected={isSelected}
                setIsSelected={setIsSelected}
                onPress={() => setIsSelected(!isSelected)}
              />

              {/* Billing Address */}
              {!isSelected && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Billing Address</Text>

                  <RegularTextInput
                    label="First Name *"
                    placeholder="Enter First Name"
                    onChangeText={handleChange('billing_first_name')}
                    onBlur={handleBlur('billing_first_name')}
                    value={values.billing_first_name}
                    errors={errors.billing_first_name}
                    submitted={submitted}
                    containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                  />
                  <RegularTextInput
                    label="Last Name *"
                    placeholder="Enter Last Name"
                    onChangeText={handleChange('billing_last_name')}
                    onBlur={handleBlur('billing_last_name')}
                    value={values.billing_last_name}
                    errors={errors.billing_last_name}
                    submitted={submitted}
                    containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                  />

                  <RegularTextInput
                    label="Email Address *"
                    placeholder="Enter Email Address"
                    onChangeText={handleChange('billing_email')}
                    onBlur={handleBlur('billing_email')}
                    value={values.billing_email}
                    errors={errors.billing_email}
                    submitted={submitted}
                    containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                  />

                  <PhoneNumberInput
                    initialNumber={values.billing_phone}
                    onNumberChange={handleChange('billing_phone')}
                    label="Contact Number *"
                    errors={errors.billing_phone}
                    submitted={submitted}
                    labelStyle={styles.label}
                    phoneContainerStyle={styles.fieldContainer}
                  />

                  <RegularTextInput
                    label="Residential Address *"
                    placeholder="Enter Address"
                    onChangeText={handleChange('billing_address')}
                    onBlur={handleBlur('billing_address')}
                    value={values.billing_address}
                    errors={errors.billing_address}
                    submitted={submitted}
                    containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                  />

                  <InterBoldLabel style={styles.countryLabel}>
                    Country *
                  </InterBoldLabel>

                  <View style={styles.dropdownContainer}>
                    {/* <DropDownTextInput
                      key={'billingCountry'}
                      items={countries}
                      defaultValue={values.billing_country}
                      // defaultValue='all'
                      placeholder="Select Country"
                      onChangeValue={handleDropdownChange}
                      style={styles.dropDown}
                    /> */}
                    <DropDownTextInput
                      key={'billingCountries'}
                      items={
                        countries?.length > 0
                          ? countries.map((item: any) => {
                              return {
                                label: item.name,
                                value: item.name,
                                id: item?.id,
                              };
                            })
                          : []
                      }
                      listMode="MODAL"
                      idRequired
                      defaultValue={values.billing_country}
                      // defaultValue='all'
                      placeholder="Select Country"
                      onChangeValue={e => {
                        console.log('Billing country selected:', e);
                        setFieldValue('billing_country', e);
                        setFieldValue('billing_state', '');
                        setFieldValue('billing_city', '');
                        setBillStates([]);
                        setBillCities([]);

                        // Find the country object to get the ID
                        const selectedCountry = countries?.find(
                          (country: any) => country.name === e,
                        );
                        if (selectedCountry?.id) {
                          console.log(
                            'Billing Country ID found:',
                            selectedCountry.id,
                          );
                          fetchState(selectedCountry.id, false);
                        }
                      }}
                      style={styles.dropDown}
                    />
                  </View>

                  {values?.billing_country && billStates.length != 0 && (
                    <>
                      <InterBoldLabel style={styles.countryLabel}>
                        State *
                      </InterBoldLabel>

                      <View style={[styles.dropdownContainer, {zIndex: 4}]}>
                        {/* <DropDownTextInput
                          key={'billingStates'}
                          items={states}
                          // defaultValue='all'
                          defaultValue={values.billing_state}
                          placeholder="Select State"
                          onChangeValue={handleDropdownChange}
                          style={styles.dropDown}
                        /> */}
                        <DropDownTextInput
                          key={'states'}
                          items={billStates}
                          listMode="MODAL"
                          idRequired
                          defaultValue={values.billing_state}
                          // defaultValue='all'
                          placeholder="Select State"
                          onChangeValue={e => {
                            console.log('Billing state selected:', e);
                            setFieldValue('billing_state', e);

                            // Find the state object to get the ID
                            const selectedState = billStates?.find(
                              (state: any) => state.label === e,
                            );
                            if (selectedState?.id) {
                              console.log(
                                'Billing State ID found:',
                                selectedState.id,
                              );
                              fetchCity(selectedState.id, false);
                            }
                          }}
                          style={styles.dropDown}
                        />
                      </View>
                    </>
                  )}

                  {values.billing_state && billCities.length != 0 && (
                    <>
                      <InterBoldLabel style={styles.countryLabel}>
                        City *
                      </InterBoldLabel>

                      <View style={[styles.dropdownContainer, {zIndex: 3}]}>
                        {/* <DropDownTextInput
                          items={cities}
                          key={'billingCity'}
                          // defaultValue='all'

                          defaultValue={values.billing_city}
                          placeholder="Select City"
                          onChangeValue={handleDropdownChange}
                          style={styles.dropDown}
                        /> */}
                        <DropDownTextInput
                          key={'city'}
                          items={billCities}
                          listMode="MODAL"
                          idRequired
                          defaultValue={values.billing_city}
                          // defaultValue='all'
                          placeholder="Select City"
                          onChangeValue={e => {
                            console.log('Billing city selected:', e);
                            setFieldValue('billing_city', e);
                          }}
                          style={styles.dropDown}
                        />
                      </View>
                    </>
                  )}

                  <RegularTextInput
                    label="Zip Code *"
                    placeholder="Enter Zip Code"
                    onChangeText={handleChange('billing_zip')}
                    onBlur={handleBlur('billing_zip')}
                    value={values.billing_zip}
                    errors={errors.billing_zip}
                    submitted={submitted}
                    containerStyle={styles.fieldContainer}
                  style={styles.inputStyle}
                  />
                </View>
              )}

              {/* Place Order Button */}
              <CustomButton
                disable={loading}
                loading={loading}
                style={styles.placeOrderButton}
                onPress={() => {
                  console.log('Place Order button clicked');
                  console.log('Current form values:', values);
                  console.log('Current form errors:', errors);
                  console.log(
                    'isSelected (billing same as shipping):',
                    isSelected,
                  );

                  // Validate required fields manually
                  const requiredFields = [
                    'shipping_first_name',
                    'shipping_last_name',
                    'shipping_email',
                    'shipping_phone',
                    'shipping_address',
                    'shipping_country',
                    'shipping_zip',
                  ];

                  const missingFields = requiredFields.filter(
                    field => !values[field],
                  );

                  if (missingFields.length > 0) {
                    Toast.error(`Please fill in: ${missingFields.join(', ')}`);
                    console.log('Missing required fields:', missingFields);
                    return;
                  }

                  setSubmitted(true);
                  handleSubmit();
                }}>
                Place Order
              </CustomButton>
            </Card>
          </>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default CheckoutScreen;
