import { useState } from 'react';
import {
  ScrollView,
  View,
} from 'react-native';

import * as yup from 'yup';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import Card from '../../components/Card';
import InterRegular from '../../components/Text/InterRegular';


const AboutUs: React.FC = ({ navigation }) => {

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
      <View style={{ paddingHorizontal: 15, paddingTop: 30 }}>

        <HeaderComponent
          label={'About Us'}

        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.container}>
          <InterRegular style={styles.adddetailsheading}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate viverra justo commodo. Proin sodales pulvinar tempor.viverra justo commodo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis.
          </InterRegular>
        </Card>
      </ScrollView>

    </>
  );
};

export default AboutUs;