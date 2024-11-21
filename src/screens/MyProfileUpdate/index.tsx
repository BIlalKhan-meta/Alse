import {Text, View, Image, TouchableOpacity} from 'react-native';
import styles from './styles';

import {useEffect, useLayoutEffect, useState} from 'react';
import * as yup from 'yup';
import {Formik} from 'formik';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import GeneralModal from '../../components/GeneralModal';
import {images} from '../../utils/images';
import {useNavigation} from '@react-navigation/native';
import PhoneNumberInput from '../../components/TextInput/PhoneNumberInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../components/CustomButton';
import Card from '../../components/Card';
import {colors} from '../../utils/theme';
import InterRegular from '../../components/Text/InterRegular';
import InterLight from '../../components/Text/InterLight';
import DatePicker from 'react-native-date-picker';
import useImagePicker from '../../hooks/useImagePicker';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import moment from 'moment';
import {vh, vw} from '../../constant';
import {useAppDispatch} from '../../hooks/storeHooks';
import {editProfile} from '../../api/profile';
import {DialogBox} from '../../components/DialogBox';
import DatePickerInput from '../../components/TextInput/DatePickerTextInput2';
import {dateHelper} from '../../utils';
import dayjs from 'dayjs';

interface FormValues {
  username: string;
  contactNo: string;
  birthdate: string;
  countryCode: string;
}

const validationSchema = yup.object().shape({
  username: yup.string().required('User Name is required'),
  contactNo: yup.string().required('Contact Number is required'),
  birthdate: yup.string().required('birthDate is required'),
});

const MyProfileUpdate: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const [visible, setVisible] = useState(false);

  const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();

  const [profileDetails, setProfileDetails] = useState<boolean>(true);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [profileUpdateModal, setProfileUpdateModal] = useState<boolean>(false);
  const [openDate, setOpenDate] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(
    user?.dob ? new Date(user.dob) : new Date(),
  );

  const initialValues = {
    username: user?.full_name,
    contactNo: user?.phone_number,
    birthdate: dateHelper(user?.dob),
    countryCode: '+1',
  };

  const [bannerImage, setBannerImage] = useState({
    uri: user?.cover_photo || null,
    name: '',
    type: '',
  });
  const [profileImage, setProfileImage] = useState({
    uri: user?.avatar || null,
    name: '',
    type: '',
  });
  const [updatingBanner, setUpdatingBanner] = useState<boolean>(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
    });
  }, [navigation]);

  const handleSubmit = async (
    values: object,
    {resetForm}: {resetForm: () => void},
  ) => {
    setSubmitted(true);
    const data = {
      full_name: values?.username,
      dialing_code: values?.countryCode,
      phone_number: values?.contactNo,
      dob: values?.birthdate,
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

    console.log('CHECKKKKKKKKKKKK', JSON.stringify(formData, null, 4));

    await editProfile(formData)
      .then(res => {
        setSubmitted(false);
        setProfileUpdateModal(true);
        navigation.goBack();
      })
      .catch(err => {
        setSubmitted(false);
      });
    resetForm();
  };

  const handleImageCapture = (isBanner: boolean) => {
    setUpdatingBanner(isBanner);
    setVisible(true);
  };

  useEffect(() => {
    if (imageData?.uri) {
      if (updatingBanner) {
        setBannerImage({
          uri: imageData?.uri,
          name: imageData?.fileName,
          type: imageData?.type,
        });
      } else {
        setProfileImage({
          uri: imageData?.uri,
          name: imageData?.fileName,
          type: imageData?.type,
        });
      }
    }
    setVisible(false);
  }, [imageData, updatingBanner]);

  return (
    <View>
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
          resetForm,
          setFieldValue,
        }) => (
          <>
            <KeyboardAwareScrollView style={styles.scrollview}>
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
                <Card style={styles.cardContainer}>
                  <View style={styles.banner}>
                    <Image
                      source={
                        bannerImage // If a new banner is selected or captured, show it
                          ? {uri: bannerImage?.uri}
                          : user?.banner_image // Else, show the user’s banner if it exists
                          ? {uri: user?.banner_image}
                          : images.profileBg // Fallback to default banner image
                      }
                      style={styles.imageStyle}
                    />
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleImageCapture(true)}>
                      <Image source={images.edit} style={styles.editImage} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.profileConatiner}>
                    <View style={styles.imagecontainer}>
                      <Image
                        source={
                          profileImage
                            ? {uri: profileImage?.uri}
                            : user?.profile_image
                            ? {uri: user?.profile_image}
                            : images.user2
                        }
                        style={[styles.imageStyle, {borderRadius: vw * 15}]}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.camBg}
                      onPress={() => handleImageCapture(false)}>
                      <View style={styles.camcontainer}>
                        <Image
                          source={images.camera}
                          style={styles.imageStyle}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <RegularTextInput
                      label="Full Name *"
                      placeholder="Enter Full Name"
                      placeholderTextColor="#9B9797"
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      value={values.username}
                      submitted={submitted}
                      errors={errors.username}
                      labelStyle={styles.txt}
                    />
                    <PhoneNumberInput
                      initialNumber={values.contactNo}
                      onNumberChange={handleChange('contactNo')}
                      label="Phone Number *"
                      submitted={submitted}
                      errors={errors.contactNo}
                      labelStyle={styles.txt}
                      onChangeCountry={handleChange('countryCode')}
                    />

                    <View>
                      <InterRegular style={styles.label}>
                        Date of Birth *
                      </InterRegular>

                      {/* <TouchableOpacity onPress={() => setOpenDate(true)}>
                        <View style={[styles.textinputbox]}>
                          <InterLight>
                            {values.birthdate
                              ? moment(values.birthdate).format('MM/DD/YYYY')
                              : 'mm/dd/yyyy'}
                          </InterLight>
                          <Image
                            source={images.calendericon}
                            style={styles.calendericon}
                          />
                        </View>
                      </TouchableOpacity>
                      <DatePicker
                        modal
                        mode="date"
                        open={openDate}
                        date={date}
                        onConfirm={date => {
                          setOpenDate(false);
                          setDate(date);
                          setFieldValue(
                            'birthdate',
                            moment(date).format('YYYY-MM-DD'),
                          );
                        }}
                        onCancel={() => {
                          setOpenDate(false);
                        }}
                      /> */}
                      <View style={[styles.textinputbox]}>
                        <DatePickerInput
                          label="Date of Birth"
                          error={errors.birthdate}
                          initialDate={dayjs(
                            values.birthdate,
                            'MM//DD//YYYY',
                          ).toDate()}
                          placeholder="mm/dd/yyyy"
                          onDateChange={e => setFieldValue('birthdate', e)}
                          style={{
                            width: vw * 80,
                            height: vh * 6,
                            justifyContent: 'center',
                          }}
                          maxDate
                        />
                        <Image
                          source={images.calendericon}
                          style={styles.calendericon}
                        />
                      </View>
                    </View>

                    <CustomButton
                      style={{alignSelf: 'center'}}
                      onPress={handleSubmit}
                      loading={submitted}>
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
              title="Successfully"
              message="Profile Updated Successfully"
              buttonText="Ok"
              primaryBtn={true}
              onPress={() => {
                setProfileUpdateModal(false);
                setProfileDetails(true);
                navigation.navigate('Home');
              }}
            />
          </>
        )}
      </Formik>
    </View>
  );
};

export default MyProfileUpdate;
