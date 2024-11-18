// Home.tsx
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import {images} from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import HeaderComponent from '../../components/HeaderComponent';
import ReactModal from '../../components/ReactModal';
import {dummyComments, reactions} from '../../dummyData';
import styles from './styles';
import GeneralModal from '../../components/GeneralModal';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {useAppDispatch, useAppSelector} from '../../hooks/storeHooks';
import {
  getCommentPost,
  getMyPost,
  likePost,
  PostDelete,
  postSave,
  updateLike,
} from '../../store/slices/homeSlice';
import InterRegular from '../../components/Text/InterRegular';
import dayjs from 'dayjs';
import Loader from '../../components/Loader';
import {getMessage, Toast} from '../../utils/helpers';
import {timeFormat, timeHelper} from '../../utils';
import {removeSavedItem, saveItem} from '../../api/menu';

const MyPosts: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
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
  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null,
  });
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [loader, setLoader] = useState(false);
  const {posts} = useAppSelector(state => state.home);
  const [data, setData] = useState([]);
  const [reportLoader, setReportLoader] = useState(false);

  const handleDotPress = (postId: number) => {
    setActivePostId(activePostId === postId ? null : postId);
  };

  const handleLikePress = (id: number) => {
    // console.log('POSTSSSSSSSSSSSSSSSSSSSSSSSS', posts[index]);
    dispatch(updateLike(id));
    dispatch(likePost(id)).catch(err => {
      console.log('error from like post', err);
    });
  };

  const handleCommentPress = id => {
    dispatch(getCommentPost(id))
      .then(res => {
        console.log(
          res?.payload?.data?.data?.data,
          'Commentsss Ressss frommm screennnn',
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
        // getData();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      headerRight: () => (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Notifications');
            }}>
            <Image source={images.bellIcon} style={styles.threeDots} />
          </TouchableOpacity>
          {/* 
                    <TouchableOpacity onPress={() => {
                        // setModalVisible(true)
                    }}>
                        <Image
                            source={images.searchIcon}
                            style={styles.threeDots}

                        />
                    </TouchableOpacity> */}
        </View>
      ),
    });
  }, [navigation]);

  //   const getData = () => {
  //     setLoader(true);
  //     let id = user?.id;
  //     dispatch(getMyPost(id))
  //       .unwrap()
  //       .then(res => {
  //         console.log(res?.data?.data?.data, 'Ressss frommm Screeennnn???');
  //         setData(res?.data?.data?.data);
  //         setLoader(false);
  //       })
  //       .catch(err => {
  //         setLoader(false);
  //       });
  //   };

  const handleSave = async (id: number, isSaved: boolean) => {
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

  // console.log("POSTSSSSSSSSSSSSSSSSSS",posts[0].total_likes)

  useEffect(() => {
    // getData();
    let filtered = posts.filter((item: any) => item?.user_id == user?.id);
    setData(filtered);
  }, [isFocused, posts]);

  if (loader) {
    return <Loader />;
  }

  const renderPost = ({item}) => {
    return (
      <PostComponent
        id={item?.user_id}
        postID={item?.media[0]?.post_id}
        avatar={item?.avatar}
        name={item.name}
        country={item.country ? item.country : ''}
        time={timeFormat(item?.date)}
        postText={item?.description}
        postImage={item?.media[0]?.path}
        likes={item?.total_likes}
        comments={item?.total_comments}
        share={item.share}
        account={item.privacy}
        // onCommnetPress={() => setCommentsVisible(true)}
        onCommnetPress={() => handleCommentPress(item?.id)}
        onLikePress={() => handleLikePress(item?.id)}
        onSavePress={() => handleSave(item?.id, item?.is_saved)}
        // onLikePress={() => setrRactVisible(true)}
        onDotPress={() => handleDotPress(item.id)}
        modalVisible={activePostId === item.id}
        onCardPress={() => setActivePostId(null)}
        handleBlockPress={() => {
          // handleDotPress();
          // setDeleteVisible(true);
          setDeleteVisible({visibility: true, id: item?.id});
        }}
        handleReportPost={() => {
          setReportVisible({visibility: true, id: item?.id});
        }}
        handleReportPress={() => {
          navigation.navigate('CreatePostEdit', {
            title: 'Edit Post',
            data: item,
          });
        }}
        isLiked={item?.is_liked}
        isSaved={item?.is_saved}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <InterRegular style={styles.emptyText}>No Posts to Show.</InterRegular>
    </View>
  );

  return (
    <View style={{paddingHorizontal: vh * 2}}>
      {/* <TouchableWithoutFeedback onPress={() => handleDotPress(null)}> */}
      <View>
        <FlatList
          data={data}
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
          closeModal={() =>
            setCommentsVisible({visiblity: false, comments: [], id: null})
          }
          // icon={CheckedIcon}
          title="Successfully"
          message="Password has been updated successfully"
          buttonText="Apply"
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
          // onPress={() => {
          //     setDeleteVisible(false)
          //     setDeleteSuccess(true)

          // }}
          onPress={handleDelete}
          loading={reportLoader}
          secondaryBtn={true}
        />

        <GeneralModal
          visible={deleteSuccess}
          closeModal={() => setDeleteSuccess(false)}
          icon={images.checkedIcon}
          title="Delete Post"
          message="Post has been delete successfully."
          buttonText="Ok"
          onPress={() => {
            setDeleteSuccess(false);
          }}
          primaryBtn={true}
        />
      </View>
      {/* </TouchableWithoutFeedback> */}
    </View>
  );
};

export default MyPosts;
