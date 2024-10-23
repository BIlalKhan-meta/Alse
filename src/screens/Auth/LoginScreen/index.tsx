import { useEffect, useState } from 'react';
import {
  View, Text,
  TouchableOpacity,
  Image
} from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import InterBold from '../../../components/Text/InterBold';
import InterRegular from '../../../components/Text/InterRegular';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import { Formik } from 'formik';

import InterLight from '../../../components/Text/InterLight';
import PhoneNumberInput from '../../../components/TextInput/PhoneNumberInput';
import { colors } from '../../../utils/theme';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import CheckboxComponent from '../../../components/CheckboxComponent';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../utils/images';
import GeneralModal from '../../../components/GeneralModal';
import { useNavigation } from '@react-navigation/native';
import RememberMeContainer from '../../../components/RememberMeContainer';
import Card from '../../../components/Card';
import SignupLastBottomText from '../../../components/SignupLastBottomText';
import { useAppDispatch } from '../../../hooks/storeHooks';
import { login } from '../../../store/slices/authSlice';
import { getMessage, Toast } from '../../../utils/helpers';
import { getFcmToken } from '../../../utils/messaging.utils';

const LoginScreen: React.FC = () => {

  const navigation = useNavigation();
  const dispatch = useAppDispatch();


  const [submitted, setSubmitted] = useState<boolean>(false)
  const [securePassword, setSecurePassword] = useState<boolean>(true)
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string | undefined>('');


  const getToken = async () => {
    const token = await getFcmToken();
    setDeviceToken(token);
  };

  useEffect(() => {
    getToken();
  }, []);


  interface FormValues {
    email: string,
    password: string
  }

  // const initialValues = {
  //   email: '',
  //   password: '',
  // };

  const initialValues = {
    email: __DEV__ ? 'tony@mailinator.com' : '',
    password: __DEV__ ? '12345678' : '',
  };


  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    email: yup
      .string()
      .email('Invalid Email')
      .required('Email is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required')
  });

  const handleSubmit = async (values: FormValues, { resetForm }: { resetForm: () => void }) => {

    console.log(values, "Valuessssssss")
    setSubmitted(true);
    // Mark the form as submitted
    try {

      const apiData = {
        email: values.email,
        password: values.password,
        token: deviceToken
      }

      await dispatch(login({ ...apiData, useFormData: true })).unwrap(); // Dispatch the login action
      resetForm(); // Reset the form on successful login
      navigation.navigate("Home"); // Navigate to Home screen
      setSubmitted(false)
    } catch (error) {
      console.error("Login error:", error); // Handle error (optional)
      setSubmitted(false)
      Toast.error(getMessage(error?.message));

    }
  };


  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}>
      {({ handleSubmit, handleChange, handleBlur, values, errors, resetForm, setFieldValue }) => (
        <>
          <KeyboardAwareScrollView
            style={styles.scrollview}
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.container}>
              <Card style={styles.cardStyle}>

                <InterBold style={styles.heading}>Login</InterBold>




                <RegularTextInput
                  label="Email Address"
                  placeholder='Enter Email Address'
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  submitted={submitted}
                  errors={errors.email}
                />







                <RegularTextInput
                  label="Password"
                  placeholder='Enter Password'
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  submitted={submitted}
                  errors={errors.password}
                  secureTextEntry={securePassword}
                  onPressPassword={() => setSecurePassword(!securePassword)} />


                <RememberMeContainer
                  isSelected={isSelected}
                  setIsSelected={setIsSelected}
                  onPress={() => navigation.navigate("ForgotPassword")}
                />


                <CustomButton
                  // onPress={() => {
                  //   setSubmitted(true)
                  //   resetForm()
                  //   handleSubmit()
                  // }}
                  onPress={handleSubmit}
                  loading={submitted}

                >
                  Login
                </CustomButton>


                <View style={styles.bottomStyle}>

                  <SignupLastBottomText
                    firstText={'Dont have an account?'}
                    secondText={'Sign Up'}
                    onPress={() => navigation.navigate('RegisterScreen')}
                  />
                </View>

              </Card>

            </View>
          </KeyboardAwareScrollView>
        </>
      )

      }
    </Formik>
  );
};

export default LoginScreen;
