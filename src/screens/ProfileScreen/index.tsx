import React, {useEffect, useRef, useState} from 'react';
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
import {createPost, fetchProfileById, reportPost} from '../../api/home';
import {removeSavedItem, saveItem} from '../../api/menu';
import {EmptyComponent} from '../../components/EmptyComponent';
import LikesModal from '../../components/LikesModal';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {vh} from '../../constant';

const ProfileScreen: React.FC = ({navigation}) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const route = useRoute();
  const account =
    route?.params?.account === 2 || route?.params?.account === 1
      ? 'public'
      : 'private';

  const flatListRef = useRef(null);
  const id = route?.params?.id;

  const [modalVisible, setModalVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null,
  });
  const [reportUser, setReportUser] = useState(false);
  const [shareLoader, setShareLoader] = useState(false);

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
  const [loading, setLoading] = useState(true);
  const [blockUserLoader, setBlockUserLoader] = useState(false);
  const [reportLoader, setReportLoader] = useState(false);
  const [likesVisible, setLikesVisible] = useState({
    visiblity: false,
    likes: [],
    id: null,
  });
  const [pause, setPause] = useState(false);
  const [currendId, setCurrentID] = useState(0);
  const handleVideoPause = id => {
    setPause(!pause);
    setCurrentID(id);
  };
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleDotPress = (postId: number) => {
    setActivePostId(activePostId == null ? postId : null);
  };

  const getData = async () => {
    setLoading(true);
    await fetchProfileById(id)
      .then(res => {
        if (res?.data?.data) {
          console.log('res?.data?.data ====>', res?.data?.data);

          setData(res?.data?.data);
        }
      })
      .catch(err => console.log('ERRORRRRRR', err))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [isFocused, id]);

  console.log('RESSSSSSSSSSSSS', id);

  const handleReportPress = () => {
    setModalVisible(false);
    setReportUser(true);
  };

  const sharePost = async form => {
    setShareLoader(true);
    await createPost(form)
      .then(res => {
        if (res?.data) {
          navigation.goBack();
          console.log('POSTTTTTT SHAREDDDDDDDDDDDDDDDD');
        }
      })
      .catch(err => console.log('ERORRRRRRR', err))
      .finally(() => {
        setShareLoader(false);

        // setLoading(false);
      });
  };

  const handleReport = async (status: string) => {
    setReportLoader(true);
    const data = {
      reportable_type: status == 'User' ? `User` : `Post`,
      reportable_id: status == 'User' ? id : reportVisible.id,
      reason: `Report`,
    };

    let formData = new FormData();
    Object.entries(data).forEach(item => {
      formData.append(item[0], item[1]);
    });

    console.log(JSON.stringify(formData, null, 4));
    await reportPost(formData)
      // .unwrap()
      .then(res => {
        if (res?.data) {
          console.log('RESSSSSSSSSSSSSSSS', res?.data);
          setReportVisible({
            visibility: false,
            id: null,
          });
          setReportLoader(false);
          // getData();
          setReportSuccess(true);
          handleDotPress(null);
          navigation.goBack();
        }
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
  const user = useSelector(selectUserProfile);

  const handleLikePress = (id: number) => {
    const arr = [...data?.posts];
    let index = arr.findIndex(item => item.id == id);
    arr[index].is_liked = !arr[index].is_liked;

    const tempData = {
      id: Math.random(),
      user: {
        id: user?.id,
        avatar: user?.avatar ? user?.avatar : images.profile,
        full_name: user?.full_name ? user?.full_name : '',
      },
    };
    const find = arr[index]?.likes.findIndex(val => val?.user?.id == user?.id);

    if (find > -1) {
      arr[index]?.likes.splice(find, 1);
    } else {
      arr[index]?.likes.push(tempData);
    }
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

  const renderPost = ({item, index}) => {
    const isFocused = focusedIndex === index;
    // console.log(
    //   'ISFOCUSEDDDDDDDDDDDDD',
    //   isFocused,
    //   index,
    //   item?.media[0]?.path,
    // );

    return (
      <>
        <PostComponent
          isFocused={isFocused}
          // key={item?.id.toString()}
          avatar={item?.avatar}
          name={item?.name}
          account={item?.privacy}
          time={timeFormat(item?.date)}
          postText={item?.description}
          postImage={item?.media[0]?.path}
          mediaType={item?.media[0]?.type}
          likes={item?.total_likes}
          comments={item?.total_comments}
          share={item?.share}
          onDotPress={() => handleDotPress(item?.id)}
          modalVisible={activePostId === item.id}
          isPaused={pause && currendId == item?.id}
          handleVideoPause={() => handleVideoPause(item?.id)}
          // onLikePress={() => setrRactVisible(true)}
          // onCommnetPress={() => setCommentsVisible(true)}
          onCommnetPress={() => handleCommentPress(item?.id)}
          onSavePress={() => handleSave(item?.id, item?.is_saved)}
          onLikesModal={() =>
            setLikesVisible({visiblity: true, likes: item?.likes, id: item?.id})
          }
          shareLoader={shareLoader}
          isLiked={item?.is_liked}
          isSaved={item?.is_saved}
          onLikePress={() => handleLikePress(item?.id)}
          handleReportPost={() => {
            setReportVisible({visibility: true, id: item?.id});
          }}
          sharePost={sharePost}
          handleReportPress={() => {
            navigation.navigate('CreatePostEdit', {
              title: 'Edit Post',
              data: item,
            });
          }}
        />
      </>
    );
  };

  const onViewableItemsChanged = ({viewableItems}) => {
    // Play only the currently focused video
    console.log('ITEMSSSSSSSSS', viewableItems);
    const focusedIndex = viewableItems[0]?.index;
    setFocusedIndex(focusedIndex);
  };

  const viewabilityConfig = useRef({
    waitForInteraction: true,
    // At least one of the viewAreaCoveragePercentThreshold or itemVisiblePercentThreshold is required.
    // viewAreaCoveragePercentThreshold: 95,
    itemVisiblePercentThreshold: 75,
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {data?.is_private && !data?.is_following ? (
        <Card style={{height: vh * 50}}>
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
          <ReportBlockModal
            isVisible={modalVisible}
            options={options}
            onClose={() => setModalVisible(false)}
            style={{top: 55}}
          />
        </Card>
      ) : null}

      {!data?.is_private || data?.is_following ? (
        <>
          <FlatList
            ref={flatListRef}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => {
              return (
                <Card>
                  <ProfileCard
                    name={
                      data?.full_name ||
                      capitalize(data?.first_name) +
                        ' ' +
                        capitalize(data?.last_name)
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

                  <ReportBlockModal
                    isVisible={modalVisible}
                    options={options}
                    onClose={() => setModalVisible(false)}
                    style={{top: 55}}
                  />
                </Card>
              );
            }}
            data={data?.posts}
            viewabilityConfig={viewabilityConfig.current}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{paddingBottom: vh * 4}}
            renderItem={renderPost}
            onViewableItemsChanged={onViewableItemsChanged}
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
        onPress={() => handleReport('Post')}
        secondaryBtn={true}
        loading={reportLoader}
      />
      <GeneralModal
        visible={reportUser}
        closeModal={() => setReportUser(!reportUser)}
        icon={images.qmark}
        title="Report User"
        message="Are you sure you want to report this user?"
        SecondaryText1="Yes"
        SecondaryText2="No"
        onPress={() => handleReport('User')}
        secondaryBtn={true}
        loading={reportLoader}
      />

      <LikesModal
        visible={likesVisible.visiblity}
        likes={likesVisible.likes}
        closeModal={() => {
          setLikesVisible({visiblity: false, likes: [], id: null});
        }}
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
  );
};

export default ProfileScreen;
