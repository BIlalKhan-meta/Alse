import { useState } from 'react';
import {
  TextInput,
  View,
} from 'react-native';
import * as yup from 'yup';
import styles from './styles';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import { Formik } from 'formik';
// import GeneralModal from '../../components/GeneralModal';
import CustomButton from '../../components/CustomButton';
import InterBold from '../../components/Text/InterBold';
import Card from '../../components/Card';
import HeaderComponent from '../../components/HeaderComponent';
import GeneralModal from '../../components/GeneralModal';
import { images } from '../../utils/images';

const ContactUs: React.FC = ({ navigation }) => {

  const [submitted, setSubmitted] = useState<boolean>(false)
  const [messageSubmittedModal, setMessageSubmittedModal] = useState<boolean>(false)

  interface FormValues {
    name: string,
    contactNo: string,
    email: string,
    subject: string,
    message: string;
  }

  const initialValues = {
    name: '',
    contactNo: '',
    email: '',
    subject: '',
    message: ''
  };

  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    name: yup.string().required('First Name is required'),
    contactNo: yup.string().required('Contact Number is required'),
    email: yup
      .string()
      .email('Email is wrong !! TRY AGAIN')
      .required('Email is required'),
    subject: yup.string().required('Subject is required'),
    message: yup.string().required('Message is required'),
  });

  const handleSubmit = (values: object, { resetForm }: { resetForm: () => void }) => {
    console.log("CONTACT ADMIN FORM SUBMITTED")
    setMessageSubmittedModal(true)
    resetForm()
    // navigation.navigate("Login")

  }

  return (
    <>
      <View style={{ paddingHorizontal: 15, paddingTop: 30, }}>

        <HeaderComponent label='Contact Us' />
      </View>
      <Card style={styles.cardContainer}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {({ handleSubmit, handleChange, handleBlur, values, errors, resetForm }) => (
            <>
              <KeyboardAwareScrollView style={styles.scrollview}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.container}>

                  <RegularTextInput
                    label="Full Name"
                    placeholder='Enter Full Name'
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                    submitted={submitted}
                    errors={errors.name} />



                  <RegularTextInput
                    label="Email Address"
                    placeholder='Enter Email Address'
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    submitted={submitted}
                    errors={errors.email} />

                  <RegularTextInput
                    label="Subject"
                    placeholder='Enter Subject'
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('subject')}
                    onBlur={handleBlur('subject')}
                    value={values.subject}
                    submitted={submitted}
                    errors={errors.subject} />

                  <InterBold style={[styles.label]}>
                    {"Message"}
                  </InterBold>

                  <View style={styles.msgStyle}>

                    <TextInput
                      // label="Message"
                      placeholder='Enter Message'
                      placeholderTextColor="#9B9797"
                      onChangeText={handleChange('message')}
                      onBlur={handleBlur('message')}
                      value={values.message}
                      submitted={submitted}
                      errors={errors.message}
                      multiline={true}
                      style={styles.inputStyle}
                    />
                  </View>


                  <CustomButton
                    style={{ alignSelf: "center" }}
                    onPress={() => {
                      setMessageSubmittedModal(true)

                      setSubmitted(true)
                      resetForm()
                      handleSubmit()
                    }}>
                    Submit
                  </CustomButton>

                </View>
              </KeyboardAwareScrollView>
            </>
          )

          }
        </Formik>
      </Card>


      <GeneralModal
        visible={messageSubmittedModal}
        closeModal={() => setMessageSubmittedModal(false)}
        icon={images.checkedIcon}
        title='Message'
        message='Your message has been submitted successfully'
        buttonText='Okay'
        onPress={() => setMessageSubmittedModal(false)}
        primaryBtn={true}
      />


    </>
  );
};

export default ContactUs;