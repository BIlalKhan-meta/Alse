import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

import SignupButton from '../../components/SignupButton';

import { useLayoutEffect, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import GeneralModal from '../../components/GeneralModal';
import ProfileModal from '../../components/ProfileModal';
import { images } from '../../utils/images';
import HeaderComponent from '../../components/HeaderComponent';
import { useNavigation } from '@react-navigation/native';
import PhoneNumberInput from '../../components/TextInput/PhoneNumberInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PhoneNumberInput2 from '../../components/TextInput/PhoneNumberInput2';
import QanelasMedium from '../../components/Text/QanelasMedium';

const MyProfileUpdate: React.FC = () => {
  const navigation = useNavigation()
  const [profileDetails, setProfileDetails] = useState<boolean>(true);
  const [profileUpdate, setProfileUpdate] = useState<boolean>(true);
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitted2, setSubmitted2] = useState<boolean>(false);
  const [secureCurrentPassword, setSecureCurrentPassword] = useState<boolean>(true);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [secureCPassword, setSecureCPassword] = useState<boolean>(true);
  const [profileUpdateModal, setProfileUpdateModal] = useState<boolean>(false);
  const [changePasswordModal, setChangePasswordModal] = useState<boolean>(false);
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
    firstname: string;
    lastname: string;
    contactNo: string

  }



  const initialValues = {
    firstname: '',
    lastname: '',
    contactNo: ''

  };


  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    firstname: yup.string().required('First Name is required'),
    lastname: yup.string().required('Last Name is required'),
    contactNo: yup.string().required('Contact Number is required'),
  });



  const handleSubmit = (
    values: object,
    { resetForm }: { resetForm: () => void },
  ) => {
    setProfileUpdateModal(true)
    // navigation.navigate("Login")
  };



  return (
    <View >

      <Formik
        initialValues={
          initialValues

        }

        validationSchema={
          validationSchema

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
            <KeyboardAwareScrollView style={styles.scrollview}>
              <View style={styles.container}>

                <View style={styles.imagecontainer}>
                  <Image source={images.userc} style={styles.imageStyle} />
                </View>

                <View>
                  <RegularTextInput
                    label="First Name *"
                    placeholder="Enter First Name"
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('firstname')}
                    onBlur={handleBlur('firstname')}
                    value={values.firstname}
                    submitted={submitted}
                    errors={errors.firstname}
                  // style={{alignSelf:'center'}}
                  />

                  <RegularTextInput
                    label="Last Name *"
                    placeholder="Enter Last Name"
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('lastname')}
                    onBlur={handleBlur('lastname')}
                    value={values.lastname}
                    submitted={submitted}
                    errors={errors.lastname}
                  />

                  <PhoneNumberInput2
                    initialNumber={values.contactNo}
                    onNumberChange={handleChange('contactNo')}
                    label="Phone Number *"
                    style={styles.phoneContainer}
                    submitted={submitted}
                    errors={errors.contactNo}
                    labelStyle={styles.txt}
                  />

                  <View style={styles.txtConatiner}>
                    <QanelasMedium style={styles.txt}>Email</QanelasMedium>
                    <QanelasMedium style={styles.phoneTxt}>Test@2020</QanelasMedium>
                  </View>

                  <SignupButton
                    style={{ alignSelf: "center" }}
                    onPress={() => {
                      setProfileUpdateModal(true)
                      setSubmitted(true);
                      resetForm()
                      handleSubmit();
                    }}
                  >
                    Update
                  </SignupButton>
                </View>





              </View>
            </KeyboardAwareScrollView>

            <GeneralModal
              visible={profileUpdateModal}
              closeModal={() => setProfileUpdateModal(false)}
              icon={images.doubleCheck}
              title='Successfully'
              message='Profile Updated Successfully'
              buttonText='Ok'
              onPress={() => {
                setProfileUpdateModal(false)
                setProfileDetails(true)
                navigation.navigate("Home")
                // navigation.navigate("MyProfile")
                console.log("THIS IS profile Update", profileUpdate);
                console.log("THIS IS profile Details", profileDetails);
              }} />

            <ProfileModal
              visible={imageModal}
              closeModal={() => setImageModal(false)}
              // icon={CheckedIcon}
              title='Successfully'
              message='Your password has been changed successfully'
              buttonText='Okay'
              onPress={() => {
                setImageModal(false)
                setProfileDetails(true)
                console.log("THIS IS profile Update", profileUpdate);
                console.log("THIS IS profile Details", profileDetails);
              }} />
          </>
        )}
      </Formik>







    </View>
  );
};

export default MyProfileUpdate;
