import React, {useState} from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GeneralModal from '../../components/GeneralModal';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import {useNavigation} from '@react-navigation/native';
import {images} from '../../utils/images';
import styles from './styles';
import {colors} from '../../utils/theme';
import CustomButton from '../../components/CustomButton';
import Card from '../../components/Card';
import {changePassword} from '../../api/profile';
import Toast from 'react-native-toast-message';

interface FormValues {
  currentPassword: string;
  password: string;
  cpassword: string;
}

const initialValues: FormValues = {
  currentPassword: '',
  password: '',
  cpassword: '',
};

const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
  currentPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Current Password is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  cpassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const MyProfilePassword: React.FC = () => {
  const navigation = useNavigation();

  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [secureNewPassword, setSecureNewPassword] = useState<boolean>(true);
  const [secureconfirmPassword, setSecureconfirmPassword] =
    useState<boolean>(true);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (
    values: object,
    {resetForm}: {resetForm: () => void},
  ) => {
    console.log(values, 'Valuessss====>>>');
    const data = {
      old_password: values?.currentPassword,
      new_password: values?.password,
      confirm_password: values?.cpassword,
    };

    let formData = new FormData();

    Object.entries(data).forEach(item => {
      formData.append(item[0], item[1]);
    });
    console.log('formData===>', formData);

    setSubmitted(true);

    await changePassword(formData)
      // .unwrap()
      .then(res => {
        if (res?.data?.status) {
          setSubmitted(false);
          console.log('response form updated Profile==========>', res);
          setChangePasswordModal(true);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: res?.data?.message,
          });
        }
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err?.message,
        });
        // console.log('error from Updated Profile =========>', err);
      })
      .finally(() => {
        setSubmitted(false);
      });
    try {
    } catch (err) {
      console.log('error  ======>', err);
      // navigation.navigate("Login")
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}>
      {({handleSubmit, handleChange, handleBlur, values, errors}) => (
        <>
          <KeyboardAwareScrollView style={styles.scrollview}>
            <Card style={styles.container}>
              <RegularTextInput
                label="Current Password *"
                placeholder="Current Password"
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
                value={values.currentPassword}
                errors={errors.currentPassword}
                secureTextEntry={securePassword}
                submitted={submitted}
                onPressCurrentPassword={() => {
                  setSecurePassword(!securePassword);
                }}
                eyeColor={colors.black}
              />

              <RegularTextInput
                label="New Password *"
                placeholder="New Password"
                onChangeText={handleChange('password')}
                placeholderTextColor={colors.inputText}
                onBlur={handleBlur('password')}
                value={values.password}
                errors={errors.password}
                secureTextEntry={secureNewPassword}
                onPressCurrentPassword={() => {
                  setSecureNewPassword(!secureNewPassword);
                }}
                eyeColor={colors.black}
                submitted={submitted}
              />
              <RegularTextInput
                label="Confirm Password *"
                placeholder="Confirm Password"
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('cpassword')}
                onBlur={handleBlur('cpassword')}
                value={values.cpassword}
                errors={errors.cpassword}
                secureTextEntry={secureconfirmPassword} // Toggle as needed
                onPressCurrentPassword={() => {
                  setSecureconfirmPassword(!secureconfirmPassword);
                }}
                eyeColor={colors.black}
                submitted={submitted}
              />

              <CustomButton
                onPress={handleSubmit}
                style={styles.btnStyle}
                loading={submitted}>
                Update
              </CustomButton>
            </Card>
          </KeyboardAwareScrollView>
          <GeneralModal
            visible={changePasswordModal}
            closeModal={() => setChangePasswordModal(false)}
            icon={images.checkedIcon} // Adjust as per your assets
            title="Successfully"
            message="Your password has been updated successfully"
            buttonText="Ok"
            onPress={() => {
              setChangePasswordModal(false);
              // setProfileDetails(true)
              // navigation.navigate("MyProfile")
              navigation.navigate('Home');
            }}
            primaryBtn={true}
          />

          {/* <ProfileModal
            visible={imageModal}
            closeModal={() => setImageModal(false)}
            // icon={CheckedIcon}
            title='Successfully'
            message='Your password has been changed successfully'
            buttonText='Okay'
            onPress={() => {
              setImageModal(false)

            }} /> */}
        </>
      )}
    </Formik>
  );
};

export default MyProfilePassword;
