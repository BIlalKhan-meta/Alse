import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import styles from './styles';
import {images} from '../../../utils/images';
import Card from '../../../components/Card';
import InterMedium from '../../../components/Text/InterMedium';
import ProfileCard from '../../../components/ProfileCard';
import PostComponent from '../../../components/PostComponent';
import {useIsFocused, useRoute} from '@react-navigation/native';
import ReportBlockModal from '../../../components/ReportBlockModal';
import GeneralModal from '../../../components/GeneralModal';
import ReactModal from '../../../components/ReactModal';
import {reactions} from '../../../dummyData';
import CommentsModal from '../../../components/CommentsModal';
import {
  blockUser,
  getProfileById,
  likePost,
  postSave,
  updateLike,
} from '../../../store/slices/homeSlice';
import {useAppDispatch} from '../../../hooks/storeHooks';
import Loader from '../../../components/Loader';
import {getMessage, Toast} from '../../../utils/helpers';
import {capitalize, timeFormat} from '../../../utils';
import {createPost, fetchProfileById, reportPost} from '../../../api/home';
import {removeSavedItem, saveItem} from '../../../api/menu';
import {usePostComments} from '../../../hooks/usePostComments';
import {EmptyComponent} from '../../../components/EmptyComponent';
import LikesModal from '../../../components/LikesModal';
import {selectUserProfile} from '../../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {vh} from '../../../constant';
import GlobalHeader from '../../../components/GlobalHeader';
import {X} from 'lucide-react-native';

