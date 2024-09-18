import React, { useState } from 'react';
import { View, ScrollView, TouchableWithoutFeedback, FlatList } from 'react-native';
import { images } from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import PostComponent from '../../components/PostComponent';
import CommentsModal from '../../components/CommentsModal';
import ReactModal from '../../components/ReactModal';
import GeneralModal from '../../components/GeneralModal';
import { dummyComments, reactions } from '../../dummyData';
import HeaderComponent from '../../components/HeaderComponent';

const posts = [
  {
    id: 1,
    avatar: images.user,
    name: 'John Doe',
    country: 'Newyork, USA',
    time: '12:30 AM',
    postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
    postImage: images.postImage1,
    likes: 120,
    comments: 45,
    share: 25,
    account: "public"
  },
  {
    id: 2,
    avatar: images.user,
    name: 'Jane Smith',
    country: 'UK',
    time: '5h ago',
    postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
    postImage: images.postImage2,
    likes: 80,
    comments: 20,
    share: 10,
    account: "private"
  },
  // Add more posts as needed
];

const Home: React.FC = () => {
  const navigation = useNavigation();
  const [commentsVisible, setCommentsVisible] = useState<boolean>(false);
  const [reactVisible, setrRactVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleDotPress = (postId: number) => {
    setActivePostId(postId ? postId : null);
  };

  const renderPost = ({ item }) => (
    <PostComponent
      avatar={item.avatar}
      name={item.name}
      country={item.country}
      time={item.time}
      postText={item.postText}
      postImage={item.postImage}
      likes={item.likes}
      comments={item.comments}
      share={item.share}
      account={item.account}
      onCommnetPress={() => setCommentsVisible(true)}
      onSavePress={() => navigation.navigate("Saved")}
      onLikePress={() => setrRactVisible(true)}
      onDotPress={() => handleDotPress(item.id)}
      modalVisible={activePostId === item.id}
      handleBlockPress={() => {
        handleDotPress();
        setDeleteVisible(true);
      }}
      handleReportPress={() => {
        handleDotPress();
        navigation.navigate("CreatePost", { title: "Edit Post" });
      }}
    />
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableWithoutFeedback onPress={() => handleDotPress(null)}>
        <View style={styles.container}>
          {/* <HeaderComponent
            label={'News Feed'}
            onBackPress={() => navigation.goBack()}
            notifiVisible={true}
            onNofiPress={() => navigation.navigate("Notifications")}
            searchVisible={true}
          /> */}

          <CardComponent
            onImagePress={() => navigation.navigate("CreatePost")}
            onVideoPress={() => navigation.navigate("CreatePost")}
          />

          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />

          <CommentsModal
            visible={commentsVisible}
            closeModal={() => setCommentsVisible(false)}
            title='Successfully'
            message='Password has been updated successfully'
            buttonText='Apply'
            onPress={() => navigation.navigate("Home")}
            comments={dummyComments}
          />

          <ReactModal
            visible={reactVisible}
            closeModal={() => setrRactVisible(false)}
            reactions={reactions}
          />

          <GeneralModal
            visible={deleteVisible}
            closeModal={() => setDeleteVisible(false)}
            icon={images.qmark}
            title='Delete Post'
            message='Are you sure you want to delete this Post?'
            SecondaryText1='Yes'
            SecondaryText2='No'
            onPress={() => {
              setDeleteVisible(false);
              setDeleteSuccess(true);
            }}
            secondaryBtn={true}
          />

          <GeneralModal
            visible={deleteSuccess}
            closeModal={() => setDeleteSuccess(false)}
            icon={images.checkedIcon}
            title='Delete Post'
            message='Post has been deleted successfully.'
            buttonText='Ok'
            onPress={() => {
              setDeleteSuccess(false);
            }}
            primaryBtn={true}
          />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default Home;
