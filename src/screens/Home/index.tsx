import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {images} from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import styles from './styles';
import PostComponent from '../../components/PostComponent';
import CommentsModal from '../../components/CommentsModal';
import ReactModal from '../../components/ReactModal';
import GeneralModal from '../../components/GeneralModal';
import {dummyComments, reactions} from '../../dummyData';
import HeaderComponent from '../../components/HeaderComponent';
import {useAppDispatch, useAppSelector} from '../../hooks/storeHooks';
import {
  getCommentPost,
  GetNewsFeed,
  likePost,
  PostDelete,
  updateLike,
} from '../../store/slices/homeSlice';
import InterRegular from '../../components/Text/InterRegular';
import {colors} from '../../utils/theme';
import dayjs from 'dayjs';
import Loader from '../../components/Loader';
import {getMessage, Toast} from '../../utils/helpers';
import {reportPost} from '../../api/home';
import {saveItem} from '../../api/menu';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';

const Home: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isFoused = useIsFocused();

  // Select posts and loading state from the Redux store
  const {posts, loading, error} = useAppSelector(state => state.home);
  const user = useSelector(selectUserProfile);

  const [commentsVisible, setCommentsVisible] = useState({
    visiblity: false,
    comments: [],
    id: null,
  });
  const [reactVisible, setrRactVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [deleteVisible, setDeleteVisible] = useState({
    visibility: false,
    id: null,
  });
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [reportLoader, setReportLoader] = useState(false);

  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null,
  });
  const [reportSuccess, setReportSuccess] = useState(false);

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

  useEffect(() => {
    getApi();
  }, [isFoused]);

  const getApi = async () => {
    const checkData = await dispatch(GetNewsFeed());
  };

  if (loading) {
    return <Loader />;
  }

  const handleDotPress = (postId: number) => {
    setActivePostId(postId ? postId : null);
  };

  const handleLikePress = (id: number) => {
    // console.log('POSTSSSSSSSSSSSSSSSSSSSSSSSS', posts[index]);
    dispatch(updateLike(id));
    dispatch(likePost(id))
      .then(res => {
        // console.log('response from like post ---->', res);
        // getApi();
      })
      .catch(err => {
        console.log('error from like post', err);
      });
  };

  const handleDelete = () => {
    setReportLoader(true);
    dispatch(PostDelete(deleteVisible?.id))
      .unwrap()
      .then(res => {
        setDeleteVisible({
          visibility: false,
          id: null,
        });
        setReportLoader(false);
        getApi();
        setDeleteSuccess(true);
        handleDotPress(null);
      })
      .catch(err => {
        setReportLoader(false);
        setDeleteVisible({
          visibility: false,
          id: null,
        });
        handleDotPress(null);
        Toast.error(getMessage(err?.message));

        console.log('Errorr  errerrerrerrerrerrerrerrerrfrom ', err);
      });
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
        getApi();
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

  // const checkLiked = item => {
  //   // item?.likes.includes(item => item?.user?.role_id == user?.user_id);
  //   return false;
  // };

  const handleSave = async (id: number) => {
    const data = {
      item_id: id,
      item_type: 'post',
    };
    const form = new FormData();
    Object.entries(data).map(([key, value]) => {
      form.append(key, value);
    });
    await saveItem(form)
      .then(res => console.log('POSTTTT SAVEEEDDDDDDD', res))
      .catch(err => console.log('SAVEEEEDDDDDD POSTTTTT ERRORRRRRR', err));
  };

  const renderPost = ({item}) => {
    const mediaItem =
      item?.media && item?.media.length > 0 ? item?.media[0] : null;

    return (
      <PostComponent
        id={item?.user_id}
        postID={item?.media[0]?.post_id}
        avatar={item?.avatar}
        name={item.name}
        country={item.country ? item.country : ''}
        time={dayjs(item?.media[0]?.date).format('hh:MM A')}
        postText={item?.description}
        postImage={item?.media[0]?.path}
        likes={item.likes}
        comments={item.comments}
        share={item.share}
        account={item.privacy}
        // onCommnetPress={() => setCommentsVisible(true)}
        onCommnetPress={() => handleCommentPress(mediaItem?.post_id)}
        onLikePress={() => handleLikePress(mediaItem?.post_id)}
        onSavePress={() => handleSave(item?.id)}
        // onLikePress={() => setrRactVisible(true)}
        onDotPress={() => handleDotPress(item.id)}
        modalVisible={activePostId === item.id}
        handleBlockPress={() => {
          // handleDotPress();
          // setDeleteVisible(true);
          setDeleteVisible({visibility: true, id: mediaItem?.post_id});
        }}
        handleReportPost={() => {
          setReportVisible({visibility: true, id: mediaItem?.post_id});
        }}
        handleReportPress={() => {
          handleDotPress();
          navigation.navigate('CreatePostEdit', {
            title: 'Edit Post',
            data: item,
          });
        }}
        isLiked={item?.is_liked}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <InterRegular style={styles.emptyText}>No Posts to Show.</InterRegular>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableWithoutFeedback onPress={() => handleDotPress(null)}>
        <View style={styles.container}>
          <FlatList
            data={posts}
            onRefresh={getApi}
            refreshing={loading}
            renderItem={renderPost}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            ListHeaderComponent={() => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CreatePost')}>
                <View pointerEvents="none">
                  <CardComponent
                    onTextInput={() => navigation.navigate('CreatePost')}
                    onVideoPress={() => navigation.navigate('CreatePost')}
                    onImagePress={() => navigation.navigate('CreatePost')}
                  />
                </View>
              </TouchableOpacity>
            )}
          />

          <CommentsModal
            visible={commentsVisible.visiblity}
            closeModal={() => {
              setCommentsVisible({visiblity: false, comments: [], id: null});
              getApi();
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

          <GeneralModal
            visible={deleteVisible.visibility}
            closeModal={() =>
              setDeleteVisible({
                visibility: false,
                id: null,
              })
            }
            icon={images.qmark}
            title="Delete Post"
            message="Are you sure you want to delete this Post?"
            SecondaryText1="Yes"
            SecondaryText2="No"
            onPress={handleDelete}
            secondaryBtn={true}
            loading={reportLoader}
          />

          <GeneralModal
            visible={deleteSuccess}
            closeModal={() => setDeleteSuccess(false)}
            icon={images.checkedIcon}
            title="Delete Post"
            message="Post has been deleted successfully."
            buttonText="Ok"
            onPress={() => {
              setDeleteSuccess(false);
            }}
            primaryBtn={true}
          />

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
            title="Report Post"
            message="Post has been reported successfully!"
            buttonText="Ok"
            onPress={() => {
              setReportSuccess(false);
              // navigation.navigate("Profile", { account: account })
            }}
            primaryBtn={true}
          />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default Home;
