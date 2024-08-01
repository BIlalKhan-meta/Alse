import React, { useLayoutEffect, useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import GeneralModal from '../../components/GeneralModal';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import SignupButton from '../../components/SignupButton';
import HeaderComponent from '../../components/HeaderComponent';
import { useNavigation } from '@react-navigation/native';
import { images } from '../../utils/images';
import styles from './styles';
import ProfileModal from '../../components/ProfileModal';
import { colors } from '../../utils/theme';

const MyProfilePassword: React.FC = () => {
  const navigation = useNavigation();

  const [changePasswordModal, setChangePasswordModal] = useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true)
  const [secureNewPassword, setSecureNewPassword] = useState<boolean>(true)
  const [secureconfirmPassword, setSecureconfirmPassword] = useState<boolean>(true)
  const [imageModal, setImageModal] = useState<boolean>(false);


  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <View style={{}}>

  //         <TouchableOpacity onPress={() => {
  //           setImageModal(true)

  //         }}>
  //           <Image
  //             source={images.setting}
  //             style={styles.threeDots}
  //           />


  //         </TouchableOpacity>


  //       </View>
  //     ),
  //   });
  // }, [navigation]);
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

  const handleSubmit = (values: FormValues, { resetForm }: { resetForm: () => void }) => {
    console.log('PASSWORD CHANGED SUCCESSFULLY');
    setChangePasswordModal(true);
    // Additional actions after successful password change
    // resetForm(); // Uncomment if you want to reset form fields after submission
  };

  return (

    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, handleChange, handleBlur, values, errors }) => (
        <>
          <KeyboardAwareScrollView >
            <View style={styles.container}>
              <RegularTextInput
                label="Current Password *"
                placeholder="Current Password"
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
                value={values.currentPassword}
                submitted={true} // You can use a state to manage this
                errors={errors.currentPassword}
                secureTextEntry={securePassword} // Toggle as needed

                onPressCurrentPassword={() => { setSecurePassword(!securePassword) }}
                eyeColor={colors.black}

              />
              <RegularTextInput
                label="New Password *"
                placeholder="New Password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                submitted={true} // You can use a state to manage this
                errors={errors.password}
                secureTextEntry={secureNewPassword} // Toggle as needed
                onPressPassword={() => { setSecureNewPassword(!secureNewPassword) }}
                eyeColor={colors.black}

              />
              <RegularTextInput
                label="Confirm Password *"
                placeholder="Confirm Password"
                onChangeText={handleChange('cpassword')}
                onBlur={handleBlur('cpassword')}
                value={values.cpassword}
                submitted={true} // You can use a state to manage this
                errors={errors.cpassword}
                secureTextEntry={secureconfirmPassword} // Toggle as needed
                onPressCPassword={() => { setSecureconfirmPassword(!secureconfirmPassword) }}
                eyeColor={colors.black}

              />





              <SignupButton onPress={handleSubmit} style={styles.btnStyle}>
                Update
              </SignupButton>
            </View>
          </KeyboardAwareScrollView>
          <GeneralModal
            visible={changePasswordModal}
            closeModal={() => setChangePasswordModal(false)}
            icon={images.doubleCheck} // Adjust as per your assets
            title="Successfully"
            message="Your password has been updated successfully"
            buttonText="Ok"
            onPress={() => {
              setChangePasswordModal(false)
              // setProfileDetails(true)
              // navigation.navigate("MyProfile")
              navigation.navigate("Home")
            }}
          />

          <ProfileModal
            visible={imageModal}
            closeModal={() => setImageModal(false)}
            // icon={CheckedIcon}
            title='Successfully'
            message='Your password has been changed successfully'
            buttonText='Okay'
            onPress={() => {
              setImageModal(false)

            }} />

        </>
      )}
    </Formik>




  );
};

export default MyProfilePassword;
