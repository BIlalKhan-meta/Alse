import { useState } from 'react';
import {
  View
} from 'react-native';

import * as yup from 'yup';
import styles from './styles';
import InterBold from '../../../components/Text/InterBold';
import InterRegular from '../../../components/Text/InterRegular';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import { Formik } from 'formik';

import GeneralModal from '../../../components/GeneralModal';
// import CheckedIcon from '../../../assets/icons/checkedIcon.png'
import InterBoldAverage from '../../../components/Text/InterBoldAverage';
import InterRegularMedium from '../../../components/Text/InterRegularMedium';
import BackToLogin from '../../../components/BackToLogin';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../utils/images';
import { colors } from '../../../utils/theme';
import Card from '../../../components/Card';

const RecoverPassword: React.FC = ({ navigation }) => {

  const [submitted, setSubmitted] = useState<boolean>(false)
  const [securePassword, setSecurePassword] = useState<boolean>(true)
  const [secureCPassword, setSecureCPassword] = useState<boolean>(true)
  const [passwordRecovered, setPasswordRecovered] = useState<boolean>(false)

  interface FormValues {
    password: string,
    cpassword: string,
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
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });


  const handleSubmit = (values: object, { resetForm }: { resetForm: () => void }) => {
    console.log("PASSWORD CHANGED SUCCESSFULLY")
    setPasswordRecovered(true)
    // navigation.navigate("Login")
  }

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
                  <InterRegular style={styles.adddetailsheading}>Type in a new password</InterRegular>


                  <RegularTextInput
                    label="New Password"
                    placeholder='Enter New Password'
                    placeholderTextColor={colors.inputText}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    submitted={submitted}
                    errors={errors.password}
                    secureTextEntry={securePassword}
                    onPressPassword={() => setSecurePassword(!securePassword)} />

                  <RegularTextInput
                    label="Confirm New Password"
                    placeholder='Confirm New Password'
                    placeholderTextColor={colors.inputText}
                    onChangeText={handleChange('cpassword')}
                    onBlur={handleBlur('cpassword')}
                    value={values.cpassword}
                    submitted={submitted}
                    errors={errors.cpassword}
                    secureTextEntry={secureCPassword}
                    onPressCPassword={() => setSecureCPassword(!secureCPassword)} />

                  <CustomButton onPress={() => {
                    setSubmitted(true)
                    resetForm()
                    handleSubmit()
                    // setPasswordRecovered(true)
                  }}>
                    Update
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

      <GeneralModal
        visible={passwordRecovered}
        closeModal={() => setPasswordRecovered(false)}
        icon={images.checkedIcon}
        title='Password Updated'
        message='Your password has been updated successfully!'
        buttonText='Ok'
        onPress={() => navigation.navigate("Login")}
        primaryBtn={true}

      />


    </>
  );
};

export default RecoverPassword;
