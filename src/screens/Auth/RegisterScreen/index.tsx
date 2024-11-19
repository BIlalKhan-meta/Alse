import {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import InterRegular from '../../../components/Text/InterRegular';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import {Formik} from 'formik';
import PhoneNumberInput from '../../../components/TextInput/PhoneNumberInput';
import CheckboxComponent from '../../../components/CheckboxComponent';
import CustomButton from '../../../components/CustomButton';
import {images} from '../../../utils/images';
import GeneralModal from '../../../components/GeneralModal';
import {useNavigation} from '@react-navigation/native';
import Card from '../../../components/Card';
import useImagePicker from '../../../hooks/useImagePicker';
import InterBoldLabel from '../../../components/Text/InterBoldLabel';
import {DialogBox} from '../../../components/DialogBox';
import DatePickerInput from '../../../components/TextInput/DatePickerTextInput2';
import Toast from 'react-native-toast-message';
import {colors} from '../../../utils/theme';
import {signup} from '../../../api/auth';
import {dateHelper} from '../../../utils';

interface FormValues {
  name: string;
  email: string;
  password: string;
  cpassword: string;
  contactNo: string;
  countryCode: string;
  dateOfBirth: string;
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

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup
    .string()
    .email('Email or password is wrong !! TRY AGAIN')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  cpassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  contactNo: yup.string().required('Contact Number is required'),
  dateOfBirth: yup.string().required('Date of Birth is required'),
});

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [secureCPassword, setSecureCPassword] = useState<boolean>(true);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [successModel, setSuccessModel] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [image, setImage] = useState<object | null>(null);
  const [childImage, setChildImage] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [childState, setChildState] = useState(false);

  const handleCheckboxChange = (value: boolean) => {
    setIsChecked(value);
  };

  const handleImageCapture = (state: boolean) => {
    setChildState(state);
    if (state == true) {
      captureImage('photo');
    } else {
      setVisible(true);
    }
  };

  useEffect(() => {
    if (childState) {
      setChildImage({
        uri: imageData?.uri,
        name: imageData?.fileName,
        type: imageData?.type,
      });
    } else {
      setImage({
        uri: imageData?.uri,
        name: imageData?.fileName,
        type: imageData?.type,
      });
    }
    setVisible(false);
  }, [imageData]);

  const handleNumberChange = (number: string, setFieldValue: any) => {
    setFieldValue('contactNo', number);
    setPhoneNumber(number);
  };

  const handleSubmit = (values: FormValues) => {
    setLoading(true);
    if (image == null) {
      setLoading(false);
      return Toast.show({
        type: 'error',
        text1: 'Profile Picture',
        text2: 'Profile Picture Required',
      });
    }

    if (isChecked && !childImage) {
      setLoading(false);
      return Toast.show({
        type: 'error',
        text1: 'Child Recognition',
        text2: 'Child Recognition is Required',
      });
    }
    const signupData = {
      full_name: values.name,
      email: values.email,
      password: values.password,
      dialing_code: values.countryCode,
      phone_number: values.contactNo,
      dob: dateHelper(values.dateOfBirth),
      image: image,
      ...(isChecked ? {is_child: 1, child_image: childImage} : {}),
    };

    const form = new FormData();
    Object.entries(signupData).forEach(([key, value]) => {
      form.append(key, value);
    });

    signup(form)
      .then(res => {
        console.log('response from Signup ====>', res);
        setSuccessModel(true);
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message,
        });
      })
      .finally(() => {
        setSubmitted(false);
        setLoading(false);
      });
  };

  return (
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
        setFieldValue,
      }) => (
        <>
          <KeyboardAwareScrollView
            style={styles.scrollview}
            showsVerticalScrollIndicator={false}>
            <DialogBox
              status="upload"
              heading="Upload Media"
              onClose={() => setVisible(false)}
              visible={visible}
              button={[
                {
                  text: 'Open Camera',
                  onPress: () => captureImage(),
                },
                {text: 'Open Gallery', onPress: chooseImageFromLibrary},
              ]}
            />

            <View style={styles.container}>
              <Card style={styles.cardStyle}>
                <InterBoldLabel style={styles.heading}>
                  Create Account
                </InterBoldLabel>
                <View style={styles.imageContainer}>
                  <Image
                    source={imageData ? {uri: imageData?.uri} : images.profile}
                    style={styles.imageStyle}
                  />

                  <TouchableOpacity
                    style={styles.camera}
                    onPress={() => handleImageCapture(false)}>
                    <Image source={images.camera} />
                  </TouchableOpacity>
                </View>
                <RegularTextInput
                  label="Full Name"
                  placeholder="Enter full name"
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
                  placeholder="Enter Email Address"
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  submitted={submitted}
                  errors={errors.email}
                />

                <PhoneNumberInput
                  initialNumber={phoneNumber}
                  onNumberChange={(number: string) =>
                    handleNumberChange(number, setFieldValue)
                  }
                  label="Phone No."
                  submitted={submitted}
                  errors={errors.contactNo}
                  onChangeCountry={handleChange('countryCode')}
                />

                <InterRegular style={styles.label}>Date of Birth</InterRegular>

                <DatePickerInput
                  label="Date of Birth"
                  error={errors.dateOfBirth}
                  initialDate={values.dateOfBirth}
                  placeholder="mm/dd/yyyy"
                  onDateChange={e => setFieldValue('dateOfBirth', e)}
                  style={styles.textinputbox}
                  maxDate
                />

                <RegularTextInput
                  label="Password"
                  placeholder="Enter Password"
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  submitted={submitted}
                  errors={errors.password}
                  secureTextEntry={securePassword}
                  onPressPassword={() => setSecurePassword(!securePassword)}
                />

                <RegularTextInput
                  label="Confirm Password"
                  placeholder="Enter Confirm Password"
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('cpassword')}
                  onBlur={handleBlur('cpassword')}
                  value={values.cpassword}
                  submitted={submitted}
                  errors={errors.cpassword}
                  secureTextEntry={secureCPassword}
                  onPressCPassword={() => setSecureCPassword(!secureCPassword)}
                />
                <View style={styles.checkboxStyle}>
                  <CheckboxComponent
                    label="Child Account"
                    isChecked={isChecked}
                    onValueChange={handleCheckboxChange}
                  />
                </View>

                <TouchableOpacity style={styles.faceBtn}>
                  <View>
                    <InterRegular style={styles.faceTxt}>
                      Face Recognition is required for child verification
                    </InterRegular>
                    <TouchableOpacity
                      disabled={!isChecked}
                      onPress={() => handleImageCapture(true)}>
                      <Image source={images.face} style={styles.faceImg} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                <CustomButton onPress={handleSubmit} loading={loading}>
                  Create Account
                </CustomButton>

                <View style={styles.loginContainer}>
                  <InterRegular style={styles.loginTxt}>
                    Already have an account?{' '}
                  </InterRegular>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}>
                    <InterRegular style={styles.loginTxt2}>
                      Login Now{' '}
                    </InterRegular>
                  </TouchableOpacity>
                </View>

                <GeneralModal
                  visible={successModel}
                  closeModal={() => setSuccessModel(false)}
                  icon={images.checkedIcon}
                  title="Account Registered"
                  message="Your account has been registered successfully"
                  buttonText="Okay"
                  primaryBtn={true}
                  onPress={() => {
                    setSuccessModel(false);
                    navigation.navigate('Login');
                  }}
                />
              </Card>

              {/* <BottomModal
                visible={bottomVisible}
                closeModal={() => setbottomVisible(false)}
                onPressImage={() => captureImage()}
                // onPress={() => captureImage('video')}
                onPressGallery={() => chooseImageFromLibrary()}
              /> */}
            </View>
          </KeyboardAwareScrollView>
        </>
      )}
    </Formik>
  );
};

export default RegisterScreen;
