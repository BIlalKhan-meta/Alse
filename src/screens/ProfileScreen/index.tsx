import React, {useEffect, useState} from 'react';
import {View, Text, Image, ScrollView, FlatList} from 'react-native';
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
import {reactions} from '../../dummyData';
import CommentsModal from '../../components/CommentsModal';
import {
  blockUser,
  getCommentPost,
  getProfileById,
  likePost,
  postSave,
  updateLike,
} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import Loader from '../../components/Loader';
import {getMessage, Toast} from '../../utils/helpers';
import {capitalize, timeFormat} from '../../utils';
import {fetchProfileById, reportPost} from '../../api/home';
import {removeSavedItem, saveItem} from '../../api/menu';
import {EmptyComponent} from '../../components/EmptyComponent';

const ProfileScreen: React.FC = ({navigation}) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const route = useRoute();
  const account =
    route?.params?.account === 2 || route?.params?.account === 1
      ? 'public'
      : 'private';

  const id = route?.params?.id;

  const [modalVisible, setModalVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null,
  });
  const [reportSuccess, setReportSuccess] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);
  const [reactVisible, setrRactVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState({
    visiblity: false,
    comments: [],
    id: null,
  });
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [blockUserLoader, setBlockUserLoader] = useState(false);
  const [reportLoader, setReportLoader] = useState(false);

  const handleDotPress = (postId: number) => {
    setActivePostId(activePostId == null ? postId : null);
  };

  const getData = () => {
    if (id) {
      setLoading(true);
      fetchProfileById(id)
        .then(res => {
          if (res?.data) {
            console.log('res?.data?.data ====>', res?.data?.data);

            setData(res?.data?.data);
          }
        })
        .catch(err => console.log('ERRORRRRRR', err))
        .finally(() => {
          setLoading(false);
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

  const handleReport = async () => {
    console.log(reportVisible.id, 'Reportttt idddddd');
    setReportLoader(true);
    const data = {
      reportable_type: 'AppModelsPost',
      reportable_id: reportVisible?.id,
      reason: 'testingg',
    };

    let formData = new FormData();
    Object.entries(data).forEach(item => {
      formData.append(item[0], item[1]);
    });
    await reportPost(formData)
      // .unwrap()
      .then(res => {
        setReportVisible({
          visibility: false,
          id: null,
        });
        setReportLoader(false);
        getData();
        setReportSuccess(true);
        handleDotPress(null);
      })
      .catch(err => {
        setReportLoader(false);
        setReportVisible({
          visibility: false,
          id: null,
        });
        handleDotPress(null);
        Toast.error(getMessage(err?.message));

        console.log('Errorr  errerrerrerrerrerrerrerrerrfrom ', err);
      });
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
  const handleSave = async (id: number, isSaved: boolean) => {
    const arr = [...data?.posts];
    let index = arr.findIndex(item => item.id == id);
    arr[index].is_saved = !arr[index].is_saved;
    setData({...data, posts: arr});
    dispatch(postSave(id));
    const data = {
      item_id: id,
      item_type: 'post',
    };
    const form = new FormData();
    Object.entries(data).map(([key, value]) => {
      form.append(key, value);
    });
    if (isSaved) {
      await removeSavedItem(form)
        .then(res => console.log('SAVEDDD POSTTTTT REMOOVEEEDDDD', res))
        .catch(err => console.log('ERRRORRRRRRRRR SAVEDDDDDDDDDDD', err));
    } else {
      await saveItem(form)
        .then(res => console.log('POSTTTT SAVEEEDDDDDDD', res))
        .catch(err => console.log('SAVEEEEDDDDDD POSTTTTT ERRORRRRRR', err));
    }
  };

  const handleLikePress = (id: number) => {
    const arr = [...data?.posts];
    let index = arr.findIndex(item => item.id == id);
    arr[index].is_liked = !arr[index].is_liked;
    setData({...data, posts: arr});
    dispatch(updateLike(id));
    dispatch(likePost(id));
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
      key={item?.id}
      avatar={item?.avatar}
      name={item?.name}
      account={item?.privacy}
      time={timeFormat(item?.date)}
      postText={item?.description}
      postImage={item?.media[0]?.path}
      likes={item?.total_likes}
      comments={item?.total_comments}
      share={item?.share}
      onDotPress={() => handleDotPress(item?.id)}
      modalVisible={activePostId === item.id}
      // onLikePress={() => setrRactVisible(true)}
      // onCommnetPress={() => setCommentsVisible(true)}
      onCommnetPress={() => handleCommentPress(item?.id)}
      onSavePress={() => handleSave(item?.id, item?.is_saved)}
      isLiked={item?.is_liked}
      isSaved={item?.is_saved}
      onLikePress={() => handleLikePress(item?.media[0]?.post_id)}
      handleReportPost={() => {
        setReportVisible({visibility: true, id: item?.id});
      }}
      handleReportPress={() => {
        navigation.navigate('CreatePostEdit', {
          title: 'Edit Post',
          data: item,
        });
      }}
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
            stats={`${data?.posts?.length} posts   ${data?.followers?.length} followers   ${data?.following?.length} following`}
            avatar={data?.avatar}
            onPress={handleOpen}
            isFollowing={data?.is_following}
            isRequested={data?.is_follow_requested}
            private={data?.is_private}
            id={data?.id}
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

        {!data?.is_private || data?.is_following ? (
          <>
            <FlatList
              data={data?.posts}
              keyExtractor={item => item.id.toString()}
              renderItem={renderPost}
              ListEmptyComponent={<EmptyComponent text={'No Posts Found'} />}
            />
          </>
        ) : null}

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
        {data?.is_private && !data?.is_following ? (
          <Card style={styles.lockContainer}>
            <Image source={images.lock} />

            <InterMedium style={styles.lockTxt}>
              This Account is Private
            </InterMedium>
          </Card>
        ) : null}

        <GeneralModal
          visible={reportVisible.visibility}
          closeModal={() =>
            setReportVisible({
              visibility: false,
              id: null,
            })
          }
          icon={images.qmark}
          title="Report Post"
          message="Are you sure you want to report this post?"
          SecondaryText1="Yes"
          SecondaryText2="No"
          onPress={handleReport}
          secondaryBtn={true}
          loading={reportLoader}
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
