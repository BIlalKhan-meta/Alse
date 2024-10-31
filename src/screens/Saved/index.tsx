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
} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import {useNavigation} from '@react-navigation/native';
import InterRegular from '../../components/Text/InterRegular';
import WishlistScreen from '../../components/WishList';
import ContentSavedScreen from '../../components/ContentSaved';
import {Picker} from '@react-native-picker/picker';
import ReactModal from '../../components/ReactModal';
import {reactions} from '../../dummyData';
import {getSavedItems} from '../../api/menu';
import dayjs from 'dayjs';
import {
  getCommentPost,
  likePost,
  PostDelete,
  updateLike,
} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import {reportPost, savePost} from '../../api/home';
import GeneralModal from '../../components/GeneralModal';
import {getMessage} from '../../utils/helpers';
import Toast from 'react-native-toast-message';

const dummyWishlist = [
  {
    id: '1',
    name: 'Product 1',
    price: 20,
    imageUrl: `${images.pro1}`,
  },
  {
    id: '2',
    name: 'Product 2',
    price: 30,
    imageUrl: `${images.pro2}`,
  },
  {
    id: '3',
    name: 'Product 3',
    price: 25,
    imageUrl: `${images.pro2}`,
  },
  {
    id: '4',
    name: 'Product 4',
    price: 25,
    imageUrl: `${images.pro1}`,
  },
  {
    id: '5',
    name: 'Product 5',
    price: 25,
    imageUrl: `${images.pro1}`,
  },
  {
    id: '6',
    name: 'Product 6',
    price: 25,
    imageUrl: `${images.pro2}`,
  },
];
const dummyContentSaved = [
  {
    id: '1',
    name: 'It is a long established fact that a reader will be distracted by the readable content ',
    active: true,
    imageUrl: `${images.blog1}`,
  },
  {
    id: '2',
    name: 'It is a long established fact that a reader will be distracted by the readable content ',
    active: true,
    imageUrl: `${images.blog1}`,
  },
  {
    id: '3',
    name: 'It is a long established fact that a reader will be distracted by the readable content ',
    active: false,
    imageUrl: `${images.blog1}`,
  },
  {
    id: '4',
    name: 'It is a long established fact that a reader will be distracted by the readable content ',
    active: true,
    imageUrl: `${images.blog1}`,
  },
  {
    id: '5',
    name: 'It is a long established fact that a reader will be distracted by the readable content ',
    active: false,
    imageUrl: `${images.blog1}`,
  },
  {
    id: '6',
    name: 'It is a long established fact that a reader will be distracted by the readable content ',
    active: true,
    imageUrl: `${images.blog1}`,
  },
];
const productFilter = [
  {name: 'a', id: 1},
  {name: 'b', id: 2},
];
const Saved: React.FC = () => {
  const navigation = useNavigation();
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

  const [reportSuccess, setReportSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [reportLoader, setReportLoader] = useState(false);

  const [activePostId, setActivePostId] = useState<number | null>(null);

  const handleAddToCart = (productId: string) => {
    // Implement your logic to add the product to cart
    console.log(`Product with id ${productId} added to cart`);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    // Implement your logic to remove the product from wishlist
    console.log(`Product with id ${productId} removed from wishlist`);
  };

  const fetchData = async () => {
    setLoading(true);
    let res;
    if (active == 1) {
      res = await getSavedItems()
        .then(res => {
          if (res?.data) {
            // console.log('RESSSSSSSSSS', res?.data?.data?.data);
            setDisplayPost(
              res?.data?.data?.data?.filter(
                item => item.savable_type == `App\\Models\\Post`,
              ),
            );
          }
        })
        .catch(err => {
          console.log('ERRRRRRORRRRR SAVEDDDDDDDDDDDD', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    console.log('POSTSSSSSSSSSSSSSSSSSSSSSSSS', id);
    // dispatch(updateLike(id));

    dispatch(likePost(id))
      .then(res => {
        console.log('response from like post ---->', res);
        // getApi();
      })
      .catch(err => {
        console.log('error from like post', err);
      });
  };

  const handleSave = async (id: number) => {
    const data = {
      item_id: id,
      item_type: 'post',
    };
    const form = new FormData();
    Object.entries(data).map(([key, value]) => {
      form.append(key, value);
    });
    await savePost(form)
      .then(res => console.log('POSTTTT SAVEEEDDDDDDD', res))
      .catch(err => console.log('SAVEEEEDDDDDD POSTTTTT ERRORRRRRR', err));
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

  const renderPost = ({item}) => {
    const mediaItem =
      item?.savable_item?.media && item?.savable_item?.media.length > 0
        ? item?.savable_item?.media[0]
        : null;

    return (
      <PostComponent
        id={item?.savable_item?.user_id}
        postID={item?.savable_item?.media[0]?.post_id}
        avatar={item?.savable_item?.avatar}
        name={item.savable_item?.name}
        country={item.savable_item?.country ? item.country : ''}
        time={dayjs(item?.savable_item?.media[0]?.date).format('hh:MM A')}
        postText={item?.savable_item?.description}
        postImage={item?.savable_item?.media[0]?.path}
        likes={item.savable_item?.likes}
        comments={item.savable_item?.comments}
        share={item.savable_item?.share}
        account={item.savable_item?.privacy}
        // onCommnetPress={() => setCommentsVisible(true)}
        onCommnetPress={() => handleCommentPress(mediaItem?.post_id)}
        onLikePress={() => handleLikePress(mediaItem?.post_id)}
        onSavePress={() => handleSave(item?.id)}
        // // onLikePress={() => setrRactVisible(true)}
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
        isLiked={item?.savable_item?.is_liked}
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
      <View style={styles.container}>
        {/* Header */}
        {/* <HeaderComponent
                    label={'Saved'}
                    onBackPress={() => navigation.goBack()}
                    chatVisible={true}
                    searchVisible={true}
                    onChatPress={() => navigation.navigate("ChatScreen")}

                /> */}

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
              data={displayPost}
              onRefresh={fetchData}
              refreshing={loading}
              renderItem={renderPost}
              //   keyExtractor={item => item?.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmpty}
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
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View>
                <InterRegular style={styles.heading}>Sort by:</InterRegular>
                <View>
                  <Picker
                    style={[styles.pickercontainer]}
                    dropdownIconColor={colors.inputText}
                    enabled={true}
                    mode="dialog"
                    placeholder={'Product name (a-z)'}
                    // onValueChange={handleChange('gender')}
                    // selectedValue={values.gender}
                    // data={genders}
                  >
                    <Picker.Item label={'Product name (a-z)'} value="" />

                    {productFilter.map(item => (
                      <Picker.Item
                        label={item.name.toString()}
                        value={item.name.toString()}
                        key={item.id.toString()}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <TouchableOpacity>
                <Image source={images.filter} />
              </TouchableOpacity>
            </View>

            {/* <WishlistScreen
              wishlist={dummyWishlist}
              onAddToCart={handleAddToCart}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              heart={true}
              addCart={true}
              product={true}
            /> */}
          </Card>
        )}

        {active == 3 && (
          <Card style={styles.contentContainer}>
            <FlatList
              data={dummyContentSaved}
              renderItem={({item}) => (
                <ContentSavedScreen
                  item={item}
                  title="Blog Title"
                  viewBtn="View Full Blog"
                  style={styles.itemStyle}
                  onItemPress={() =>
                    navigation.navigate('ViewBlog', {
                      item,
                      title: 'View Blog Title',
                    })
                  }
                />
                // </View>
              )}
              keyExtractor={item => item.id}
            />
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

export default Saved;
