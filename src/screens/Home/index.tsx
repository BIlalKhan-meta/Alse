// Home.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { images } from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import { useNavigation } from '@react-navigation/native';
import HeaderComponent from '../../components/HeaderComponent';
import styles from './styles';

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
    account: "public"
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
    account: "private"

  },
  // Add more posts as needed
];


const dummyComments = [
  {
    id: 1,
    userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    userName: 'John Doe',
    userImage: 'https://via.placeholder.com/150',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 2,
    userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    userName: 'Jane Smith',
    userImage: 'https://via.placeholder.com/150',
    comment: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 3,
    userAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    userName: 'Mike Johnson',
    userImage: 'https://via.placeholder.com/150',
    comment: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

const Home: React.FC = () => {
  const navigation = useNavigation();

  const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>

        <HeaderComponent
          label={'News Feed'}
          onBackPress={() => navigation.goBack()}
          notifiVisible={true}
          searchVisible={true}
        />


        <CardComponent
          onTextInput={() => navigation.navigate("CreatePost")}
        />

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
            account={post.account}
            onCommnetPress={() => setCommentsVisible(true)}
            onSavePress={() => navigation.navigate("Saved")}
          />
        ))}

        <CommentsModal
          visible={commentsVisible}
          closeModal={() => setCommentsVisible(false)}
          // icon={CheckedIcon}
          title='Successfully'
          message='Password has been updated successfully'
          buttonText='Apply'
          onPress={() => navigation.navigate("Home")}
          comments={dummyComments}
        />

      </View>
    </ScrollView>
  );
};



export default Home;
