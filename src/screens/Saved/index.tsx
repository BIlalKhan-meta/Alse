// Home.tsx
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import {createPost, reportPost} from '../../api/home';
import {getSavedItems, removeSavedItem, saveItem} from '../../api/menu';
import Card from '../../components/Card';
import CommentsModal from '../../components/CommentsModal';
import ContentSavedScreen from '../../components/ContentSaved';
import {EmptyComponent} from '../../components/EmptyComponent';
import GeneralModal from '../../components/GeneralModal';
import LikesModal from '../../components/LikesModal';
import Loader from '../../components/Loader';
import MediaCard from '../../components/MediaCard';
import PostComponent from '../../components/PostComponent';
import ReactModal from '../../components/ReactModal';
import InterRegular from '../../components/Text/InterRegular';
import WishlistScreen from '../../components/WishList';
import {reactions} from '../../dummyData';
import {useAppDispatch} from '../../hooks/storeHooks';
import {selectUserProfile} from '../../store/slices/authSlice';
import {
  getCommentPost,
  likePost,
  PostDelete,
} from '../../store/slices/homeSlice';
import {timeFormat} from '../../utils';
import {getMessage, parseSharedFrom} from '../../utils/helpers';
import {useTranslation} from 'react-i18next';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import styles from './styles';

const productFilter = [
  {name: 'a', id: 1},
  {name: 'b', id: 2},
];

