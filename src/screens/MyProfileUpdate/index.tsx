import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from './styles';


import { useLayoutEffect, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import GeneralModal from '../../components/GeneralModal';
// import ProfileModal from '../../components/ProfileModal';
import { images } from '../../utils/images';
import HeaderComponent from '../../components/HeaderComponent';
import { useNavigation } from '@react-navigation/native';
import PhoneNumberInput from '../../components/TextInput/PhoneNumberInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PhoneNumberInput2 from '../../components/TextInput/PhoneNumberInput2';
import CustomButton from '../../components/CustomButton';
import InterMedium from '../../components/Text/InterMedium';
import Card from '../../components/Card';
import { colors } from '../../utils/theme';
import InterRegular from '../../components/Text/InterRegular';
import InterLight from '../../components/Text/InterLight';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import useImagePicker from '../../hooks/useImagePicker';

const MyProfileUpdate: React.FC = () => {
  const navigation = useNavigation()
  const { image, captureImage, chooseImageFromLibrary } = useImagePicker();

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
  const [openDate, setOpenDate] = useState<boolean>(false)
  const [date, setDate] = useState<Date>(new Date())
  const genders = [
    { name: '10 years', id: 1 },
    { name: '12 years', id: 2 },
  ];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor
      },
    });
  }, [navigation]);

  interface FormValues {
    username: string;
    contactNo: string
    email: string;
    age: string;
    birthdate: string;

  }



  const initialValues = {
    username: '',
    contactNo: '',
    email: '',
    age: '',
    birthdate: '',

  };


  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    username: yup.string().required('User Name is required'),
    contactNo: yup.string().required('Contact Number is required'),
    email: yup.string().required('Email is required'),
    age: yup.string().required('Age is required'),
    birthdate: yup.string().required('birthDate is required'),
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
                <Card style={styles.cardContainer}>

                  <View style={styles.banner}>
                    <Image source={images.profileBg} style={styles.imageStyle} />

                  </View>
                  <View style={styles.profileConatiner}>

                    <View style={styles.imagecontainer}>
                      <Image source={images.user2} style={styles.imageStyle} />
                    </View>

                    <TouchableOpacity style={styles.camBg}
                      onPress={() => captureImage('photo')}
                    >
                      <View style={styles.camcontainer}>
                        <Image source={images.camera} style={styles.imageStyle} />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <RegularTextInput
                      label="User Name *"
                      placeholder="Enter User Name"
                      placeholderTextColor="#9B9797"
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      value={values.username}
                      submitted={submitted}
                      errors={errors.username}
                      style={styles.inputstyle}
                      labelStyle={styles.txt}
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

                    {/* <RegularTextInput
                      label="Last Name *"
                      placeholder="Enter Last Name"
                      placeholderTextColor="#9B9797"
                      onChangeText={handleChange('lastname')}
                      onBlur={handleBlur('lastname')}
                      value={values.lastname}
                      submitted={submitted}
                      errors={errors.lastname}
                    /> */}

                    <View style={styles.txtConatiner}>
                      <InterMedium style={styles.txt}>Email</InterMedium>
                      <InterMedium style={styles.phoneTxt}>Test@2020</InterMedium>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View>
                        <InterRegular style={styles.label}>
                          Date of Birth
                        </InterRegular>

                        <TouchableOpacity onPress={() => setOpenDate(true)}>
                          <View style={[styles.textinputbox]}>
                            <InterLight style={{}}>{'mm/dd/yyyy'}</InterLight>
                            {/* <Image source={calendericon} style={styles.calendericon}/> */}
                          </View>
                        </TouchableOpacity>
                        <DatePicker
                          modal
                          mode="date"
                          open={openDate}
                          date={date}
                          onConfirm={(date) => {
                            setOpenDate(false)
                            setDate(date)
                          }}
                          onCancel={() => {
                            setOpenDate(false)
                          }}
                        />
                      </View>



                      <View>
                        <InterRegular style={styles.label}>
                          Age
                        </InterRegular>
                        <Picker
                          style={[styles.pickercontainer]}
                          dropdownIconColor={colors.inputText}
                          enabled={true}
                          mode='dialog'
                          placeholder={"Select Age"}
                          onValueChange={handleChange('age')}
                          selectedValue={values.age}
                        // data={genders}
                        >

                          <Picker.Item label={"Select Age"} value="" />

                          {genders.map((item) => (
                            <Picker.Item
                              label={item.name.toString()}
                              value={item.name.toString()}
                              key={item.id.toString()}
                            />
                          ))}

                        </Picker>
                      </View>

                    </View>

                    <CustomButton
                      style={{ alignSelf: "center" }}
                      onPress={() => {
                        setProfileUpdateModal(true)
                        setSubmitted(true);
                        resetForm()
                        handleSubmit();
                      }}
                    >
                      Update
                    </CustomButton>
                  </View>


                </Card>


              </View>
            </KeyboardAwareScrollView>

            <GeneralModal
              visible={profileUpdateModal}
              closeModal={() => setProfileUpdateModal(false)}
              icon={images.checkedIcon}
              title='Successfully'
              message='Profile Updated Successfully'
              buttonText='Ok'
              primaryBtn={true}
              onPress={() => {
                setProfileUpdateModal(false)
                setProfileDetails(true)
                navigation.navigate("Home")
                // navigation.navigate("MyProfile")
                console.log("THIS IS profile Update", profileUpdate);
                console.log("THIS IS profile Details", profileDetails);
              }} />

            {/* <ProfileModal
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
              }} /> */}
          </>
        )}
      </Formik>







    </View>
  );
};

export default MyProfileUpdate;
