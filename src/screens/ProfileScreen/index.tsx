// ProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import styles from './styles';
import { images } from '../../utils/images';
import Card from '../../components/Card';
import CustomButton from '../../components/CustomButton';
import { vw } from '../../constant';
import InterBold from '../../components/Text/InterBold';
import InterMedium from '../../components/Text/InterMedium';
import ProfileCard from '../../components/ProfileCard';
import PostComponent from '../../components/PostComponent';
import { useRoute } from '@react-navigation/native';
import ReportBlockModal from '../../components/ReportBlockModal';
import GeneralModal from '../../components/GeneralModal';

const ProfileScreen: React.FC = ({ navigation }) => {

  const route = useRoute();
  const account = route?.params?.account;

  const [modalVisible, setModalVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);

  const handleReportPress = () => {
    setModalVisible(false);
    setReportVisible(true)
  };

  const handleBlockPress = () => {
    setModalVisible(false);
    setBlockVisible(true)
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleOpen = () => {
    setModalVisible(!modalVisible);
  };


  const posts = [
    {
      avatar: `${images.user}`,
      name: 'John Doe',
      country: 'Newyork, USA',
      time: '12:30 AM',
      postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
      postImage: `${images.postImage1}`,
      likes: 120,
      comments: 45,
      share: 25,
    },
    {
      avatar: `${images.user}`,
      name: 'Jane Smith',
      country: 'UK',
      time: '5h ago',
      postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
      postImage: `${images.postImage2}`,
      likes: 80,
      comments: 20,
      share: 10,
    },
    // Add more posts as needed
  ];
  return (
    <ScrollView>

      <View style={styles.container}>
        <Card>
          <ProfileCard
            name="Marvel Edward"
            description="A Freelance Photographer living best life"
            stats="30 posts   50 followers   50 following"
            avatar={images.user2}
            onPress={handleOpen}
          />
          <ReportBlockModal
            isVisible={modalVisible}
            onReportPress={handleReportPress}
            onBlockPress={handleBlockPress}
            onClose={handleClose}
          />
        </Card>





        {account == "public" && (
          <>
            {posts.map((post, index) => (
              <PostComponent
                key={index}
                avatar={post.avatar}
                name={post.name}
                country={post.country}
                time={post.time}
                postText={post.postText}
                postImage={post.postImage}
                likes={post.likes}
                comments={post.comments}
                share={post.share}
              />
            ))}
          </>
        )}

        {account == "private" && (
          <Card style={styles.lockContainer}>
            <Image source={images.lock} />

            <InterMedium style={styles.lockTxt}>
              This Account is Private
            </InterMedium>
          </Card>
        )}


        <GeneralModal
          visible={reportVisible}
          closeModal={() => setReportVisible(false)}
          icon={images.qmark}
          title='Report User'
          message='Are you sure you want to report this user?'
          SecondaryText1='Yes'
          SecondaryText2='No'
          onPress={() => {
            setReportVisible(false)
            setReportSuccess(true)

          }}
          secondaryBtn={true}
        />

        <GeneralModal
          visible={reportSuccess}
          closeModal={() => setReportSuccess(false)}
          icon={images.checkedIcon}
          title='Report User'
          message='User has been reported successfully!'
          buttonText='Ok'
          onPress={() => {
            setReportSuccess(false)
            navigation.navigate("Profile", { account: account })
          }}
          primaryBtn={true}
        />

        <GeneralModal
          visible={blockVisible}
          closeModal={() => setBlockVisible(false)}
          icon={images.qmark}
          title='Block User'
          message='Are you sure you want to block this user?'
          SecondaryText1='Yes'
          SecondaryText2='No'
          onPress={() => {
            setBlockVisible(false)
            setBlockSuccess(true)

          }}
          secondaryBtn={true}
        />

        <GeneralModal
          visible={blockSuccess}
          closeModal={() => setBlockSuccess(false)}
          icon={images.checkedIcon}
          title='Block User'
          message='User has been blocked successfully!'
          buttonText='Ok'
          onPress={() => {
            setBlockSuccess(false)
            navigation.navigate("Profile", { account: account })
          }}
          primaryBtn={true}
        />


      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
