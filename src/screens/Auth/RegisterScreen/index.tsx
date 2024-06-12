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

const RegisterScreen: React.FC = () => {

  const navigation = useNavigation();

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

  const handleCheckboxChange = (value: boolean) => {
    setIsChecked(value);
  };

  const handleNumberChange = (number: string) => {
    setPhoneNumber(number);
  }
  const genders = [
    { name: '10 years', id: 1 },
    { name: '12 years', id: 2 },
  ];

  interface FormValues {
    firstname: string,
    lastname: string,
    email: string,
    gender: string,
    password: string,
    cpassword: string,
    contactNo: string

  }

  const initialValues = {
    firstname: '',
    lastname: '',
    email: '',
    gender: '',
    password: '',
    cpassword: '',
    contactNo: ''
  };

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    firstname: yup.string().required('First Name is required'),
    lastname: yup.string().required('Last Name is required'),
    email: yup
      .string()
      .email('Email or password is wrong !! TRY AGAIN')
      .required('Email is required'),
    gender: yup.string().required('Gender is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    cpassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    contactNo: yup.string().required('Contact Number is required'),
  });


  const handleSubmit = (values: object, { resetForm }: { resetForm: () => void }) => {
    console.log("SUBMITTED")
    navigation.navigate("Login")
  }

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
              <InterBold style={styles.heading}>Create Account</InterBold>
              <View style={styles.imageContainer}>
                <Image source={images.profile} />

                <View style={styles.camera}>
                  <Image source={images.camera} />
                </View>
              </View>
              <RegularTextInput
                label="Full Name"
                placeholder='Enter full name'
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('firstname')}
                onBlur={handleBlur('firstname')}
                value={values.firstname}
                submitted={submitted}
                errors={errors.firstname}
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
                onNumberChange={handleNumberChange}
                label="Phone No."

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
                    onValueChange={handleChange('gender')}
                    selectedValue={values.gender}
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



              <CustomButton onPress={() => {
                setSuccessModel(true)
                // setSubmitted(true)
                // resetForm()
                // handleSubmit()
              }}>
                Create Account
              </CustomButton>

              <View style={styles.loginContainer}>
                <InterRegular style={styles.loginTxt}>Already have an account? </InterRegular>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <InterRegular style={styles.loginTxt2}>Login Now </InterRegular>
                </TouchableOpacity>
              </View>
              {successModel && (
                <>
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
                </>
              )}


            </View>
          </KeyboardAwareScrollView>
        </>
      )

      }
    </Formik>

  );
};

export default RegisterScreen;
