import {useState} from 'react';
import {View} from 'react-native';

import * as yup from 'yup';
import styles from './styles';
import InterBold from '../../../components/Text/InterBold';
import InterRegular from '../../../components/Text/InterRegular';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import {Formik} from 'formik';

import GeneralModal from '../../../components/GeneralModal';
// import CheckedIcon from '../../../assets/icons/checkedIcon.png'
import InterBoldAverage from '../../../components/Text/InterBoldAverage';
import InterRegularMedium from '../../../components/Text/InterRegularMedium';
import BackToLogin from '../../../components/BackToLogin';
import CustomButton from '../../../components/CustomButton';
import {images} from '../../../utils/images';
import {colors} from '../../../utils/theme';
import Card from '../../../components/Card';
import {useAppDispatch} from '../../../hooks/storeHooks';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getMessage, Toast} from '../../../utils/helpers';
import InterBoldLabel from '../../../components/Text/InterBoldLabel';
import {resetPassword} from '../../../api/auth';

const RecoverPassword: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route?.params?.email || '';

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [secureCPassword, setSecureCPassword] = useState<boolean>(true);
  const [passwordRecovered, setPasswordRecovered] = useState<boolean>(false);

  interface FormValues {
    password: string;
    cpassword: string;
  }

  const initialValues = {
    password: '',
    cpassword: '',
  };

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    cpassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const handleSubmit = (values: FormValues) => {
    setLoading(true);
    const apiData = {
      email: email,
      password: values?.password,
      confirmPassword: values?.cpassword,
    };
    resetPassword(apiData)
      .then(res => {
        if (res?.data) {
          setPasswordRecovered(true);
          setSubmitted(false);
        }
      })
      .catch(error => {
        Toast.success(getMessage(error?.message));
        setSubmitted(false);
      })
      .finally(() => {
        setLoading(false);
      });

    // setPasswordRecovered(true)
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
            <KeyboardAwareScrollView
              style={styles.scrollview}
              enableOnAndroid={true}
              extraScrollHeight={20}
              enableAutomaticScroll={true}
              keyboardShouldPersistTaps="handled">
              <View style={styles.container}>
                <Card style={styles.cardStyle}>
                  <InterBoldLabel style={styles.heading}>
                    Forgot Password
                  </InterBoldLabel>
                  <InterRegular style={styles.adddetailsheading}>
                    Type in a new password
                  </InterRegular>

                  <RegularTextInput
                    label="New Password"
                    placeholder="Enter New Password"
                    placeholderTextColor={colors.inputText}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    submitted={submitted}
                    errors={errors.password}
                    secureTextEntry={securePassword}
                    onPressCurrentPassword={() =>
                      setSecurePassword(!securePassword)
                    }
                  />

                  <RegularTextInput
                    label="Confirm New Password"
                    placeholder="Confirm New Password"
                    placeholderTextColor={colors.inputText}
                    onChangeText={handleChange('cpassword')}
                    onBlur={handleBlur('cpassword')}
                    value={values.cpassword}
                    submitted={submitted}
                    errors={errors.cpassword}
                    secureTextEntry={secureCPassword}
                    onPressCurrentPassword={() =>
                      setSecureCPassword(!secureCPassword)
                    }
                  />

                  <CustomButton
                    onPress={() => {
                      setSubmitted(true);
                      handleSubmit();
                    }}
                    loading={loading}>
                    Update
                  </CustomButton>

                  <BackToLogin onPress={() => navigation.navigate('Login')} />
                </Card>
              </View>
            </KeyboardAwareScrollView>
          </>
        )}
      </Formik>

      <GeneralModal
        visible={passwordRecovered}
        closeModal={() => setPasswordRecovered(false)}
        icon={images.checkedIcon}
        title="Password Updated"
        message="Your password has been updated successfully!"
        buttonText="Ok"
        onPress={() => navigation.navigate('Login')}
        primaryBtn={true}
      />
    </>
  );
};

export default RecoverPassword;
