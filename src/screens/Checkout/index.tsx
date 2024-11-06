import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Linking,
} from 'react-native';
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
import InAppBrowser from 'react-native-inappbrowser-reborn';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const isFoused = useIsFocused();

  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState([]);
  const subTotal = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  );
  const adminCommission = 5;
  const grandTotal = subTotal + adminCommission;

  const countries = [
    {label: 'Country 1', value: 'country1'},
    {label: 'Country 2', value: 'country2'},
  ];

  const states = [
    {label: 'State 1', value: 'state1'},
    {label: 'State 2', value: 'state2'},
  ];

  const cities = [
    {label: 'City 1', value: 'city1'},
    {label: 'City 2', value: 'city2'},
  ];

  const handleDropdownChange = (value: string | null) => {
    console.log('Selected value:', value);
  };

  const validationSchema = yup.object().shape({
    first_name: yup.string().required('First Name is required'),
    last_name: yup.string().required('Last Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone Number is required'),
    shipping_first_name: yup.string().required('First Name is required'),
    shipping_last_name: yup.string().required('Last Name is required'),
    shipping_email: yup
      .string()
      .email('Invalid email')
      .required('Email is required'),
    shipping_phone: yup.string().required('Phone Number is required'),
    shipping_address: yup.string().required('Shipping Address is required'),
    shipping_country: yup.string().required('Country is required'),
    shipping_state: yup.string().required('State is required'),
    shipping_city: yup.string().required('City is required'),
    shipping_zip: yup.string().required('Zip Code is required'),

    // ...(!isSelected && {
    //   billing_first_name: yup.string().required('First Name is required'),
    //   billing_last_name: yup.string().required('Last Name is required'),
    //   billing_phone: yup.string().required('Phone Number is required'),
    //   billing_address: yup.string().required('Billing Address is required'),
    //   billing_country: yup.string().required('Country is required'),
    //   billing_state: yup.string().required('State is required'),
    //   billing_city: yup.string().required('City is required'),
    //   billing_zip: yup.string().required('Zip Code is required'),
    // }),
  });

  const initialValues = {
    first_name: 'asd',
    last_name: 'asd',
    email: 'asd@gmail.com',
    phone: 'asd',
    shipping_first_name: 'asd',
    shipping_last_name: 'asd',
    shipping_email: 'asd@gmail.com',
    shipping_phone: 'asd',
    shipping_address: 'asd',
    shipping_country: countries[0].value, // Initialize with default value
    shipping_state: states[0].value, // Initialize with default value
    shipping_city: cities[0].value, // Initialize with default value
    shipping_zip: 'asd',
    billing_first_name: 'asd',
    billing_last_name: 'asd',
    billing_email: 'asd@gmail.com',
    billing_phone: 'asd',
    billing_address: 'asd',
    billing_country: countries[0].value, // Initialize with default value
    billing_state: states[0].value, // Initialize with default value
    billing_city: cities[0].value, // Initialize with default value
    billing_zip: 'asd',
  };

  const handleSubmit = async (values: object) => {
    // navigation.navigate('Payment');

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

    console.log('Form submitted:', JSON.stringify(form, null, 4));
    await checkout(form)
      .then(async res => {
        if (res?.data) {
          if (await InAppBrowser.isAvailable()) {
            const result = await InAppBrowser.open(res?.data?.data?.url);
            if (result) {
              console.log('RESSSSSSSSSSSSSSSSULTTTTTT', result);
            }
          } else Linking.openURL(res?.data?.data?.url);
        }
      })
      .catch(err => console.log('ERRORRRRRRRRRRRRRRRRR', err));
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
  }, [isFoused]);

  const getData = async () => {
    setLoading(true);
    const res = await getCart();

    setCartData(res?.data?.data?.carts?.data);
    // setShopProduct(res2?.data?.data?.data)
    setLoading(false);
  };
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <Card>
              {loading ? (
                <Loader />
              ) : (
                <FlatList
                  data={cartData}
                  refreshing={loading}
                  onRefresh={getData}
                  renderItem={({item, index}) => (
                    <CartItem
                      item={item}
                      showQuantityControls={false}
                      showSeparator={index !== products.length - 1}
                      quantity={true}
                    />
                  )}
                  keyExtractor={item => item.id.toString()}
                />
              )}
            </Card>
            {/* Product Details and other sections as needed */}
            <View style={styles.section}>
              <Summary
                subTotal={subTotal}
                deliveryCharges={15}
                discount={10}
                grandTotal={grandTotal}
                style={{marginHorizontal: 2}}
              />
            </View>
            <Card>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <RegularTextInput
                label="First Name *"
                placeholder="Enter First Name"
                onChangeText={handleChange('first_name')}
                onBlur={handleBlur('first_name')}
                value={values.first_name}
                errors={errors.first_name}
                submitted={submitted}
                style={styles.inputStyle}
              />

              {/* Add other text inputs */}
              <RegularTextInput
                label="Last Name *"
                placeholder="Enter Last Name"
                onChangeText={handleChange('last_name')}
                onBlur={handleBlur('last_name')}
                value={values.last_name}
                errors={errors.last_name}
                submitted={submitted}
                style={styles.inputStyle}
              />
              {/* Add other text inputs */}
              <RegularTextInput
                label="Email Address *"
                placeholder="Enter Email Address"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                errors={errors.email}
                submitted={submitted}
                style={styles.inputStyle}
              />

              <PhoneNumberInput
                initialNumber={values.phone}
                onNumberChange={handleChange('phone')}
                label="Contact Number *"
                // submitted={submitted}
                errors={errors.phone}
                submitted={submitted}
                labelStyle={styles.label}
                style={styles.inputStyle}
              />

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
                  style={styles.inputStyle}
                />

                <PhoneNumberInput
                  initialNumber={values.phone}
                  onNumberChange={handleChange('shipping_phone')}
                  label="Contact Number *"
                  // submitted={submitted}
                  errors={errors.shipping_phone}
                  submitted={submitted}
                  labelStyle={styles.label}
                  style={styles.inputStyle}
                />

                <RegularTextInput
                  label="Residential Address *"
                  placeholder="Enter Address"
                  onChangeText={handleChange('shipping_address')}
                  onBlur={handleBlur('shipping_address')}
                  value={values.shipping_address}
                  errors={errors.shipping_address}
                  submitted={submitted}
                  style={styles.inputStyle}
                />

                <InterBoldLabel style={styles.countryLabel}>
                  Country *
                </InterBoldLabel>

                <View style={styles.dropdownContainer}>
                  <DropDownTextInput
                    items={countries}
                    defaultValue={values.shipping_country}
                    // defaultValue='all'
                    placeholder="Select Country"
                    onChangeValue={handleDropdownChange}
                    style={styles.dropDown}
                  />
                </View>

                <InterBoldLabel style={styles.countryLabel}>
                  State *
                </InterBoldLabel>

                <View style={[styles.dropdownContainer, {zIndex: 4}]}>
                  <DropDownTextInput
                    items={states}
                    defaultValue={values.shipping_state}
                    // defaultValue='all'
                    placeholder="Select State"
                    onChangeValue={handleDropdownChange}
                    style={styles.dropDown}
                  />
                </View>

                <InterBoldLabel style={styles.countryLabel}>
                  City *
                </InterBoldLabel>

                <View style={[styles.dropdownContainer, {zIndex: 3}]}>
                  <DropDownTextInput
                    items={cities}
                    defaultValue={values.shipping_city}
                    // defaultValue='all'
                    placeholder="Select City"
                    onChangeValue={handleDropdownChange}
                    style={styles.dropDown}
                  />
                </View>

                <RegularTextInput
                  label="Zip Code *"
                  placeholder="Enter Zip Code"
                  onChangeText={handleChange('shipping_zip')}
                  onBlur={handleBlur('shipping_zip')}
                  value={values.shipping_zip}
                  errors={errors.shipping_zip}
                  submitted={submitted}
                  style={styles.inputStyle}
                />
              </View>

              <BillingAddressSame
                isSelected={isSelected}
                setIsSelected={setIsSelected}
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
                    style={styles.inputStyle}
                  />

                  <PhoneNumberInput
                    initialNumber={values.phone}
                    onNumberChange={handleChange('billing_phone')}
                    label="Contact Number *"
                    // submitted={submitted}
                    errors={errors.billing_phone}
                    submitted={submitted}
                    labelStyle={styles.label}
                    style={styles.inputStyle}
                  />

                  <RegularTextInput
                    label="Residential Address *"
                    placeholder="Enter Address"
                    onChangeText={handleChange('billing_address')}
                    onBlur={handleBlur('billing_address')}
                    value={values.billing_address}
                    errors={errors.billing_address}
                    submitted={submitted}
                    style={styles.inputStyle}
                  />

                  <InterBoldLabel style={styles.countryLabel}>
                    Country *
                  </InterBoldLabel>

                  <View style={styles.dropdownContainer}>
                    <DropDownTextInput
                      items={countries}
                      defaultValue={values.billing_country}
                      // defaultValue='all'
                      placeholder="Select Country"
                      onChangeValue={handleDropdownChange}
                      style={styles.dropDown}
                    />
                  </View>

                  <InterBoldLabel style={styles.countryLabel}>
                    State *
                  </InterBoldLabel>

                  <View style={[styles.dropdownContainer, {zIndex: 4}]}>
                    <DropDownTextInput
                      items={states}
                      // defaultValue='all'

                      defaultValue={values.billing_state}
                      placeholder="Select State"
                      onChangeValue={handleDropdownChange}
                      style={styles.dropDown}
                    />
                  </View>

                  <InterBoldLabel style={styles.countryLabel}>
                    City *
                  </InterBoldLabel>

                  <View style={[styles.dropdownContainer, {zIndex: 3}]}>
                    <DropDownTextInput
                      items={cities}
                      // defaultValue='all'

                      defaultValue={values.billing_city}
                      placeholder="Select City"
                      onChangeValue={handleDropdownChange}
                      style={styles.dropDown}
                    />
                  </View>

                  <RegularTextInput
                    label="Zip Code *"
                    placeholder="Enter Zip Code"
                    onChangeText={handleChange('shipping_zip')}
                    onBlur={handleBlur('shipping_zip')}
                    value={values.shipping_zip}
                    errors={errors.shipping_zip}
                    submitted={submitted}
                    style={styles.inputStyle}
                  />
                </View>
              )}

              {/* Place Order Button */}
              <CustomButton
                disable={loading}
                style={styles.placeOrderButton}
                onPress={() => {
                  // navigation.navigate("Payment")
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
