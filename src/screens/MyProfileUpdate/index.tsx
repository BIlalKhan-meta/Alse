import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from './styles';


import { useEffect, useLayoutEffect, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../../store/slices/authSlice';
import moment from 'moment';
import { vw } from '../../constant';
import { useAppDispatch } from '../../hooks/storeHooks';
import { updateProfile } from '../../store/slices/profileSlice';
import { editProfile } from '../../api/profile';

const MyProfileUpdate: React.FC = () => {
  const navigation = useNavigation()
  const user = useSelector(selectUserProfile);
  const dispatch = useAppDispatch();

  const { imageData, image, captureImage, chooseImageFromLibrary } = useImagePicker();

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
  // const [date, setDate] = useState<Date>(new Date())
  const [date, setDate] = useState<Date>(user?.dob ? new Date(user.dob) : new Date());


  // const [bannerImage, setBannerImage] = useState<string | null>(user?.cover_photo || null);
  // const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null);

  const [bannerImage, setBannerImage] = useState({
    uri: user?.cover_photo || null,
    name: '',
    type: ''
  });
  const [profileImage, setProfileImage] = useState({
    uri: user?.avatar || null,
    name: '',
    type: ''
  });
  const [updatingBanner, setUpdatingBanner] = useState<boolean>(false); // To track which image is being updated


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
    firstName: string;
    lastName: string;
    username: string;
    contactNo: string
    // email: string;
    // age: string;
    birthdate: string;
  }



  const initialValues = {
    firstName: user?.first_name,
    lastName: user?.last_name,
    username: user?.username,
    contactNo: user?.phone_number,
    // email: 'abc#gmail.com',
    // age: '10 years',
    birthdate: user?.dob,

  };


  const validationSchema: yup.AnySchema<FormValues> = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    username: yup.string().required('User Name is required'),
    contactNo: yup.string().required('Contact Number is required'),
    // email: yup.string().required('Email is required'),
    // age: yup.string().required('Age is required'),
    birthdate: yup.string().required('birthDate is required'),
  });



  const handleSubmit = async (
    values: object,
    { resetForm }: { resetForm: () => void },
  ) => {
    const data = {
      first_name: values?.firstName,
      last_name: values?.lastName,

      dialing_code: '+1',
      phone_number: values?.contactNo,
      dob: values?.birthdate
    };
    if (profileImage.type !== '') {
      // let imagePath = image.split('/');

      const uploadedImage = {
        uri: profileImage?.uri,
        name: profileImage?.name,
        type: profileImage?.type,
      };

      console.log('uploadedImage= ==>', uploadedImage);
      // console.log('uploadedCover= ==>', uploadedCover);

      data['image'] = uploadedImage;
    }

    if (bannerImage && updatingBanner) {

      const uploadedCover = {
        uri: bannerImage.uri,
        name: bannerImage?.name,
        type: bannerImage?.type,
      };
      data['cover_image'] = uploadedCover;

    }

    let formData = new FormData();

    Object.entries(data).forEach(item => {
      formData.append(item[0], item[1]);
    });
    console.log('formData===>', formData);

    setSubmitted(true);

    await editProfile(formData)
      // .unwrap()
      .then(res => {
        setSubmitted(false);

        console.log('response form updated Profile==========>', res);
        setProfileUpdateModal(true);
      })
      .catch(err => {
        setSubmitted(false);
        console.log('error from Updated Profile =========>', err);
      });
    resetForm();
    try {
    } catch (err) {
      console.log('error  ======>', err);
      // navigation.navigate("Login")
    }
  };
  const handleImageSelection = (isBanner: boolean) => {
    setUpdatingBanner(isBanner);
    chooseImageFromLibrary();
  };

  const handleImageCapture = (isBanner: boolean) => {
    setUpdatingBanner(isBanner);
    captureImage('photo');
  };

  // When image is selected or captured, update the correct image (banner or profile)
  // if (imageData?.uri) {
  //   if (updatingBanner) {
  //     setBannerImage(imageData.uri); // Set banner image if updating banner
  //   } else {
  //     setProfileImage(imageData.uri); // Set profile image if updating profile
  //   }
  // }

  useEffect(() => {
    if (imageData?.uri) {
      if (updatingBanner) {
        setBannerImage({
          uri: imageData?.uri,
          name: imageData?.fileName,
          type: imageData?.type
        }); // Set banner image if updating banner
      } else {
        setProfileImage({
          uri: imageData?.uri,
          name: imageData?.fileName,
          type: imageData?.type
        }); // Set profile image if updating profile
      }
    }
  }, [imageData, updatingBanner]);



  console.log('====================================');
  console.log(imageData?.uri, "Imageeee Dataaaa===>>>")
  console.log(user, "user Dataaaa===>>>")
  console.log(profileImage, "profileImage ===>>>")

  console.log('====================================');

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
          setFieldValue,
        }) => (
          <>
            <KeyboardAwareScrollView style={styles.scrollview}>
              <View style={styles.container}>
                <Card style={styles.cardContainer}>

                  <View style={styles.banner}>
                    <Image
                      source={
                        bannerImage // If a new banner is selected or captured, show it
                          ? { uri: bannerImage.uri }
                          : user?.banner_image // Else, show the user’s banner if it exists
                            ? { uri: user.banner_image }
                            : images.profileBg // Fallback to default banner image
                      }
                      style={styles.imageStyle} />
                    <TouchableOpacity style={styles.editBtn}
                      onPress={() => handleImageCapture(true)}

                    >
                      <Image source={images.edit} style={styles.editImage} />
                    </TouchableOpacity>

                  </View>



                  <View style={styles.profileConatiner}>

                    <View style={styles.imagecontainer}>
                      <Image
                        source={
                          profileImage // If a new profile picture is selected or captured, show it
                            ? { uri: profileImage.uri }
                            : user?.profile_image // Else, show the user’s profile picture if it exists
                              ? { uri: user.profile_image }
                              : images.user2 // Fallback to default profile image
                        }


                        style={[styles.imageStyle, { borderRadius: vw * 15 }]} />
                    </View>

                    <TouchableOpacity style={styles.camBg}
                      onPress={() => handleImageCapture(false)}
                    >
                      <View style={styles.camcontainer}>
                        <Image source={images.camera} style={styles.imageStyle} />
                      </View>
                    </TouchableOpacity>
                  </View>



                  <View style={styles.inputContainer}>
                    <RegularTextInput
                      label="First Name *"
                      placeholder="Enter First Name"
                      placeholderTextColor="#9B9797"
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      value={values.firstName}
                      submitted={submitted}
                      errors={errors.firstName}
                      labelStyle={styles.txt}
                    />

                    <RegularTextInput
                      label="Last Name *"
                      placeholder="Enter Last Name"
                      placeholderTextColor="#9B9797"
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      value={values.lastName}
                      submitted={submitted}
                      errors={errors.lastName}
                      labelStyle={styles.txt}
                    />

                    <RegularTextInput
                      label="User Name *"
                      placeholder="Enter User Name"
                      placeholderTextColor="#9B9797"
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      value={values.username}
                      submitted={submitted}
                      errors={errors.username}
                      // style={styles.inputstyle}
                      labelStyle={styles.txt}
                    />



                    {/* <PhoneNumberInput
                      initialNumber={values.contactNo}
                      onNumberChange={handleChange('contactNo')}
                      label="Phone Number *"
                      // style={styles.phoneContainer}
                      initialCountryCode={user?.dialing_code}
                      submitted={submitted}
                      errors={errors.contactNo}
                      labelStyle={styles.txt}
                    /> */}


                    <PhoneNumberInput
                      initialNumber={values.contactNo}
                      onNumberChange={handleChange('contactNo')}
                      label="Phone Number *"
                      // style={styles.phoneContainer}
                      submitted={submitted}
                      errors={errors.contactNo}
                      labelStyle={styles.txt}
                    />



                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View>
                        <InterRegular style={styles.label}>
                          Date of Birth *
                        </InterRegular>

                        <TouchableOpacity onPress={() => setOpenDate(true)}>
                          <View style={[styles.textinputbox]}>
                            {/* <InterLight style={{}}>{'mm/dd/yyyy'}</InterLight> */}
                            <InterLight>
                              {values.birthdate
                                ? moment(values.birthdate).format('MM/DD/YYYY')
                                : 'mm/dd/yyyy'}
                            </InterLight>
                            <Image source={images.calendericon} style={styles.calendericon} />
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
                            setFieldValue('birthdate', moment(date).format('YYYY-MM-DD'));
                          }}
                          onCancel={() => {
                            setOpenDate(false)
                          }}
                        />
                      </View>



                      {/* <View>
                        <InterRegular style={styles.label}>
                          Age *
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
                      </View> */}

                    </View>

                    <CustomButton
                      style={{ alignSelf: "center" }}
                      onPress={() => {
                        // setProfileUpdateModal(true)
                        setSubmitted(true);
                        // resetForm()
                        handleSubmit();
                      }}
                      loading={submitted}
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