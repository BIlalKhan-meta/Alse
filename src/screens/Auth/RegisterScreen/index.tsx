import { useState } from 'react';
import {
  View, Text,
  TouchableOpacity,
  Image
} from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import InterBold from '../../../components/Text/InterBold';
import InterRegular from '../../../components/Text/InterRegular';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import { Formik } from 'formik';

import InterLight from '../../../components/Text/InterLight';
import PhoneNumberInput from '../../../components/TextInput/PhoneNumberInput';
import { colors } from '../../../utils/theme';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import CheckboxComponent from '../../../components/CheckboxComponent';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../utils/images';
import GeneralModal from '../../../components/GeneralModal';
import { useNavigation } from '@react-navigation/native';
import Card from '../../../components/Card';
import InterRegularSmallest from '../../../components/Text/InterRegularSmallest';
import { useAppDispatch } from '../../../hooks/storeHooks';
import { signup } from '../../../store/slices/authSlice';
import useImagePicker from '../../../hooks/useImagePicker';
import BottomModal from '../../../components/BottomModel';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import moment from 'moment';

const RegisterScreen: React.FC = () => {

  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  // const { image, captureImage, chooseImageFromLibrary } = useImagePicker();

  const [submitted, setSubmitted] = useState<boolean>(false)
  const [securePassword, setSecurePassword] = useState<boolean>(true)
  const [secureCPassword, setSecureCPassword] = useState<boolean>(true)
  const [open1, setOpen1] = useState(false);
  const [value1, setValue1] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [openDate, setOpenDate] = useState<boolean>(false)
  const [date, setDate] = useState<Date>(new Date());
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [successModel, setSuccessModel] = useState<boolean>(false);
  const [bottomVisible, setbottomVisible] = useState<boolean>(false);
  const [image, setImage] = useState(null);

  const handleCheckboxChange = (value: boolean) => {
    setIsChecked(value);
  };

  // const handleNumberChange = (number: string) => {
  //   setPhoneNumber(number);
  // }
  const handleNumberChange = (number: string, setFieldValue: any) => {
    setFieldValue('contactNo', number);
    setPhoneNumber(number);
  };



  const ages = Array.from({ length: 100 }, (_, index) => ({
    name: `${index + 1} years`,
    id: index + 1
  }));

  interface FormValues {
    name: string,
    email: string,
    password: string,
    cpassword: string,
    contactNo: string,
    countryCode: string;
    dateOfBirth: string,
    // age: string,

  }

  const initialValues = {
    name: '',
    email: '',
    password: '',
    cpassword: '',
    contactNo: '',
    countryCode: '+1',
    dateOfBirth: '',
    // age: '',
  };

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup
      .string()
      .email('Email or password is wrong !! TRY AGAIN')
      .required('Email is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    cpassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    contactNo: yup.string().required('Contact Number is required'),
    dateOfBirth: yup
      .date()
      .required('Date of Birth is required'),
    // age: yup
    //   .string()
    //   .required('Age is required'),
  });


  const handleSubmit = (values: FormValues, { resetForm }: { resetForm: () => void }) => {
    // setSuccessModel(true);
    // Prepare data for signup
    let code;
    if (values?.countryCode == '') {
      code = "+1"
    } else {
      code = values?.countryCode

    }
    const signupData = {
      first_name: values.name, // Assuming 'name' is first name
      last_name: 'test', // If you want to add last name, update the input
      username: values.name, // Add username input in your form
      email: values.email,
      password: values.password,
      // dialing_code: values?.countryCode,
      dialing_code: code,
      phone_number: values.contactNo,
      gender: 'male', // Adjust based on user input
      dob: moment(date).format("YYYY-MM-DD"), // Use your existing formatDate function
    };
    console.log(values?.countryCode, "Countryyy codee ")
    console.log(values?.contactNo, "contactNo codee ")
    if (image) {
      let imagePath = image.split('/');

      const uploadedImage = {
        uri: image,
        name: imagePath[imagePath.length - 1],
        type: `image/jpeg`,
      };
      signupData['image'] = uploadedImage;
    }

    // Dispatch the signup action
    dispatch(signup(signupData))
      .unwrap()
      .then((res) => {
        console.log('response from Signup ====>', res);

        // Optionally navigate or show success message
        // navigation.navigate("Login");
        resetForm()
        setSuccessModel(true)
        setSubmitted(false)
      })
      .catch((error) => {
        console.error("Signup error:", error);
      });
  };


  function formatDate(date: any) {
    if (!date) {
      // If date is empty or null, return an empty string
      return '';
    }
    else {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();

      return `${month}/${day}/${year}`;

    }

  }


  const handleImage = camera => {
    let options = {
      mediaType: 'photo', // 'photo' or 'video'
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
    };
    if (camera) {
      launchCamera(options, response => {
        if (response.didCancel) {
          console.log('User cancelled camera picker');
        } else if (response.errorCode == 'camera_unavailable') {
          console.log('Camera not available on device');
        } else if (response.errorCode == 'permission') {
          console.log('Permission not satisfied');
        } else {
          console.log('response ===>', response);
          setbottomVisible(false);
          setImage(response?.assets[0]?.uri);

          // Set the captured image URI
          // Handle further processing if needed (e.g., setting file type)
        }
      });
    } else {
      launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode == 'permission') {
          console.log('Permission not satisfied');
        } else {
          setbottomVisible(false);
          setImage(response?.assets[0]?.uri);
          // let imagePath = imageData.split('/');

          // const image = {
          //   uri: imageData,
          //   name: imagePath[imagePath.length - 1],
          //   type: `image/jpeg`,
          // };
          // Set the selected image URI
          // Handle further processing if needed (e.g., setting file type)
        }
      });
    }
  };
  console.log(image, "Image uriiiiii ")
  return (


    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}>
      {({ handleSubmit, handleChange, handleBlur, values, errors, resetForm, setFieldValue }) => (
        <>
          <KeyboardAwareScrollView
            style={styles.scrollview}
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.container}>
              <Card style={styles.cardStyle}>

                <InterBold style={styles.heading}>Create Account</InterBold>
                <View style={styles.imageContainer}>
                  <Image source={image ? { uri: image } : images.profile} style={styles.imageStyle} />


                  <TouchableOpacity style={styles.camera}
                    onPress={() => setbottomVisible(true)}
                  >
                    <Image source={images.camera} />
                  </TouchableOpacity>
                </View>
                <RegularTextInput
                  label="Full Name"
                  placeholder='Enter full name'
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                  submitted={submitted}
                  errors={errors.name}
                  labelStyle={styles.label}
                />



                <RegularTextInput
                  label="Email Address"
                  placeholder='Enter Email Address'
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  submitted={submitted}
                  errors={errors.email}
                />

                <PhoneNumberInput
                  initialNumber={phoneNumber}
                  // onNumberChange={handleNumberChange}
                  onNumberChange={(number: string) => handleNumberChange(number, setFieldValue)}
                  label="Phone No."
                  // value={values.contactNo}
                  submitted={submitted}
                  errors={errors.contactNo}
                  onChangeCountry={handleChange('countryCode')}

                />

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
                        setFieldValue('dateOfBirth', date);
                      }}
                      onCancel={() => {
                        setOpenDate(false)
                      }}
                    />
                    {submitted && errors.dateOfBirth && <InterRegularSmallest style={styles.error}>{errors.dateOfBirth}</InterRegularSmallest>}
                  </View>



                  {/* <View>
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
                    // data={ages}
                    >

                      <Picker.Item label={"Select Age"} value="" />

                      {ages.map((item) => (
                        <Picker.Item
                          label={item.name.toString()}
                          value={item.name.toString()}
                          key={item.id.toString()}
                        />
                      ))}

                    </Picker>
                    {submitted && errors.age && <InterRegularSmallest style={styles.error}>{errors.age}</InterRegularSmallest>}
                  </View> */}

                </View>




                <RegularTextInput
                  label="Password"
                  placeholder='Enter Password'
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  submitted={submitted}
                  errors={errors.password}
                  secureTextEntry={securePassword}
                  onPressPassword={() => setSecurePassword(!securePassword)} />

                <RegularTextInput
                  label="Confirm Password"
                  placeholder='Enter Confirm Password'
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('cpassword')}
                  onBlur={handleBlur('cpassword')}
                  value={values.cpassword}
                  submitted={submitted}
                  errors={errors.cpassword}
                  secureTextEntry={secureCPassword}
                  onPressCPassword={() => setSecureCPassword(!secureCPassword)} />
                <View style={styles.checkboxStyle}>
                  <CheckboxComponent
                    label="Child Account"
                    isChecked={isChecked}
                    onValueChange={handleCheckboxChange}
                  />


                </View>

                <TouchableOpacity style={styles.faceBtn}>
                  <View>
                    <InterRegular style={styles.faceTxt}>Face Recognition is required for child verification</InterRegular>
                    <Image source={images.face} style={styles.faceImg} />
                  </View>
                </TouchableOpacity>



                <CustomButton onPress={() => {
                  // setSuccessModel(true)
                  setSubmitted(true)
                  // resetForm()
                  handleSubmit()
                }}>
                  Create Account
                </CustomButton>

                <View style={styles.loginContainer}>
                  <InterRegular style={styles.loginTxt}>Already have an account? </InterRegular>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <InterRegular style={styles.loginTxt2}>Login Now </InterRegular>
                  </TouchableOpacity>
                </View>

                <GeneralModal
                  visible={successModel}
                  closeModal={() => setSuccessModel(false)}
                  icon={images.checkedIcon}
                  title='Account Registered'
                  message='Your account has been registered successfully'
                  buttonText='Okay'
                  primaryBtn={true}
                  onPress={() => {
                    setSuccessModel(false)
                    navigation.navigate("Login")
                  }} />

              </Card>

              <BottomModal
                visible={bottomVisible}
                closeModal={() => setbottomVisible(false)}
                onPressImage={() => handleImage(true)}
                // onPress={() => captureImage('video')}
                onPressGallery={() => handleImage()}
              />
            </View>
          </KeyboardAwareScrollView>
        </>
      )

      }
    </Formik>

  );
};

export default RegisterScreen;
