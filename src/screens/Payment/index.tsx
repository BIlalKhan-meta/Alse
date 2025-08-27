import React from 'react';
import {Text, View, SafeAreaView} from 'react-native';
import {useLayoutEffect, useState} from 'react';

import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import styles from './styles';
import GeneralModal from '../../components/GeneralModal';
import {images} from '../../utils/images';
import DatePickerTextInput from '../../components/TextInput/DatePickerTextInput';
import CustomButton from '../../components/CustomButton';
import {formatDate} from '../../utils';
import {colors} from '../../utils/theme';
import {checkout} from '../../api/product';
import {Toast} from '../../utils/helpers';

const Payment: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector(selectUserProfile);

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [openDate, setOpenDate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Get order data from route params (passed from checkout screen)
  const orderData = (route.params as any)?.orderData || {};

  // Debug: Log the received order data
  console.log('Payment Screen - Received order data:', orderData);
  console.log('Payment Screen - Route params:', route.params);

  interface FormValues {
    cardHolderName: string;
    cardNumber: string;
    CVVNumber: string;
    expirationDate: Date;
  }

  const initialValues = {
    cardHolderName: '',
    cardNumber: '',
    CVVNumber: '',
    expirationDate: new Date(),
  };

  // Function to format card number with spaces
  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Limit to 12 digits
    const limited = cleaned.slice(0, 12);
    // Add spaces every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  // Function to validate card number format
  const validateCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length !== 12) {
      return 'Card number must be 12 digits';
    }
    if (!/^\d{12}$/.test(cleaned)) {
      return 'Card number must contain only digits';
    }
    return undefined;
  };

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    cardHolderName: yup.string().required('Card Holder Name is required'),
    cardNumber: yup
      .string()
      .required('Card Number is required')
      .test(
        'card-number-format',
        'Invalid card number format',
        function (value) {
          if (!value) return true; // Let required validation handle empty values
          const error = validateCardNumber(value);
          return !error;
        },
      ),
    CVVNumber: yup
      .string()
      .required('CVV Number is required')
      .matches(/^\d{3,4}$/, 'CVV must be 3-4 digits')
      .max(4, 'CVV cannot exceed 4 digits'),
    expirationDate: yup.date().required('Expiration Date is required'),
  });

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      // Combine order data with payment data
      const paymentData = {
        ...orderData, // Include all the shipping/billing data from checkout
        // Ensure required fields are present with correct names
        first_name:
          orderData.shipping_first_name || orderData.billing_first_name,
        last_name: orderData.shipping_last_name || orderData.billing_last_name,
        email:
          user?.email || orderData.shipping_email || orderData.billing_email, // Use user's actual email from profile
        phone: orderData.shipping_phone || orderData.billing_phone,
        address: orderData.shipping_address || orderData.billing_address,
        // Payment fields
        card_holder_name: values.cardHolderName,
        card_number: values.cardNumber.replace(/\s/g, ''), // Remove spaces for API
        cvv: values.CVVNumber,
        expiration_date: formatDate(values.expirationDate),
      };

      console.log('Payment Screen - Combined payment data:', paymentData);
      console.log('Payment Screen - Order data keys:', Object.keys(orderData));

      // Create FormData for API call
      const formData = new FormData();
      Object.entries(paymentData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log('Payment data being sent:', paymentData);

      // Call checkout API with complete order + payment data
      const response = await checkout(formData);

      if (response?.data) {
        console.log('Payment successful:', response.data);
        setPaymentSuccess(true);
        Toast.success('Payment processed successfully!');
      } else {
        Toast.error('Payment failed. Please try again.');
      }
    } catch (error: any) {
      console.log('Payment error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Payment failed. Please try again.';
      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          errors,
          setFieldValue,
        }) => (
          <>
            <KeyboardAwareScrollView
              style={styles.scrollview}
              showsVerticalScrollIndicator={false}>
              <View style={styles.container}>
                {/* Payment Card Container */}
                <View style={styles.paymentCard}>
                  <RegularTextInput
                    label="Cardholder Name"
                    placeholder="Enter Card Holder Name"
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('cardHolderName')}
                    onBlur={handleBlur('cardHolderName')}
                    value={values.cardHolderName}
                    submitted={submitted}
                    errors={errors.cardHolderName}
                  />

                  <View style={styles.cardNumberContainer}>
                    <RegularTextInput
                      label="Card Number"
                      placeholder="XXXX XXXX XXXX"
                      placeholderTextColor="#9B9797"
                      onChangeText={text => {
                        const formatted = formatCardNumber(text);
                        setFieldValue('cardNumber', formatted);
                      }}
                      onBlur={handleBlur('cardNumber')}
                      value={values.cardNumber}
                      submitted={submitted}
                      errors={errors.cardNumber}
                      style={styles.cardNumberInput}
                      keyboardType="numeric"
                      maxLength={14} // 12 digits + 2 spaces
                    />
                    <View style={styles.cardIconsContainer}>
                      <View style={styles.cardIcon}>
                        <Text style={styles.cardIconText}>💳</Text>
                      </View>
                      <View style={styles.cardIcon}>
                        <Text style={styles.cardIconText}>🏦</Text>
                      </View>
                    </View>
                  </View>

                  <RegularTextInput
                    label="CVV Number"
                    placeholder="Enter CVV Number"
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('CVVNumber')}
                    onBlur={handleBlur('CVVNumber')}
                    value={values.CVVNumber}
                    submitted={submitted}
                    errors={errors.CVVNumber}
                    style={styles.cvvStyle}
                    keyboardType="numeric"
                    maxLength={4}
                  />

                  <DatePickerTextInput
                    label="Expiration Date"
                    value={
                      values.expirationDate
                        ? formatDate(values.expirationDate)
                        : ''
                    }
                    date={values.expirationDate}
                    setDate={date => setFieldValue('expirationDate', date)}
                    setOpenDate={setOpenDate}
                    openDate={openDate}
                    submitted={submitted}
                    errors={errors.expirationDate}
                    style={styles.expirationInput}
                  />

                  <CustomButton
                    style={styles.payButton}
                    loading={loading}
                    onPress={() => {
                      setSubmitted(true);
                      handleSubmit();
                    }}>
                    PAY NOW
                  </CustomButton>
                </View>

                <GeneralModal
                  visible={paymentSuccess}
                  closeModal={() => setPaymentSuccess(false)}
                  icon={images.checkedIcon}
                  title="Successfully"
                  message="Payment has been processed successfully. Your Order ID is #1234567"
                  buttonText="Ok"
                  primaryBtn={true}
                  onPress={() => {
                    setPaymentSuccess(false);
                    // Navigate back or to order confirmation
                    navigation.goBack();
                  }}
                />
              </View>
            </KeyboardAwareScrollView>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default Payment;
