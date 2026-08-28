import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Image, SafeAreaView} from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import {Formik, FormikProps} from 'formik';
import {colors} from '../../../utils/theme';
import CustomButton from '../../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import RememberMeContainer from '../../../components/RememberMeContainer';
import {useAppDispatch} from '../../../hooks/storeHooks';
import {getDeviceIdsForAuth, syncFcmTokenWithBackend} from '../../../services/pushNotificationService';
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
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [googleSubmitted, setGoogleSubmitted] = useState<boolean>(false);
  const [appleSubmitted, setAppleSubmitted] = useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>('');
  const [fcmToken, setFcmToken] = useState<string | undefined>('');
  const [sessionReady, setSessionReady] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>({
    identifier: '',
    password: '',
  });

  const {t} = useTranslation();

  const retrieveUserSession = async () => {
    try {
      const session = await EncryptedStorage.getItem('user_session');
      if (session !== null) {
        const parsedSession = JSON.parse(session);
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
      const ids = await getDeviceIdsForAuth();
      setDeviceId(ids.deviceId);
      setFcmToken(ids.fcmToken || '');
    } catch (error) {
      console.log('Error getting FCM token:', error);
      setFcmToken('');
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await retrieveUserSession();
      if (!cancelled) {
        setSessionReady(true);
      }
    })();
    getToken();
    return () => {
      cancelled = true;
    };
  }, []);

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    identifier: yup.string().required('Email or Phone Number is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const syncFieldFromNative = (
    field: keyof FormValues,
    nativeText: string | undefined,
  ) => {
    const formik = formikRef.current;
    if (!formik || nativeText == null) {
      return;
    }
    if (formik.values[field] !== nativeText) {
      formik.setFieldValue(field, nativeText, false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (submitted) {
      return;
    }

    console.log('Login Form Values:', values);
    setSubmitted(true);

    let authDeviceId = deviceId;
    let authFcmToken = fcmToken;
    if (!authDeviceId || !authFcmToken) {
      const ids = await getDeviceIdsForAuth();
      authDeviceId = ids.deviceId;
      authFcmToken = ids.fcmToken;
    }

    const apiData = {
      identifier: values.identifier.trim(),
      password: values.password,
      deviceId: authDeviceId,
      fcmToken: authFcmToken,
    };

    console.log('Login API Data:', apiData);

    login(apiData)
      .then(res => {
        const resData = res?.data;
        const payload = resData?.data ?? resData;
        const user = payload?.user ?? resData?.user;
        const token =
          payload?.access_token ??
          payload?.token ??
          resData?.access_token ??
          resData?.token;
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
          syncFcmTokenWithBackend().catch(() => {});
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

  const onGoogleLoginSuccess = async (idToken: string) => {
    if (googleSubmitted) {
      return;
    }

    setGoogleSubmitted(true);

    const ids = await getDeviceIdsForAuth();
    const apiData = {
      token: idToken,
      deviceId: ids.deviceId,
      fcmToken: ids.fcmToken,
    };

    googleLogin(apiData)
      .then(res => {
        if (res?.data?.status) {
          dispatch(setUser(res?.data?.data));
          syncFcmTokenWithBackend().catch(() => {});
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
        setGoogleSubmitted(false);
      });
  };

  const onAppleLoginSuccess = async (user: any) => {
    if (appleSubmitted) {
      return;
    }

    setAppleSubmitted(true);

    const {
      email,
      fullName,
      givenName,
      familyName,
      isAppleLogin,
      apple_id,
      identityToken,
      authorizationCode,
    } = user;
    const ids = await getDeviceIdsForAuth();

    const apiData = {
      email,
      fullName,
      givenName,
      familyName,
      isAppleLogin,
      apple_id,
      identityToken,
      authorizationCode,
      deviceId: ids.deviceId,
      fcmToken: ids.fcmToken,
    };

    appleLogin(apiData)
      .then(res => {
        const resData = res?.data;
        const payload = resData?.data ?? resData;
        const authUser = payload?.user ?? resData?.user;
        const token =
          payload?.access_token ??
          payload?.token ??
          resData?.access_token ??
          resData?.token;
        const isSuccess =
          resData?.success === true ||
          resData?.status === true ||
          (authUser && token);

        if (isSuccess && authUser && token) {
          dispatch(setUser({user: authUser, access_token: token}));
          syncFcmTokenWithBackend().catch(() => {});
        } else {
          Toast.show({
            type: 'error',
            text1: t('error'),
            text2: resData?.message || 'Apple Sign In failed.',
          });
        }
      })
      .catch(err => {
        const errData = err?.response?.data ?? err;
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: errData?.message || err?.message || 'Apple Sign In failed.',
        });
      })
      .finally(() => {
        setAppleSubmitted(false);
      });
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      {!sessionReady ? null : (
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema}
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
                  testID="login-email"
                  placeholder={t('Enter Email')}
                  placeholderTextColor={colors.darkGray}
                  onChangeText={handleChange('identifier')}
                  onBlur={handleBlur('identifier')}
                  onEndEditing={e =>
                    syncFieldFromNative('identifier', e.nativeEvent.text)
                  }
                  value={values.identifier}
                  submitted={submitted}
                  errors={errors.identifier}
                  style={styles.input}
                  textContentType="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <RegularTextInput
                  testID="login-password"
                  placeholder={t('password')}
                  placeholderTextColor={colors.darkGray}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  onEndEditing={e =>
                    syncFieldFromNative('password', e.nativeEvent.text)
                  }
                  value={values.password}
                  submitted={submitted}
                  errors={errors.password}
                  secureTextEntry={securePassword}
                  onPressCurrentPassword={() =>
                    setSecurePassword(!securePassword)
                  }
                  style={styles.input}
                  textContentType="password"
                  autoComplete="password"
                />

                <RememberMeContainer
                  isSelected={isSelected}
                  setIsSelected={setIsSelected}
                  onPress={() => navigation.navigate('ForgotPassword')}
                />

                <CustomButton
                  testID="login-submit"
                  style={styles.loginBtn}
                  onPress={() => {
                    // Sync autofill that may not have fired onChangeText
                    formikSubmit();
                  }}
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
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;
