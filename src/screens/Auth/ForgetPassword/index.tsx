import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import { Formik } from 'formik';
import { colors } from '../../../utils/theme';
import CustomButton from '../../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import InterBoldLabel from '../../../components/Text/InterBoldLabel';
import PoppinsLabel from '../../../components/Text/Poppins';
import StepIndicator from '../../../components/StepIndicator';

interface FormValues {
  identifier: string;
}

const ForgetPassword: React.FC = () => {
  const navigation = useNavigation<any>();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<FormValues>({
    identifier: '',
  });


  const validationSchema = yup.object().shape({
    // Email or Phone number
    identifier: yup.string().required('Email or Phone number is required'),
  });

  const handleSubmit = async (values: FormValues) => {
    console.log(values, 'Valuessssssss');
    setSubmitted(true);

    const apiData = {
      identifier: values.identifier,
    };

  };

  return (
    <SafeAreaView style={ styles.safeAreaView }>
      {/* Show the Back Button */}
      <TouchableOpacity onPress={ () => navigation.goBack() }>
        <Image source={ require('./images/arrow_back.png') } style={ styles.backButton } />
      </TouchableOpacity>

      <StepIndicator totalSteps={ 3 } currentStep={ 0 } />

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

                <InterBoldLabel style={ styles.heading }>Forget Password</InterBoldLabel>
                <PoppinsLabel style={ styles.subHeading }>It was popularised in the 1960s with the release of Letraset sheetscontaining Lorem Ipsum.</PoppinsLabel>

                <RegularTextInput
                  placeholder='Email/Phone Number'
                  placeholderTextColor={ colors.darkGray }
                  onChangeText={ handleChange('identifier') }
                  onBlur={ handleBlur('identifier') }
                  value={ values.identifier }
                  submitted={ submitted }
                  errors={ errors.identifier }
                  style={ styles.input }
                />


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

export default ForgetPassword;