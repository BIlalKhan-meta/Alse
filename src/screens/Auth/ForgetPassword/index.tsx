import {useState} from 'react';
import {View} from 'react-native';

import * as yup from 'yup';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import {Formik} from 'formik';

import BackToLogin from '../../../components/BackToLogin';
import InterBoldAverage from '../../../components/Text/InterBoldAverage';
import InterRegularMedium from '../../../components/Text/InterRegularMedium';
import CustomButton from '../../../components/CustomButton';
import InterBold from '../../../components/Text/InterBold';
import InterRegular from '../../../components/Text/InterRegular';
import {colors} from '../../../utils/theme';
import Card from '../../../components/Card';
import {useAppDispatch} from '../../../hooks/storeHooks';
import {getMessage, Toast} from '../../../utils/helpers';
import {forgotPassword} from '../../../api/auth';
import InterBoldLabel from '../../../components/Text/InterBoldLabel';
interface FormValues {
  email: string;
}

const initialValues = {
  email: '',
};

const ForgetPassword: React.FC = ({navigation}) => {
  const [submitted, setSubmitted] = useState<boolean>(false);

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    email: yup
      .string()
      .email('Email is wrong !! TRY AGAIN')
      .required('Email is required'),
  });

  const handleSubmit = (values: FormValues) => {
    const apiData = {
      email: values?.email,
    };
    forgotPassword(apiData)
      .then(res => {
        if (res?.data) {
          navigation.navigate('Verification', {email: values?.email});
          setSubmitted(false);
        }
      })
      .catch(error => {
        Toast.success(getMessage(error?.message));
        setSubmitted(false);
      });
  };

  return (
    <>
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
          resetForm,
        }) => (
          <>
            <KeyboardAwareScrollView style={styles.scrollview}>
              <View style={styles.container}>
                <Card style={styles.cardStyle}>
                  <InterBoldLabel style={styles.heading}>
                    Forgot Password
                  </InterBoldLabel>
                  <InterRegular style={styles.adddetailsheading}>
                    Enter your email address to receive a verification code
                  </InterRegular>

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

                  <CustomButton
                    style={styles.continuebutton}
                    onPress={() => {
                      setSubmitted(true);
                      handleSubmit();
                    }}
                    loading={submitted}>
                    Continue
                  </CustomButton>

                  <BackToLogin onPress={() => navigation.navigate('Login')} />
                </Card>
              </View>
            </KeyboardAwareScrollView>
          </>
        )}
      </Formik>
    </>
  );
};

export default ForgetPassword;
