// ProfileScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import styles from './styles';
import {images} from '../../utils/images';
import Card from '../../components/Card';
import InterMedium from '../../components/Text/InterMedium';
import ProfileCard from '../../components/ProfileCard';
import PostComponent from '../../components/PostComponent';
import {useIsFocused, useRoute} from '@react-navigation/native';
import ReportBlockModal from '../../components/ReportBlockModal';
import GeneralModal from '../../components/GeneralModal';
import ReactModal from '../../components/ReactModal';
import {dummyComments, reactions} from '../../dummyData';
import CommentsModal from '../../components/CommentsModal';
import {
  blockUser,
  getCommentPost,
  getProfileById,
  likePost,
} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import dayjs from 'dayjs';
import Loader from '../../components/Loader';
import {getMessage, Toast} from '../../utils/helpers';
import {capitalize} from '../../utils';

const ProfileScreen: React.FC = ({navigation}) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const route = useRoute();
  const account =
    route?.params?.account === 2 || route?.params?.account === 1
      ? 'public'
      : 'private';

  const id = route?.params?.id;
  // console.log('====================================');
  // console.log(id, "IDdddd", route?.params?.account, "Acccounttt");
  // console.log('====================================');
  const [modalVisible, setModalVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);
  const [reactVisible, setrRactVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState({
    visiblity: false,
    comments: [],
    id: null,
  });
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [blockUserLoader, setBlockUserLoader] = useState(false);

  const getData = () => {
    if (id) {
      setLoading(true);
      dispatch(getProfileById(id))
        .unwrap()
        .then(res => {
          console.log(
            'response from User Profile ====================>',
            res?.data?.data,
          );
          setData(res?.data?.data);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          console.log('Error from get Profile By IUd ==>', err);
        });
    }
  };

  useEffect(() => {
    getData();
  }, [isFocused, id]);

  const handleReportPress = () => {
    setModalVisible(false);
    setReportVisible(true);
  };

  const handleBlockPress = () => {
    setModalVisible(false);
    setBlockVisible(true);
  };

  const handleBlockUser = () => {
    setBlockUserLoader(true);
    dispatch(blockUser(id))
      .then(res => {
        setBlockUserLoader(false);
        // setModalVisible(false);
        // setBlockVisible(true);
        setBlockVisible(false);
        setBlockSuccess(true);
        console.log('res from block User ====>', res);
      })
      .catch(err => {
        setBlockUserLoader(false);

        console.log('error from block User ====>', err);
        Toast.error(getMessage(err));
      });
  };

  const handleCommentPress = id => {
    dispatch(getCommentPost(id))
      .then(res => {
        console.log(
          res?.payload?.data?.data?.data,
          'Commentsss Ressss frommm screennnn ',
        );
        setCommentsVisible({
          visiblity: true,
          comments: res?.payload?.data?.data?.data,
          id: id,
        });
        // getData();
      })
      .catch(err => {
        console.log('error from like post', err);
      });
  };

  const handleLikePress = (id: number) => {
    dispatch(likePost(id))
      .then(res => {
        console.log('response from like post ---->', res);
        getData();
      })
      .catch(err => {
        console.log('error from like post', err);
      });
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleOpen = () => {
    setModalVisible(!modalVisible);
  };

  const options = [
    {text: 'Report', onPress: () => handleReportPress()},
    {text: 'Block', onPress: () => handleBlockPress()},
  ];

  if (loading) {
    return <Loader />;
  }

  const renderPost = ({item, index}) => (
    <PostComponent
      key={index}
      avatar={item.avatar}
      name={item.name}
      account={item.privacy}
      time={dayjs(item?.media[0]?.date).format('hh:MM A')}
      postText={item?.description}
      postImage={item?.media[0]?.path}
      likes={item.likes}
      comments={item.comments}
      share={item.share}
      // onLikePress={() => setrRactVisible(true)}
      // onCommnetPress={() => setCommentsVisible(true)}
      onCommnetPress={() => handleCommentPress(item?.media[0]?.post_id)}
      isLiked={item?.is_liked}
      onLikePress={() => handleLikePress(item?.media[0]?.post_id)}
    />
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <Card>
          <ProfileCard
            name={
              data?.full_name ||
              capitalize(data?.first_name) + ' ' + capitalize(data?.last_name)
            }
            // description="A Freelance Photographer living best life"
            stats={`${data?.posts.length} posts   ${data?.followers.length} followers   ${data?.following.length} following`}
            avatar={data?.avatar}
            onPress={handleOpen}
            isFollowing={data?.is_following}
            id={data?.posts[0]?.user_id}
          />
          {/* <ReportBlockModal
            isVisible={modalVisible}
            reportButtonText="Report"
            blockButtonText="Block"
            onReportPress={handleReportPress}
            onBlockPress={handleBlockPress}
            onClose={() => setModalVisible(false)}
          /> */}

          <ReportBlockModal
            isVisible={modalVisible}
            options={options}
            onClose={() => setModalVisible(false)}
            style={{top: 55}}
          />
        </Card>

        {account == 'public' && (
          <>
            <FlatList
              data={data?.posts}
              keyExtractor={item => item.id.toString()}
              renderItem={renderPost}
              ListEmptyComponent={<Text>No Posts Found</Text>}
            />

            {/* {posts.map((post, index) => (
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
                onLikePress={() => setrRactVisible(true)}
                onCommnetPress={() => setCommentsVisible(true)}

              />
            ))} */}
          </>
        )}

        <CommentsModal
          visible={commentsVisible.visiblity}
          closeModal={() => {
            setCommentsVisible({visiblity: false, comments: [], id: null});
            getData();
          }}
          // icon={CheckedIcon}
          title="Successfully"
          message="Password has been updated successfully"
          buttonText="Apply"
          onPress={() => navigation.navigate('Home')}
          comments={commentsVisible?.comments}
          postId={commentsVisible?.id}
        />
        <ReactModal
          visible={reactVisible}
          closeModal={() => setrRactVisible(false)}
          reactions={reactions}
        />

        {account == 'private' && (
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
          title="Report User"
          message="Are you sure you want to report this user?"
          SecondaryText1="Yes"
          SecondaryText2="No"
          onPress={() => {
            setReportVisible(false);
            setReportSuccess(true);
          }}
          secondaryBtn={true}
        />

        <GeneralModal
          visible={reportSuccess}
          closeModal={() => setReportSuccess(false)}
          icon={images.checkedIcon}
          title="Report User"
          message="User has been reported successfully!"
          buttonText="Ok"
          onPress={() => {
            setReportSuccess(false);
            navigation.navigate('Profile', {account: account});
          }}
          primaryBtn={true}
        />

        <GeneralModal
          visible={blockVisible}
          closeModal={() => setBlockVisible(false)}
          icon={images.qmark}
          title="Block User"
          message="Are you sure you want to block this user?"
          SecondaryText1="Yes"
          SecondaryText2="No"
          // onPress={() => {
          //   setBlockVisible(false)
          //   setBlockSuccess(true)

          // }}
          secondaryBtn={true}
          onPress={handleBlockUser}
          loading={blockUserLoader}
        />

        <GeneralModal
          visible={blockSuccess}
          closeModal={() => setBlockSuccess(false)}
          icon={images.checkedIcon}
          title="Block User"
          message="User has been blocked successfully!"
          buttonText="Ok"
          onPress={() => {
            setBlockSuccess(false);
            navigation.navigate('Profile', {account: account});
          }}
          primaryBtn={true}
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
