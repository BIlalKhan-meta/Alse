import React, { useEffect, useState }from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import * as yup from 'yup';
import styles from './styles.tsx';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import CustomButton from '../../../components/CustomButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import InterBoldLabel from '../../../components/Text/InterBoldLabel';
import PoppinsLabel from '../../../components/Text/Poppins';
import StepIndicator from '../../../components/StepIndicator';

interface FormValues {
  OTP: string;
}

const Verification: React.FC = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const email = route?.params?.email || '';
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<FormValues>({
    OTP: '',
  });

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    OTP: yup
      .string()
      .min(6, 'Verification code must be at least 6 characters')
      .required('Verification code is required'),
  });

  const handleSubmit = async (values: FormValues) => {
    console.log(values, 'Valuessssssss');
    setSubmitted(true);

    const apiData = {
      email: email,
      OTP: values.OTP,
    };

  };

  return (
    <SafeAreaView style={ styles.safeAreaView }>
      {/* Show the Back Button */}
      <TouchableOpacity onPress={ () => navigation.goBack() }>
        <Image source={ require('./images/arrow_back.png') } style={ styles.backButton } />
      </TouchableOpacity>

      <StepIndicator totalSteps={ 3 } currentStep={ 1 } />

      <Formik
        initialValues={ initialValues }
        validationSchema={ validationSchema }
        enableReinitialize
        onSubmit={ handleSubmit }>
        { ({ handleSubmit, handleChange, handleBlur, values, errors, setFieldValue }) => (

          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={ false }>
              <View style={ styles.container }>
                <View style={ styles.imageContainer }>
                  <Image
                    source={ require('./images/Letter.png') }
                    style={ styles.loginImage }
                  />
                </View>

                <InterBoldLabel style={ styles.heading }>Enter OTP</InterBoldLabel>
                <PoppinsLabel style={ styles.subHeading }>Enter the OTP code we just sent you on your registered Email/Phone number</PoppinsLabel>
                <CustomButton
                  style={ styles.loginBtn }
                  onPress={ handleSubmit }
                  loading={ submitted }>
                  Continue
                </CustomButton>
              </View>
            </KeyboardAwareScrollView>
          </>
        ) }
      </Formik>
    </SafeAreaView>
  );
};

export default Verification;