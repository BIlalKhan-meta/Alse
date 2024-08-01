import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

import { useLayoutEffect, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import GeneralModal from '../../components/GeneralModal';
// import CheckedIcon from '../../assets/icons/CheckedIcon.png'
import { colors } from '../../utils/theme';
// import ProfileModal from '../../components/ProfileModal';
import { images } from '../../utils/images';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import Card from '../../components/Card';

const MyProfile: React.FC = () => {
  const navigation = useNavigation()
  const [profileDetails, setProfileDetails] = useState<boolean>(true);
  const [profileUpdate, setProfileUpdate] = useState<boolean>(false);
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitted2, setSubmitted2] = useState<boolean>(false);
  const [secureCurrentPassword, setSecureCurrentPassword] = useState<boolean>(true);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [secureCPassword, setSecureCPassword] = useState<boolean>(true);
  const [profileUpdateModal, setProfileUpdateModal] = useState<boolean>(false);
  const [changePasswordModal, setChangePasswordModal] = useState<boolean>(false);
  const [imageModal, setImageModal] = useState<boolean>(false);

  interface FormValues {
    firstname: string;
    lastname: string;
  }

  interface FormValues2 {
    currentPassword: string;
    password: string;
    cpassword: string;
  }

  const initialValues = {
    firstname: 'Bella',
    lastname: 'Edward',
  };

  const confirmPasswordInitialValues = {
    currentPassword: '',
    password: '',
    cpassword: '',
  };

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    firstname: yup.string().required('First Name is required'),
    lastname: yup.string().required('Last Name is required'),
  });

  const confirmPasswordValidationSchema: yup.AnySchema<FormValues2> = yup.object().shape({
    currentPassword: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    cpassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const handleSubmit = (
    values: object,
    { resetForm }: { resetForm: () => void },
  ) => {
    if (profileUpdate) {
      setProfileUpdateModal(true)
      console.log('PROFILE DETAILS SUBMITTED SUCCESSFULLY');
      setProfileUpdate(false)
      resetForm();
    }
    else if (changePassword) {
      setChangePasswordModal(true)
      console.log('PASSWORD CHANGED SUCCESSFULLY');
      setChangePassword(false)
      resetForm();
    }
    // navigation.navigate("Login")
  };


  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor
      },
      headerRight: () => (
        <View style={{}}>

          <TouchableOpacity onPress={() => {
            // setModalVisible(!modalVisible) 
            setImageModal(true)
          }}>
            <Image
              source={images.dots}
              style={styles.threeDots}
            />


          </TouchableOpacity>


        </View>
      ),
    });
  }, [navigation]);


  return (
    <View>
      {/* <HeaderComponent
        style={styles.header}
        home={true} name='My Profile' onPress={navigation.toggleDrawer} onPressNotifications={() => navigation.navigate("Notifications")}
        notification={true}

      /> */}
      <Formik
        initialValues={
          profileUpdate
            ? initialValues
            : changePassword
              ? confirmPasswordInitialValues
              : {}
        }

        validationSchema={
          profileUpdate
            ? validationSchema
            : changePassword
              ? confirmPasswordValidationSchema
              : {}
        }
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
            {/* <KeyboardAwareScrollView style={styles.scrollview}> */}
            <View style={styles.container}>


              <Card style={styles.cardContainer}>

                <View style={styles.banner}>
                  <Image source={images.profileBg} style={styles.imageStyle} />

                </View>

                <View style={styles.imagecontainer}>
                  <Image source={images.user2} style={styles.imageStyle} />
                </View>

                <TouchableOpacity style={styles.btnConatiner2}
                  onPress={() => navigation.navigate("MyProfilePassword")}>
                  <InterMedium style={styles.editTxt}>Change Password</InterMedium>
                </TouchableOpacity>
                <InterMedium style={styles.username}>Ad Abc</InterMedium>
                <InterMedium style={styles.email}>Test@2020</InterMedium>

                <View style={styles.profileBtn}>
                  <InterRegular style={styles.profileTxt}>Private</InterRegular>
                </View>


                <View style={styles.contentContainer}>

                  <View style={styles.txtConatiner}>
                    <InterMedium style={styles.txt}>Phone Number</InterMedium>
                    <InterMedium style={styles.txt}>Age</InterMedium>

                  </View>

                  <View style={styles.txtConatiner}>
                    <InterMedium style={styles.phoneTxt}>123-456-7890</InterMedium>
                    <InterMedium style={styles.phoneTxt}>16</InterMedium>
                  </View>

                  <View style={styles.txtConatiner}>
                    <InterMedium style={styles.txt}>Birth Date</InterMedium>
                    <InterMedium style={styles.txt}>Gender</InterMedium>

                  </View>

                  <View style={styles.txtConatiner}>
                    <InterMedium style={styles.phoneTxt}>16/12/2024</InterMedium>
                    <InterMedium style={styles.phoneTxt}>Female</InterMedium>
                  </View>


                </View>





                <CustomButton style={styles.btnConatiner}
                  onPress={() => navigation.navigate("MyProfileUpdate")}>
                  EDIT PROFILE
                </CustomButton>

              </Card>





            </View>
            {/* </KeyboardAwareScrollView> */}
          </>
        )}
      </Formik>







    </View>
  );
};

export default MyProfile;
