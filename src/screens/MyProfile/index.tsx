import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

import { useLayoutEffect, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import GeneralModal from '../../components/GeneralModal';
// import CheckedIcon from '../../assets/icons/CheckedIcon.png'
import { colors } from '../../utils/theme';
// import ProfileModal from '../../components/ProfileModal';
import { images } from '../../utils/images';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import Card from '../../components/Card';
import ReportBlockModal from '../../components/ReportBlockModal';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../../store/slices/authSlice';
import { vw } from '../../constant';

const MyProfile: React.FC = () => {
  const navigation = useNavigation()
  const user = useSelector(selectUserProfile);

  const [profileDetails, setProfileDetails] = useState<boolean>(true);
  const [profileUpdate, setProfileUpdate] = useState<boolean>(false);
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [submitted2, setSubmitted2] = useState<boolean>(false);
  const [secureCurrentPassword, setSecureCurrentPassword] = useState<boolean>(true);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [secureCPassword, setSecureCPassword] = useState<boolean>(true);
  const [profileUpdateModal, setProfileUpdateModal] = useState<boolean>(false);
  const [changePasswordModal, setChangePasswordModal] = useState<boolean>(false);
  const [imageModal, setImageModal] = useState<boolean>(false);

  const options = [
    { text: 'Private', onPress: () => handlePrivatePress() },
    { text: 'Public', onPress: () => handlePublicPress() },
  ];

  const handlePrivatePress = () => {
    setModalVisible(false)
  }

  const handlePublicPress = () => {
    setModalVisible(false)
  }



  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor
      },
      headerRight: () => (
        <View style={{}}>

          <TouchableOpacity onPress={() => {
            setModalVisible(!modalVisible)
            // setImageModal(true)
          }}>
            <Image
              source={images.dots}
              style={styles.threeDots}
            />


          </TouchableOpacity>


        </View>
      ),
    });
  }, [navigation, modalVisible]);


  console.log('====================================');
  console.log(user, "IDdddd", "Acccounttt");
  console.log('====================================');

  return (
    <View>


      <View style={styles.container}>


        <Card style={styles.cardContainer}>

          <View style={styles.banner}>
            <Image source={images.profileBg} style={styles.imageStyle} />

          </View>

          <View style={styles.imagecontainer}>

            <Image source={user?.avatar ? { uri: user?.avatar } : images.user2} style={[styles.imageStyle, { borderRadius: vw * 15 }]} />
          </View>

          <TouchableOpacity style={styles.btnConatiner2}
            onPress={() => navigation.navigate("MyProfilePassword")}>
            <InterMedium style={styles.editTxt}>Change Password</InterMedium>
          </TouchableOpacity>
          <InterMedium style={styles.username}>{user?.full_name}</InterMedium>
          <InterMedium style={styles.email}>{user?.email}</InterMedium>

          <View style={styles.profileBtn}>
            <InterRegular style={styles.profileTxt}>{user?.is_private == 0 ? "Public" : "Private"}</InterRegular>
          </View>


          <View style={styles.contentContainer}>

            <View style={styles.headingConatiner}>
              <InterMedium style={styles.txt}>Phone Number</InterMedium>
              <InterMedium style={styles.txt}>Age</InterMedium>

            </View>

            <View style={styles.txtConatiner}>
              <InterMedium style={styles.phoneTxt}>{user?.dialing_code + user?.phone_number}</InterMedium>
              <InterMedium style={styles.phoneTxt}>{user?.age}</InterMedium>
            </View>

            <View style={styles.headingConatiner}>
              <InterMedium style={styles.txt}>Birth Date</InterMedium>
              <InterMedium style={styles.txt}>Gender</InterMedium>

            </View>

            <View style={styles.txtConatiner}>
              <InterMedium style={styles.phoneTxt}>{user?.dob}</InterMedium>
              <InterMedium style={styles.phoneTxt}>{user?.gender}</InterMedium>
            </View>


          </View>





          <CustomButton style={styles.btnConatiner}
            onPress={() => navigation.navigate("MyProfileUpdate")}>
            EDIT PROFILE
          </CustomButton>

        </Card>





      </View>




      <ReportBlockModal
        isVisible={modalVisible}
        options={options}
        onClose={() => setModalVisible(false)}
      // style={{ top: 55 }}
      />



    </View>
  );
};

export default MyProfile;
