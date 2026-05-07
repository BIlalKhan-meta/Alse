import React from 'react';
import {Text, View, SafeAreaView, Modal, Platform} from 'react-native';
import {useLayoutEffect, useRef, useState, useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';

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
import Loader from '../../components/Loader';
import InterRegular from '../../components/Text/InterRegular';

const Payment: React.FC = () => {
  const navigation = useNavigation();

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [openDate, setOpenDate] = useState<boolean>(false);
  /** Full-screen-ish overlay while “processing” payment (demo flow, no API). */
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const PAYMENT_PROCESS_MS = 5000;

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

  const handleSubmit = async (_values: FormValues) => {
    setProcessingPayment(true);

    await new Promise<void>(resolve =>
      setTimeout(resolve, PAYMENT_PROCESS_MS),
    );

    if (!mountedRef.current) {
      return;
    }

    setProcessingPayment(false);
    setPaymentSuccess(true);
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
      <Modal
        visible={processingPayment}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => undefined}>
        <View style={styles.paymentLoadingBackdrop}>
          <View style={styles.paymentLoadingCard}>
            <Loader
              size="large"
              style={{flex: 0, backgroundColor: 'transparent'}}
            />
            <InterRegular style={styles.paymentLoadingCaption}>
              Processing your payment...
            </InterRegular>
          </View>
        </View>
      </Modal>

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
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              enableOnAndroid
              enableAutomaticScroll
              keyboardShouldPersistTaps="handled"
              extraScrollHeight={Platform.OS === 'ios' ? 100 : 120}
              extraHeight={Platform.OS === 'ios' ? 100 : 120}>
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
                    disable={processingPayment}
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
                  title="Payment complete"
                  message="Your payment has been made successfully."
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