const Saved: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [reactVisible, setrRactVisible] = useState(false);
  const [active, setActive] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [displayPost, setDisplayPost] = useState([]);
  const dispatch = useAppDispatch();
  const [commentsVisible, setCommentsVisible] = useState({
    visiblity: false,
    comments: [],
    id: null,
  });
  const [deleteVisible, setDeleteVisible] = useState({
    visibility: false,
    id: null,
  });
  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null,
  });
  const [likesVisible, setLikesVisible] = useState({
    visiblity: false,
    likes: [],
    id: null,
  });

  const [reportSuccess, setReportSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [reportLoader, setReportLoader] = useState(false);
  const [shareLoader, setShareLoader] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [pause, setPause] = useState(false);
  const [currendId, setCurrentID] = useState(0);
  const handleVideoPause = id => {
    setPause(!pause);
    setCurrentID(id);
  };
  console.log('DISSPLAYYYYYYYYYYYYYY', displayPost);

  const fetchData = async () => {
    setLoading(true);
    await getSavedItems()
      .then(res => {
        if (res?.data) {
          console.log('RESSSSSSSSSS', res?.data?.data?.data[0]);
          if (active == 1) {
            setDisplayPost(
              res?.data?.data?.data?.filter(
                item => item?.savable_type == `App\\Models\\Post`,
              ),
            );
          } else if (active == 2) {
            setDisplayPost(
              res?.data?.data?.data?.filter(
                item => item?.savable_type == `App\\Models\\Product`,
              ),
            );
          } else {
            setDisplayPost(
              res?.data?.data?.data?.filter(
                item =>
                  item?.savable_type != `App\\Models\\Product` &&
                  item?.savable_type != `App\\Models\\Post`,
              ),
            );
          }
        }
      })
      .catch(err => {
        console.log('ERRRRRRORRRRR SAVEDDDDDDDDDDDD', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [active]);

  const handleRemoveFromWishlist = async (
    productId: number,
    saved: boolean,
  ) => {
    if (saved) {
      // console.log('CHECKKKKKKKKKKKKKKKKKKKKK', productId);
      let index = displayPost.findIndex(
        item => item?.savable_item?.id == productId,
      );
      // console.log('INDEXXXXXXXXXXXXXXXXXX', index);
      let arr = [...displayPost];
      arr.splice(index, 1);
      setDisplayPost(arr);
      const data = {
        item_id: displayPost[index].savable_id,
        item_type: 'product',
      };
      const form = new FormData();
      Object.entries(data).map(([key, value]) => {
        form.append(key, value);
      });
      await removeSavedItem(form);
    } else {
      const data = {
        item_id: productId,
        item_type: 'product',
      };

      const form = new FormData();
      Object.entries(data).map(([key, value]) => {
        form.append(key, value);
      });

      await saveItem(form)
        .then(res => {
          if (res?.data) {
            //   console.log('RESSSSSSSSSS SAVEEEEEEEEEEEEEEE', res?.data);
          }
        })
        .catch(err => {
          console.log('ERRRRRORRR SAVEEEEEEEEEEEEEEEEE', err);
        });
    }
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
              // setModalVisible(true)
              navigation.navigate('Notifications');
            }}>
            <Image source={images.bellicon} style={styles.threeDots} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

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

  console.log('POSTSSSSSSSSSSSSSSSS', displayPost);
  const user = useSelector(selectUserProfile);

  // const handleLikePress = (id: number) => {
  //   console.log('POSTSSSSSSSSSSSSSSSSSSSSSSSS', id);
  //   // dispatch(updateLike(id));

  //   dispatch(likePost(id))
  //     .then(res => {
  //       console.log('response from like post ---->', res);
  //       // getApi();
  //     })
  //     .catch(err => {
  //       console.log('error from like post', err);
  //     });
  // };
  const handleLikePress = (id: number) => {
    console.log('id -', id);
    let temp = [...displayPost];
    let index = temp.findIndex(item => item?.savable_item?.id == id);
    const postFound = displayPost[index].savable_item;

    const tempData = {
      id: Math.random(),
      user: {
        id: user?.id,
        avatar: user?.avatar ? user?.avatar : images.profile,
        full_name: user?.full_name ? user?.full_name : '',
      },
    };
    const clone = JSON.parse(JSON.stringify(postFound?.likes));
    const find = clone.findIndex(val => val?.user?.id == user?.id);

    if (find > -1) {
      clone.splice(find, 1);
    } else {
      clone.push(tempData);
    }
    postFound.is_liked = !postFound?.is_liked;
    postFound.likes = clone;

    setDisplayPost(temp);
    dispatch(likePost(id));
  };

  const handleSave = async (id: number, isSaved: boolean) => {
    let index = displayPost.findIndex(item => item?.savable_item?.id == id);
    const arr = [...displayPost];
    arr.splice(index, 1);
    setDisplayPost(arr);
    const data = {
      item_id: id,
      item_type: 'post',
    };
    const form = new FormData();
    Object.entries(data).map(([key, value]) => {
      form.append(key, value);
    });
    await removeSavedItem(form).catch(err =>
      console.log('ERRRORRRRRRRRR SAVEDDDDDDDDDDD', err),
    );
  };

  const handleDotPress = (postId: number) => {
    setActivePostId(postId ? postId : null);
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
        fetchData();
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
      reportable_type: 'Post',
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
        fetchData();
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

  const sharePost = async form => {
    setShareLoader(true);
    await createPost(form)
      .then(res => {
        if (res?.data) {
          //  navigation.goBack()
          Toast.show({
            type: 'success',
            text1: 'Post shared successfully',
          });
          console.log('POSTTTTTT SHAREDDDDDDDDDDDDDDDD');
        }
      })
      .catch(err => console.log('ERORRRRRRR', err))
      .finally(() => {
        setShareLoader(false);
        // setLoading(false);
      });
  };

  const handelSave = (id: number) => {
    let arr = [...displayPost];
    let index = arr.findIndex(item => item.id === id);
    arr.splice(index, 1);
    setDisplayPost(arr);
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

  const renderPost = ({item, index}: any) => {
    const isFocused = focusedIndex === index;
    const postDescriptionRaw = item?.description ?? item?.content ?? '';
    const {caption, sharedFromName} = parseSharedFrom(postDescriptionRaw);
    return (
      <PostComponent
        id={item?.user_id}
        isFocused={isFocused}
        // postID={item?.media[0]?.post_id}
        isPaused={pause && currendId == item?.id}
        handleVideoPause={() => handleVideoPause(item?.id)}
        avatar={item?.avatar}
        name={item?.fullname}
        country={item?.country ? item?.country : ''}
        time={timeFormat(item?.date, true)}
        postText={caption}
        sharedFromName={sharedFromName}
        postImage={item?.media?.[0]?.path}
        mediaType={
          String(item?.media?.[0]?.type ?? 'image').toLowerCase() === 'video'
            ? 'video'
            : 'image'
        }
        likes={item?.total_likes}
        comments={item?.total_comments}
        share={item?.share}
        account={item?.privacy}
        sharePost={sharePost}
        // onCommnetPress={() => setCommentsVisible(true)}
        onCommnetPress={() => handleCommentPress(item?.id)}
        onLikePress={() => handleLikePress(item?.id)}
        onLikesModal={() =>
          setLikesVisible({visiblity: true, likes: item?.likes, id: item?.id})
        }
        onSavePress={() => handleSave(item?.id, item?.is_saved)}
        // onLikePress={() => setrRactVisible(true)}
        onDotPress={() => handleDotPress(item?.id)}
        modalVisible={activePostId === item?.id}
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
          const {caption} = parseSharedFrom(postDescriptionRaw);
          navigation.navigate('CreatePostEdit', {
            title: 'Edit Post',
            data: {...item, description: caption},
          });
        }}
        isLiked={item?.is_liked}
        isSaved={item?.is_saved}
      />
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Modal visible={shareLoader} transparent animationType="fade">
        <View style={styles.shareLoaderOverlay}>
          <View style={styles.shareLoaderContent}>
            <ActivityIndicator size="large" color={colors.themeColor} />
            <Text style={styles.shareLoaderText}>{t('sharingPost')}</Text>
          </View>
        </View>
      </Modal>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Card style={styles.activeContainer}>
          <TouchableOpacity
            style={active == 1 ? styles.activeBtn : styles.InactiveBtn}
            onPress={() => setActive(1)}>
            <InterRegular
              style={active == 1 ? styles.activeTxt : styles.InactiveTxt}>
              Post Saved
            </InterRegular>
          </TouchableOpacity>

          <TouchableOpacity
            style={active == 2 ? styles.activeBtn : styles.InactiveBtn}
            onPress={() => setActive(2)}>
            <InterRegular
              style={active == 2 ? styles.activeTxt : styles.InactiveTxt}>
              Wishlist
            </InterRegular>
          </TouchableOpacity>

          <TouchableOpacity
            style={active == 3 ? styles.activeBtn : styles.InactiveBtn}
            onPress={() => setActive(3)}>
            <InterRegular
              style={active == 3 ? styles.activeTxt : styles.InactiveTxt}>
              Content Saved
            </InterRegular>
          </TouchableOpacity>
        </Card>
        {active == 1 && (
          <View>
            <FlatList
              data={displayPost.map(item => {
                return item?.savable_item;
              })}
              onRefresh={fetchData}
              refreshing={loading}
              renderItem={renderPost}
              viewabilityConfig={viewabilityConfig.current}
              onViewableItemsChanged={onViewableItemsChanged}
              //   keyExtractor={item => item?.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <EmptyComponent text={'No Posts Saved'} />
              )}
            />

            <CommentsModal
              visible={commentsVisible.visiblity}
              closeModal={() => {
                setCommentsVisible({visiblity: false, comments: [], id: null});
                // fetchData();
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
            <LikesModal
              visible={likesVisible.visiblity}
              likes={likesVisible.likes}
              closeModal={() => {
                setLikesVisible({visiblity: false, likes: [], id: null});
              }}
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
        )}

        {active == 2 && (
          <Card style={styles.contentContainer}>
            <WishlistScreen
              wishlist={displayPost.map(item => {
                return item?.savable_item;
              })}
              handleRemove={handleRemoveFromWishlist}
              heart={true}
              // addCart={true}
              vendor={true}
              product={true}
              onPress={id => {
                navigation.navigate('ProductView', {
                  productId: id,
                });
              }}
            />
          </Card>
        )}

        {active == 3 && (
          <Card style={styles.contentContainer}>
            <FlatList
              data={displayPost}
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={() => (
                <EmptyComponent text={'No Saved Content'} />
              )}
              renderItem={({item}) => (
                <Card style={styles.itemCard}>
                  {item?.savable_type == 'App\\Models\\Video' ? (
                    <MediaCard
                      item={item?.savable_item}
                      onSavePress={() => handelSave(item?.id)}
                      type={'video'}
                      source={item?.savable_item?.video}
                      title={item?.savable_item?.title}
                      description={item?.savable_item?.content}
                      category={item?.savable_item?.category?.title}
                      onItemPress={() =>
                        navigation.navigate('ViewBlog', {
                          id: item?.savable_item?.id,
                          title: item?.savable_item?.title,
                          type: 'video',
                        })
                      }
                    />
                  ) : (
                    <ContentSavedScreen
                      onSavePress={() => handelSave(item?.id)}
                      item={item?.savable_item}
                      userId={item?.savable_item?.id}
                      viewBtn={
                        item?.savable_type == 'App\\Models\\Article'
                          ? 'View Full Article'
                          : 'View Full Blog'
                      }
                      type={
                        item?.savable_type == 'App\\Models\\Article'
                          ? 'article'
                          : 'blog'
                      }
                      onItemPress={() =>
                        navigation.navigate('ViewBlog', {
                          id: item?.savable_item?.id,
                          title: item?.savable_item?.title,
                          type:
                            item?.savable_type == 'App\\Models\\Article'
                              ? 'article'
                              : 'blog',
                        })
                      }
                    />
                  )}
                </Card>
              )}
              keyExtractor={item => item?.id?.toString()}
            />
          </Card>
        )}
      </View>
    </ScrollView>
    </>
  );
};

export default Saved;
