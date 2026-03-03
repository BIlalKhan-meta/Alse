import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image, SafeAreaView} from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import {Formik} from 'formik';
import {colors} from '../../../utils/theme';
import CustomButton from '../../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import RememberMeContainer from '../../../components/RememberMeContainer';
import {useAppDispatch} from '../../../hooks/storeHooks';
import {getFcmToken} from '../../../utils/messaging.utils';
import InterBoldLabel from '../../../components/Text/InterBoldLabel';
import PoppinsLabel from '../../../components/Text/Poppins';
import {appleLogin, googleLogin, login} from '../../../api/auth';
import Toast from 'react-native-toast-message';
import {setUser} from '../../../store/slices/authSlice';
import EncryptedStorage from 'react-native-encrypted-storage';
import GoogleLogin from '../../../components/GoogleAuth/Login';
import AppleAuth from '../../../components/AppleAuth';
import {useTranslation} from 'react-i18next';
interface FormValues {
  identifier: string;
  password: string;
}
async function storeUserSession(identifier: string, password: string) {
  // console.log('email ===>', identifier, 'Password= ===>', password);
  await EncryptedStorage.setItem(
    'user_session',
    JSON.stringify({
      identifier,
      password,
    }),
  );
}

async function removeUserSession() {
  await EncryptedStorage.removeItem('user_session');
}

type AuthStackParamList = {
  ForgotPassword: undefined;
  RegisterScreen: undefined;
  Login: undefined;
  Verification: undefined;
  RecoverPassword: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [googleSubmitted, setGoogleSubmitted] = useState<boolean>(false);
  const [appleSubmitted, setAppleSubmitted] = useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string | undefined>('');
  const [initialValues, setInitialValues] = useState({
    identifier: __DEV__ ? 'kendricklazarus2@gmail.com' : '',
    password: __DEV__ ? 'Iphone@9876' : '',
  });

  const {t} = useTranslation();

  const retrieveUserSession = async () => {
    try {
      const session = await EncryptedStorage.getItem('user_session');
      if (session !== null) {
        const parsedSession = JSON.parse(session);
        console.log('parsedSession.email ===>', parsedSession?.password);
        setIsSelected(true);
        setInitialValues({
          identifier: parsedSession.identifier || '',
          password: parsedSession.password || '',
        });
      }
    } catch (err) {
      console.log('Session Error', err);
    }
  };

  const getToken = async () => {
    try {
      const token = await getFcmToken();
      console.log('FCM Token received:', token);
      setDeviceToken(token || 'no-token');
    } catch (error) {
      console.log('Error getting FCM token:', error);
      setDeviceToken('no-token');
    }
  };

  useEffect(() => {
    retrieveUserSession();
    getToken();
  }, []);

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    // Either email or phone number
    identifier: yup.string().required('Email or Phone Number is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleSubmit = async (values: FormValues) => {
    if (submitted) {
      return;
    }

    console.log('Login Form Values:', values);
    console.log('Device Token:', deviceToken);
    setSubmitted(true);

    const apiData = {
      identifier: values.identifier.trim(),
      password: values.password,
      token: deviceToken || '',
    };

    console.log('Login API Data:', apiData);

    login(apiData)
      .then(res => {
        const resData = res?.data;
        const payload = resData?.data ?? resData;
        const user = payload?.user ?? resData?.user;
        const token =
          payload?.access_token ?? payload?.token ?? resData?.access_token ?? resData?.token;
        const hasAuthData = user && token;
        const isSuccess =
          resData?.success === true ||
          resData?.status === true ||
          (res?.status === 200 && hasAuthData);

        if (isSuccess && hasAuthData) {
          if (isSelected) {
            storeUserSession(values?.identifier, values?.password);
          } else {
            removeUserSession();
          }
          dispatch(setUser({user, access_token: token}));
        } else {
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: resData?.message || 'Invalid credentials',
          });
        }
      })
      .catch(err => {
        const errData = err?.response?.data ?? err;
        const errorMessage =
          errData?.message || err?.message || 'Login failed. Please try again.';
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMessage,
        });
      })
      .finally(() => {
        setSubmitted(false);
      });
  };

  const onGoogleLoginSuccess = (idToken: string) => {
    if (googleSubmitted) {
      return;
    }

    setGoogleSubmitted(true);

    const apiData = {token: idToken};

    googleLogin(apiData)
      .then(res => {
        if (res?.data?.status) {
          dispatch(setUser(res?.data?.data));
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
          err?.message ||
          err?.data?.message ||
          t('toast.failedGoogleAuth');
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: errorMessage,
        });
      })
      .finally(() => {
        setGoogleSubmitted(false);
      });
  };

  const onAppleLoginSuccess = (user: any) => {
    if (appleSubmitted) {
      return;
    }

    setAppleSubmitted(true);

    const {email, fullName, isAppleLogin, apple_id} = user;

    const apiData = {
      email,
      fullName,
      isAppleLogin,
      apple_id,
    };

    appleLogin(apiData)
      .then(res => {
        console.log(res.data, 'Res');
        dispatch(setUser(res?.data?.data));
      })
      .catch(err => {
        console.log(err, 'Err');

        Toast.show({
          type: 'error',
          text1: 'Invalid',
          text2: err?.message,
        });
      })
      .finally(() => {
        setAppleSubmitted(false);
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
          handleSubmit: formikSubmit,
          handleChange,
          handleBlur,
          values,
          errors,
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
                    source={require('./images/loginHands.png')}
                    style={styles.loginImage}
                  />
                </View>

                <InterBoldLabel style={styles.heading}>
                  {t('signIn.title')}
                </InterBoldLabel>
                <PoppinsLabel style={styles.subHeading}>
                  {t('signIn.subTitle')}
                </PoppinsLabel>
                <GoogleLogin
                  onSuccess={onGoogleLoginSuccess}
                  loading={googleSubmitted}
                />
                <AppleAuth
                  onSuccess={onAppleLoginSuccess}
                  loading={appleSubmitted}
                />

                <View style={styles.lineContainer}>
                  <View style={styles.line} />
                  <View>
                    <Text style={styles.lineText}>{t('or')}</Text>
                  </View>
                  <View style={styles.line} />
                </View>

                <RegularTextInput
                  placeholder={t('email')}
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

                <RememberMeContainer
                  isSelected={isSelected}
                  setIsSelected={setIsSelected}
                  onPress={() => navigation.navigate('ForgotPassword')}
                />

                <CustomButton
                  style={styles.loginBtn}
                  onPress={formikSubmit}
                  loading={submitted}>
                  {t('signIn.login')}
                </CustomButton>
              </View>
              <View style={styles.bottomContainer}>
                <TouchableOpacity
                  style={styles.bottomTextContainer}
                  onPress={() => navigation.navigate('RegisterScreen')}>
                  <Text style={styles.bottomText}>{t('signIn.noAccount')}</Text>
                  <Text style={styles.signUpText}>{t('signIn.signUp')}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default LoginScreen;
