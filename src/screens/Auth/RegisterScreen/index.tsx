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
    dateOfBirth: string,
    age: string,

  }

  const initialValues = {
    name: '',
    email: '',
    password: '',
    cpassword: '',
    contactNo: '',
    dateOfBirth: '',
    age: '',
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
    age: yup
      .string()
      .required('Age is required'),
  });


  const handleSubmit = (values: object, { resetForm }: { resetForm: () => void }) => {
    setSuccessModel(true)

    // console.log("SUBMITTED")
    // navigation.navigate("Login")
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
              <Card style={styles.cardStyle}>

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


            </View>
          </KeyboardAwareScrollView>
        </>
      )

      }
    </Formik>

  );
};

export default RegisterScreen;
