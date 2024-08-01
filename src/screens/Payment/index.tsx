import { Text, View, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useLayoutEffect, useState } from 'react';

import { useNavigation } from '@react-navigation/native';

// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import HeaderComponent from '../../components/HeaderComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import * as yup from 'yup';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import styles from './styles';
import GeneralModal from '../../components/GeneralModal';
import { images } from '../../utils/images';
import DatePickerTextInput2 from '../../components/TextInput/DatePickerTextInput2';
import DatePickerTextInput from '../../components/TextInput/DatePickerTextInput';
// import GeneralRatingModal from '../../components/GeneralRatingModal';
import CustomButton from '../../components/CustomButton';
import { formatDate } from '../../utils';
import { colors } from '../../utils/theme';
import Card from '../../components/Card';



const Payment: React.FC = () => {
  const navigation = useNavigation();

  const [submitted, setSubmitted] = useState<boolean>(false)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false)
  const [payment, setPayment] = useState<boolean>(true)
  const [openDate, setOpenDate] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  interface FormValues {
    cardHolderName: string,
    cardNumber: string,
    CVVNumber: string,
    expirationDate: string,


  }

  const initialValues = {
    cardHolderName: '',
    cardNumber: '',
    CVVNumber: '',
    expirationDate: new Date(),
  };

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    cardHolderName: yup.string().required('Card Holder Name is required'),
    cardNumber: yup.string().required('Card Number is required'),
    CVVNumber: yup.string().required('CVV Number is required'),
    expirationDate: yup.string().required('Expiration Date is required'),
  });


  const handleSubmit = (values: object, { resetForm }: { resetForm: () => void }) => {
    console.log("SUBMITTED")
    // setPaymentSuccess(true)
    // setModalVisible(true)
    setPaymentSuccess(true)

  }

  const handleSubmitFeedback = (review: string, rating: number) => {
    console.log(`Review: ${review}, Rating: ${rating}`);
    // Handle the submission logic here
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor
      },

    });
  }, [navigation]);
  return (

    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}>
      {({ handleSubmit, handleChange, handleBlur, values, errors, resetForm, setFieldValue }) => (
        <>
          <KeyboardAwareScrollView
            style={styles.scrollview}
          >
            <View style={styles.container}>

              <Card>

                <RegularTextInput
                  label="Cardholder Name"
                  placeholder='Enter Card Holder Name'
                  placeholderTextColor="#9B9797"
                  onChangeText={handleChange('cardHolderName')}
                  onBlur={handleBlur('cardHolderName')}
                  value={values.cardHolderName}
                  submitted={submitted}
                  errors={errors.cardHolderName} />

                <RegularTextInput
                  label="Card Number"
                  placeholder='Enter Card Number'
                  placeholderTextColor="#9B9797"
                  onChangeText={handleChange('cardNumber')}
                  onBlur={handleBlur('cardNumber')}
                  value={values.cardNumber}
                  submitted={submitted}
                  errors={errors.cardNumber}
                />

                <View style={styles.cvvContainer}>
                  <RegularTextInput
                    label="CVV Number"
                    placeholder='Enter CVV Number'
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('CVVNumber')}
                    onBlur={handleBlur('CVVNumber')}
                    value={values.CVVNumber}
                    submitted={submitted}
                    errors={errors.CVVNumber}
                    style={styles.cvvStyle}
                  />

                  <DatePickerTextInput
                    label='Expiration Date'
                    value={values.expirationDate ? formatDate(values.expirationDate) : ''}
                    date={values.expirationDate}
                    setDate={(date) => setFieldValue('expirationDate', date)}
                    setOpenDate={setOpenDate}
                    openDate={openDate}
                    submitted={submitted}
                    errors={errors.expirationDate}
                  />
                </View>




                <CustomButton
                  style={{ alignSelf: "center" }}

                  onPress={() => {
                    setSubmitted(true)
                    resetForm()
                    handleSubmit()

                  }}
                >
                  PAY NOW
                </CustomButton>
              </Card>

              {/* <GeneralRatingModal
                visible={modalVisible}
                closeModal={() => setModalVisible(false)}
                avatar={images.user}  // Replace with your avatar image source
                userName="Abc Seller"
                storeName="Qef Store"
                onSubmit={handleSubmitFeedback}
              /> */}

              <GeneralModal
                visible={paymentSuccess}
                closeModal={() => setPaymentSuccess(false)}
                icon={images.doubleCheck}
                title='Successfully'
                message='Order has been placed successfull. Your Order ID is #1234567'
                buttonText='Ok'
                onPress={() => {
                  setPaymentSuccess(false)
                  // navigation.navigate("DrawerNavigation", { screen: "Home" })
                  // navigation.navigate("Home")
                }} />


            </View>
          </KeyboardAwareScrollView>
        </>
      )

      }
    </Formik>
  );
};

export default Payment;