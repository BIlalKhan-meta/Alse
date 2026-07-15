import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, SafeAreaView} from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import {Formik} from 'formik';
import {colors} from '../../../utils/theme';
import CustomButton from '../../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import InterBoldLabel from '../../../components/Text/InterBoldLabel';
import PoppinsLabel from '../../../components/Text/Poppins';
import {appleLogin, googleLogin, signup} from '../../../api/auth';
import Toast from 'react-native-toast-message';
import Checkbox from 'expo-checkbox';
import GoogleLogin from '../../../components/GoogleAuth/Login';
import AppleAuth from '../../../components/AppleAuth';
import {useTranslation} from 'react-i18next';
import {getFcmToken} from '../../../services/pushNotificationService';
interface FormValues {
  name: string;
  identifier: string;
  password: string;
  agree: boolean;
}

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const {t} = useTranslation();

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isGoogleSubmitted, setIsGoogleSubmitted] = useState<boolean>(false);
  const [isAppleSubmitted, setIsAppleSubmitted] = useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [initialValues] = useState<FormValues>({
    name: '',
    identifier: '',
    password: '',
    agree: false,
  });

  const validationSchema = yup.object().shape({
    // Either email or phone number is required
    identifier: yup.string().required('Email/Phone Number is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    name: yup.string().required('Name is required'),
    agree: yup
      .boolean()
      .oneOf(
        [true],
        'You must agree to the terms and conditions and Privacy Policy',
      ),
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      if (submitted) {
        return;
      }

      setSubmitted(true);

      const apiData = {
        full_name: values.name,
        identifier: values.identifier,
        password: values.password,
        agree: values.agree,
      };

      if (!values.agree) {
        Toast.show({
          type: 'error',
          text1: 'Terms & Conditions',
          text2: 'Please agree to the terms and conditions and Privacy Policy',
        });
        setSubmitted(false);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Basic phone validation (assumes minimum 7 digits)
      const phoneRegex = /^\d{7,}$/;

      if (
        !emailRegex.test(values.identifier) &&
        !phoneRegex.test(values.identifier)
      ) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Input',
          text2: 'Please enter a valid email or phone number',
        });
        setSubmitted(false);
        return;
      }

      const res = await signup(apiData);

      if (res?.data?.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your account has been created successfully',
        });
        // navigation.navigate('Onboarding');
        navigation.navigate('Onboarding', {user: res?.data?.data});
      } else {
        // Handle known error responses
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2:
            res?.data?.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error: any) {
      console.log('error ===>', error, error?.response?.data);
      // Handle unexpected errors
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setSubmitted(false);
    }
  };

  const onGoogleLoginSuccess = async (idToken: string) => {
    if (isGoogleSubmitted) {
      return;
    }

    setIsGoogleSubmitted(true);

    const deviceToken = await getFcmToken();
    const apiData = {token: idToken, deviceToken};

    googleLogin(apiData)
      .then(res => {
        if (res?.data?.status) {
          navigation.navigate('Onboarding', {
            user: res?.data?.data,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: t('error'),
            text2: res?.data?.message || t('toast.failedGoogleAuth'),
          });
        }
      })
      .catch(err => {
        const errorMessage =
          err?.message || err?.data?.message || t('toast.failedGoogleAuth');
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: errorMessage,
        });
      })
      .finally(() => {
        setIsGoogleSubmitted(false);
      });
  };

  const onAppleLoginSuccess = async (user: any) => {
    if (isAppleSubmitted) {
      return;
    }

    setIsAppleSubmitted(true);

    const {email, fullName, isAppleLogin, apple_id} = user;

    const apiData = {
      email,
      fullName,
      isAppleLogin,
      apple_id,
      deviceToken: await getFcmToken(),
    };

    appleLogin(apiData)
      .then(res => {
        console.log(res.data, 'Res');

        navigation.navigate('Onboarding', {
          user: res?.data?.data,
        });
      })
      .catch(err => {
        console.log(err, 'Err');
        setIsAppleSubmitted(false);
      })
      .finally(() => {
        setIsAppleSubmitted(false);
      });
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}>
        {({
          handleSubmit: formikHandleSubmit,
          handleChange,
          handleBlur,
          values,
          errors,
          setFieldValue,
        }) => (
          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              extraScrollHeight={20}
              enableAutomaticScroll={true}
              keyboardShouldPersistTaps="handled">
              <View style={styles.container}>
                <View style={styles.imageContainer}>
                  <Image
                    source={require('./images/Wave.png')}
                    style={styles.loginImage}
                  />
                </View>

                <InterBoldLabel style={styles.heading}>
                  {t('signUp.title')}
                </InterBoldLabel>
                <PoppinsLabel style={styles.subHeading}>
                  {t('signUp.subTitle')}
                </PoppinsLabel>
                <GoogleLogin
                  onSuccess={onGoogleLoginSuccess}
                  loading={isGoogleSubmitted}
                />
                <AppleAuth
                  onSuccess={onAppleLoginSuccess}
                  loading={isAppleSubmitted}
                />

                <View style={styles.lineContainer}>
                  <View style={styles.line} />
                  <View>
                    <Text style={styles.lineText}>{t('or')}</Text>
                  </View>
                  <View style={styles.line} />
                </View>

                <RegularTextInput
                  placeholder={t('name')}
                  placeholderTextColor={colors.darkGray}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                  submitted={submitted}
                  errors={errors.name}
                  style={styles.input}
                />

                <RegularTextInput
                  placeholder={t('emailOrPhone')}
                  placeholderTextColor={colors.darkGray}
                  onChangeText={handleChange('identifier')}
                  onBlur={handleBlur('identifier')}
                  value={values.identifier}
                  submitted={submitted}
                  errors={errors.identifier}
                  style={styles.input}
                />

                <RegularTextInput
                  placeholder={t('password')}
                  placeholderTextColor={colors.darkGray}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  submitted={submitted}
                  errors={errors.password}
                  secureTextEntry={securePassword}
                  onPressCurrentPassword={() =>
                    setSecurePassword(!securePassword)
                  }
                  style={styles.input}
                />

                <View style={styles.checkboxcontainer}>
                  <Checkbox
                    value={values.agree}
                    onValueChange={(value: boolean) => {
                      setFieldValue('agree', value);
                    }}
                  />
                  <Text style={styles.bottomText}>{t('signUp.policy')}</Text>
                </View>

                <CustomButton
                  // onPress={() => {
                  //   setSubmitted(true)
                  //   resetForm()
                  //   handleSubmit()
                  // }}
                  style={styles.loginBtn}
                  onPress={formikHandleSubmit}
                  loading={submitted}>
                  {t('signUp.createAccount')}
                </CustomButton>
              </View>
              <View style={styles.bottomContainer}>
                <TouchableOpacity
                  style={styles.bottomTextContainer}
                  onPress={() => navigation.navigate('Login' as never)}>
                  <Text style={styles.bottomText}>
                    {t('signUp.alreadyHaveAccount')}
                  </Text>
                  <Text style={styles.signUpText}>{t('signUp.signIn')}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default SignupScreen;
