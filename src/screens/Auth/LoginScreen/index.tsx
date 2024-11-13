import {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import InterBold from '../../../components/Text/InterBold';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import {Formik} from 'formik';
import {colors} from '../../../utils/theme';
import CustomButton from '../../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import RememberMeContainer from '../../../components/RememberMeContainer';
import Card from '../../../components/Card';
import SignupLastBottomText from '../../../components/SignupLastBottomText';
import {useAppDispatch} from '../../../hooks/storeHooks';
import {getFcmToken} from '../../../utils/messaging.utils';
import InterBoldLabel from '../../../components/Text/InterBoldLabel';
import {login} from '../../../api/auth';
import Toast from 'react-native-toast-message';
import {setUser} from '../../../store/slices/authSlice';

interface FormValues {
  email: string;
  password: string;
}

const initialValues = {
  email: __DEV__ ? 'tony@mailinator.com' : '',
  password: __DEV__ ? '12345678' : '',
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string | undefined>('');

  const getToken = async () => {
    const token = await getFcmToken();
    console.log("Token ========<",token);
    
    setDeviceToken(token);
  };

  useEffect(() => {
    getToken();
  }, []);

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    email: yup.string().email('Invalid Email').required('Email is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleSubmit = async (values: FormValues) => {
    console.log(values, 'Valuessssssss');
    setSubmitted(true);

    const apiData = {
      email: values.email,
      password: values.password,
      token: deviceToken,
    };

    //   login(apiData).then((res)=>{
    //     if(res?.data){

    //       navigation.navigate('Home');
    //       setSubmitted(false);
    //     }).catch ((error) {
    //   console.error('Login error:', error);
    //   setSubmitted(false);
    //   Toast.error(getMessage(error?.message));
    // })

    login(apiData)
      .then(res => {
        if (res?.data) {
          dispatch(setUser(res?.data?.data));
          // navigation.navigate('TabNavigation');
        }
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text1: 'Invalid',
          text2: err?.message,
        });
      })
      .finally(() => {
        setSubmitted(false);
      });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}>
      {({handleSubmit, handleChange, handleBlur, values, errors}) => (
        <>
          <KeyboardAwareScrollView
            style={styles.scrollview}
            showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
              <Card style={styles.cardStyle}>
                <InterBoldLabel style={styles.heading}>Login</InterBoldLabel>

                <RegularTextInput
                  label="Email Address"
                  placeholder="Enter Email Address"
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  submitted={submitted}
                  errors={errors.email}
                />

                <RegularTextInput
                  label="Password"
                  placeholder="Enter Password"
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  submitted={submitted}
                  errors={errors.password}
                  secureTextEntry={securePassword}
                  onPressPassword={() => setSecurePassword(!securePassword)}
                />

                <RememberMeContainer
                  isSelected={isSelected}
                  setIsSelected={setIsSelected}
                  onPress={() => navigation.navigate('ForgotPassword')}
                />

                <CustomButton
                  // onPress={() => {
                  //   setSubmitted(true)
                  //   resetForm()
                  //   handleSubmit()
                  // }}
                  onPress={handleSubmit}
                  loading={submitted}>
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
      )}
    </Formik>
  );
};

export default LoginScreen;
