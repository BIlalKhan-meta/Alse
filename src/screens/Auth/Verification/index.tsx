import { useState } from 'react';
import {
  View,
} from 'react-native';
import styles from './styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import { Formik } from 'formik';
import BackToLogin from '../../../components/BackToLogin';
import InterBoldAverage from '../../../components/Text/InterBoldAverage';
import InterRegularMedium from '../../../components/Text/InterRegularMedium';
import CustomButton from '../../../components/CustomButton';
import InterBold from '../../../components/Text/InterBold';
import InterRegular from '../../../components/Text/InterRegular';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../../utils/theme';
import ResendCode from '../../../components/ResendCode';
import * as yup from 'yup';
import Card from '../../../components/Card';
import { verifyOtp, forgotPassword } from '../../../store/slices/authSlice';
import { useAppDispatch } from '../../../hooks/storeHooks';

import { getMessage, Toast } from '../../../utils/helpers';


const Verification: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute()
  const email = route?.params?.email || "";

  const [submitted, setSubmitted] = useState<boolean>(false)

  interface FormValues {
    code: string
  }

  const initialValues = {
    code: ''
  };

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    code: yup
      .string()
      .min(6, 'Verification code must be at least 6 characters')
      .required('Verification code is required'),
  });

  const handleSubmit = (values: object, { resetForm }: { resetForm: () => void }) => {
    console.log("SUBMITTED")
    const apiData = {
      email: email,
      code: values.code
    }
    dispatch(verifyOtp(apiData))
      .then((res) => {
        console.log('response from Signup ====>', res);
        if (res?.payload?.status == true) {
          // Optionally navigate or show success message
          navigation.navigate("RecoverPassword", { email })
          // resetForm()
          setSubmitted(false)
        }
      })
      .catch((error) => {
        console.error("Signup error:", error);
      });
  }

  const handleResend = async () => {
    setSubmitted(true);
    const apiData = {
      email: email

    }
    await dispatch(forgotPassword(apiData))
      .unwrap()
      .then(res => {
        setSubmitted(false);
        console.log('res ==>', res);
        Toast.success(getMessage(res?.message));
        // navigation.navigate('RecoverPassword', {data: values});
      })
      .catch(err => {
        setSubmitted(false);
        Toast.error(getMessage(err?.message));
      });
  };
  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({ handleSubmit, handleChange, handleBlur, values, errors, resetForm }) => (
          <>
            <KeyboardAwareScrollView
              style={styles.scrollview}>

              <View style={styles.container}>
                <Card style={styles.cardStyle}>

                  <InterBold style={styles.heading}>Forgot Password</InterBold>
                  <InterRegular style={styles.adddetailsheading}>An email has been sent to you with a verification code. Please enter it here.</InterRegular>

                  <RegularTextInput
                    label="Verification Code"
                    placeholder='Enter verification code'
                    placeholderTextColor={colors.inputText}
                    onChangeText={handleChange('code')}
                    onBlur={handleBlur('code')}
                    value={values.code}
                    submitted={submitted}
                    errors={errors.code}
                    maxLength={6}
                  />

                  <ResendCode
                    onPress={handleResend}
                  />

                  <CustomButton style={styles.continuebutton}
                    onPress={() => {
                      setSubmitted(true)
                      handleSubmit()
                    }}
                    loading={submitted}
                  >
                    Continue
                  </CustomButton>

                  <BackToLogin
                    onPress={() => navigation.navigate("Login")} />
                </Card>
              </View>
            </KeyboardAwareScrollView>
          </>
        )

        }
      </Formik>

    </>
  );
};

export default Verification;