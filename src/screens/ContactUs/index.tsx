import {useState} from 'react';
import {View} from 'react-native';
import * as yup from 'yup';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import {Formik} from 'formik';
import CustomButton from '../../components/CustomButton';
import InterBold from '../../components/Text/InterBold';
import Card from '../../components/Card';
import GeneralModal from '../../components/GeneralModal';
import {images} from '../../utils/images';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {contactUs} from '../../api/menu';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
  name: yup.string().required('First Name is required'),
  email: yup
    .string()
    .email('Email is wrong !! TRY AGAIN')
    .required('Email is required'),
  subject: yup.string().required('Subject is required'),
  message: yup.string().required('Message is required'),
});

const ContactUs: React.FC = ({navigation}) => {
  const user = useSelector(selectUserProfile);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [messageSubmittedModal, setMessageSubmittedModal] =
    useState<boolean>(false);

  console.log('USERRRRRRRRRRRRRRR', user);

  const initialValues = {
    name: user?.full_name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  };

  const handleSubmit = async (values: FormValues) => {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      form.append(key, value);
    });

    await contactUs(form).then(res => {
      if (res?.data) {
        setMessageSubmittedModal(true);
      }
    });
  };

  return (
    <View style={styles.mainContainer}>
      <Card style={styles.cardContainer}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
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
              <KeyboardAwareScrollView
                style={styles.scrollview}
                showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                  <RegularTextInput
                    label="Full Name*"
                    placeholder="Enter Full Name"
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                    submitted={submitted}
                    errors={errors.name}
                  />

                  <RegularTextInput
                    label="Email Address*"
                    placeholder="Enter Email Address"
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    submitted={submitted}
                    errors={errors.email}
                  />

                  <RegularTextInput
                    label="Subject*"
                    placeholder="Enter Subject"
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('subject')}
                    onBlur={handleBlur('subject')}
                    value={values.subject}
                    submitted={submitted}
                    errors={errors.subject}
                  />

                  <InterBold style={[styles.label]}>{'Message*'}</InterBold>

                  <RegularTextInput
                    // label="Message"
                    placeholder="Enter Message"
                    placeholderTextColor="#9B9797"
                    onChangeText={handleChange('message')}
                    onBlur={handleBlur('message')}
                    value={values.message}
                    submitted={submitted}
                    errors={errors.message}
                    multiline={true}
                    // style={styles.inputStyle}
                    containerStyle={{marginTop: 0}}
                  />

                  <CustomButton
                    style={{alignSelf: 'center'}}
                    onPress={() => {
                      setSubmitted(true);
                      handleSubmit();
                    }}>
                    Submit
                  </CustomButton>
                </View>
              </KeyboardAwareScrollView>
            </>
          )}
        </Formik>
      </Card>

      <GeneralModal
        visible={messageSubmittedModal}
        closeModal={() => setMessageSubmittedModal(false)}
        icon={images.checkedIcon}
        title="Message"
        message="Your message has been submitted successfully"
        buttonText="Okay"
        onPress={() => {
          setMessageSubmittedModal(false);
          navigation.goBack();
        }}
        primaryBtn={true}
      />
    </View>
  );
};

export default ContactUs;