const getPostMediaUri = (post: any): string | null => {
  const media = post?.media?.[0];
  if (!media) {
    return null;
  }
  const uri =
    media.thumbnail_path ||
    media.medium_path ||
    media.path ||
    media.full_path ||
    media.url ||
    null;
  if (!uri || typeof uri !== 'string' || !uri.trim()) {
    return null;
  }
  return uri.trim();
};

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
  const {
    commentsVisible,
    isLoadingComments,
    isLoadingMore: isLoadingMoreComments,
    commentsError,
    hasMoreComments,
    openComments,
    closeComments,
    retryComments,
    loadMoreComments,
  } = usePostComments();
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [data, setData] = useState<any>({});
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
  const [selectedPost, setSelectedPost] = useState<any>(null);

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
    openComments(id);
  };
  const handleSave = async (id: number, isSaved: boolean) => {
    const arr = [...(data?.posts || [])];
    let index = arr.findIndex(item => item.id == id);
    if (index < 0) {
      return;
    }
    arr[index] = {...arr[index], is_saved: !arr[index].is_saved};
    setData({...data, posts: arr});
    if (selectedPost?.id === id) {
      setSelectedPost(arr[index]);
    }
    dispatch(postSave(id));
    const payload = {
      item_id: id,
      item_type: 'post',
    };
    if (isSaved) {
      await removeSavedItem(payload)
        .then(res => console.log('SAVEDDD POSTTTTT REMOOVEEEDDDD', res))
        .catch(err => console.log('ERRRORRRRRRRRR SAVEDDDDDDDDDDD', err));
    } else {
      await saveItem(payload)
        .then(res => console.log('POSTTTT SAVEEEDDDDDDD', res))
        .catch(err => console.log('SAVEEEEDDDDDD POSTTTTT ERRORRRRRR', err));
    }
  };
  const user = useSelector(selectUserProfile);

  const handleLikePress = (id: number) => {
    const arr = [...(data?.posts || [])];
    let index = arr.findIndex(item => item.id == id);
    if (index < 0) {
      return;
    }
    arr[index] = {
      ...arr[index],
      is_liked: !arr[index].is_liked,
      likes: Array.isArray(arr[index].likes) ? [...arr[index].likes] : [],
    };

    const tempData = {
      id: Math.random(),
      user: {
        id: user?.id,
        avatar: user?.avatar ? user?.avatar : images.profile,
        full_name: user?.full_name ? user?.full_name : '',
      },
    };
    const find = arr[index].likes.findIndex(
      (val: any) => val?.user?.id == user?.id,
    );

    if (find > -1) {
      arr[index].likes.splice(find, 1);
    } else {
      arr[index].likes.push(tempData);
    }
    setData({...data, posts: arr});
    if (selectedPost?.id === id) {
      setSelectedPost(arr[index]);
    }
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

  // const renderPost = ({item, index}) => {
  //   const isFocused = focusedIndex === index;
  //   // console.log(
  //   //   'ISFOCUSEDDDDDDDDDDDDD',
  //   //   isFocused,
  //   //   index,
  //   //   item?.media[0]?.path,
  //   // );

  //   return (
  //     <>
  //       <PostComponent
  //         isFocused={isFocused}
  //         // key={item?.id.toString()}
  //         avatar={item?.avatar}
  //         name={item?.name}
  //         account={item?.privacy}
  //         time={timeFormat(item?.date, true)}
  //         postText={item?.description}
  //         postImage={item?.media[0]?.path}
  //         mediaType={item?.media[0]?.type}
  //         likes={item?.total_likes}
  //         comments={item?.total_comments}
  //         share={item?.share}
  //         onDotPress={() => handleDotPress(item?.id)}
  //         modalVisible={activePostId === item.id}
  //         isPaused={pause && currendId == item?.id}
  //         handleVideoPause={() => handleVideoPause(item?.id)}
  //         // onLikePress={() => setrRactVisible(true)}
  //         // onCommnetPress={() => setCommentsVisible(true)}
  //         onCommnetPress={() => handleCommentPress(item?.id)}
  //         onSavePress={() => handleSave(item?.id, item?.is_saved)}
  //         onLikesModal={() =>
  //           setLikesVisible({visiblity: true, likes: item?.likes, id: item?.id})
  //         }
  //         shareLoader={shareLoader}
  //         isLiked={item?.is_liked}
  //         isSaved={item?.is_saved}
  //         onLikePress={() => handleLikePress(item?.id)}
  //         handleReportPost={() => {
  //           setReportVisible({visibility: true, id: item?.id});
  //         }}
  //         sharePost={sharePost}
  //         handleReportPress={() => {
  //           navigation.navigate('CreatePostEdit', {
  //             title: 'Edit Post',
  //             data: item,
  //           });
  //         }}
  //       />
  //     </>
  //   );
  // };

  // Custom grid layout with different sized images

  // First, divide your posts into rows
  const renderPosts = () => {
    const posts = Array.isArray(data?.posts) ? data.posts : [];
    if (posts.length === 0) {
      return <EmptyComponent text={'No Posts Found'} />;
    }

    // Generate rows with specific layouts
    const rows = [];
    let postIndex = 0;

    const renderGridImage = (post: any, itemStyle: any) => {
      const uri = getPostMediaUri(post);
      return (
        <TouchableOpacity
          style={itemStyle}
          onPress={() => handleImagePress(post)}
          activeOpacity={0.85}>
          {uri ? (
            <Image
              source={{uri}}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.gridImage, profileExtraStyles.placeholder]}>
              <Text style={profileExtraStyles.placeholderText}>No media</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    };

    while (postIndex < posts.length) {
      // Every other row follows a different pattern
      if (rows.length % 2 === 0) {
        // Pattern 1: One large, two small
        rows.push(
          <View key={`row-${rows.length}`} style={styles.gridRow}>
            {postIndex < posts.length &&
              renderGridImage(posts[postIndex], styles.largeGridItem)}
            <View style={styles.smallImagesColumn}>
              {postIndex + 1 < posts.length &&
                renderGridImage(posts[postIndex + 1], styles.smallGridItem)}
              {postIndex + 2 < posts.length &&
                renderGridImage(posts[postIndex + 2], styles.smallGridItem)}
            </View>
          </View>,
        );
        postIndex += 3;
      } else {
        // Pattern 2: Two small, one large
        rows.push(
          <View key={`row-${rows.length}`} style={styles.gridRow}>
            <View style={styles.smallImagesColumn}>
              {postIndex < posts.length &&
                renderGridImage(posts[postIndex], styles.smallGridItem)}
              {postIndex + 1 < posts.length &&
                renderGridImage(posts[postIndex + 1], styles.smallGridItem)}
            </View>
            {postIndex + 2 < posts.length &&
              renderGridImage(posts[postIndex + 2], styles.largeGridItem)}
          </View>,
        );
        postIndex += 3;
      }
    }

    return rows;
  };

  // Add this function to handle image press
  const handleImagePress = (item: any) => {
    if (!item?.id) {
      return;
    }
    setSelectedPost(item);
  };
  const onViewableItemsChanged = ({viewableItems}) => {
    // Play only the currently focused video
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

  // console.log('DATAAAAAAA', data?.posts.length);

  // console.log('-------', data);

  return (
    <View style={styles.container}>
      <GlobalHeader icon={true} />
      {data?.is_private && !data?.is_following ? (
        <Card style={{height: vh * 55}}>
          <ProfileCard
            name={
              data?.full_name ||
              capitalize(data?.first_name) + ' ' + capitalize(data?.last_name)
            }
            description={data?.bio || ''}
            stats={`${data?.posts?.length || 0} posts   ${data?.followers?.length || 0} followers   ${data?.following?.length || 0} following`}
            avatar={data?.avatar}
            onPress={handleOpen}
            isFollowing={data?.is_following}
            isRequested={data?.is_follow_requested}
            private={data?.is_private}
            id={data?.id}
            username={data?.username || ''}
            location={data?.location_name || data?.location || ''}
            postsCount={data?.posts?.length || 0}
            followersCount={data?.followers?.length || 0}
            followingCount={data?.following?.length || 0}
          />
          <ReportBlockModal
            isVisible={modalVisible}
            options={options}
            onClose={() => setModalVisible(false)}
            style={{top: 55}}
          />
        </Card>
      ) : null}
      {/* // Replace the FlatList with ScrollView for custom grid layout */}
      {!data?.is_private || data?.is_following ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: vh * 4}}>
          <Card>
            <ProfileCard
              name={
                data?.full_name ||
                capitalize(data?.first_name) + ' ' + capitalize(data?.last_name)
              }
              description={data?.bio || ''}
              avatar={data?.avatar}
              onPress={handleOpen}
              isFollowing={data?.is_following}
              isRequested={data?.is_follow_requested}
              private={data?.is_private}
              id={data?.id}
              username={data?.username || ''}
              location={data?.location_name || data?.location || ''}
              postsCount={data?.posts?.length || 0}
              followersCount={data?.followers?.length || 0}
              followingCount={data?.following?.length || 0}
            />

            <ReportBlockModal
              isVisible={modalVisible}
              options={options}
              onClose={() => setModalVisible(false)}
              style={{top: 55}}
            />
          </Card>

          <View style={styles.gridContainer}>{renderPosts()}</View>
        </ScrollView>
      ) : null}
      {/* {!data?.is_private || data?.is_following ? (
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
                    postsCount={data?.posts.length}
                    followersCount={data?.followers?.length || 0} // Use actual followers count
                    followingCount={data?.following?.length || 0}
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
            numColumns={3} // Create a 3-column grid
            key={'grid'}
            // viewabilityConfig={viewabilityConfig.current}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{paddingBottom: vh * 4}}
            renderItem={renderPost}
            // onViewableItemsChanged={onViewableItemsChanged}
            ListEmptyComponent={<EmptyComponent text={'No Posts Found'} />}
          />
        </>
      ) : null} */}
      <CommentsModal
        visible={commentsVisible.visible}
        closeModal={() => {
          closeComments();
          getData();
        }}
        // icon={CheckedIcon}
        title="Successfully"
        message="Password has been updated successfully"
        buttonText="Apply"
        comments={commentsVisible?.comments}
        postId={commentsVisible?.id || 0}
        isLoadingComments={isLoadingComments}
        isLoadingMore={isLoadingMoreComments}
        commentsError={commentsError}
        onRetryComments={retryComments}
        onLoadMoreComments={loadMoreComments}
        hasMoreComments={hasMoreComments}
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
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        onRequestClose={() => setSelectedPost(null)}>
        <SafeAreaView style={profileExtraStyles.postModal}>
          <View style={profileExtraStyles.postModalHeader}>
            <Text style={profileExtraStyles.postModalTitle}>Post</Text>
            <TouchableOpacity
              onPress={() => setSelectedPost(null)}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <X color="#111" size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {selectedPost ? (
              <PostComponent
                id={selectedPost.id}
                avatar={selectedPost.avatar || data?.avatar}
                name={
                  selectedPost.fullname ||
                  selectedPost.name ||
                  data?.full_name ||
                  ''
                }
                country={selectedPost.username || data?.username || ''}
                time={timeFormat(selectedPost.date) || ''}
                postText={selectedPost.description || ''}
                postImage={getPostMediaUri(selectedPost) || ''}
                mediaType={
                  String(selectedPost?.media?.[0]?.type || 'image').toLowerCase()
                }
                mediaList={selectedPost.media || []}
                likes={
                  selectedPost.total_likes ?? selectedPost.likes?.length ?? 0
                }
                comments={
                  selectedPost.total_comments ??
                  selectedPost.comments?.length ??
                  0
                }
                share={0}
                account={account}
                onCommnetPress={() => handleCommentPress(selectedPost.id)}
                onSavePress={() =>
                  handleSave(selectedPost.id, !!selectedPost.is_saved)
                }
                onLikePress={() => handleLikePress(selectedPost.id)}
                onDotPress={() => handleDotPress(selectedPost.id)}
                handleReportPress={handleReportPress}
                handleBlockPress={handleBlockPress}
                handleReportPost={() =>
                  setReportVisible({visibility: true, id: selectedPost.id})
                }
                modalVisible={activePostId === selectedPost.id}
                isLiked={!!selectedPost.is_liked}
                isSaved={!!selectedPost.is_saved}
                onCardPress={() => setSelectedPost(null)}
                isFocused={true}
                sharePost={sharePost}
              />
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const profileExtraStyles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#E8ECF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#8A94A6',
    fontSize: 12,
  },
  postModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  postModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
});

export default ProfileScreen;
