import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useEffect, useLayoutEffect, useState} from 'react';
import {colors} from '../../utils/theme';
import Card from '../../components/Card';
import {images} from '../../utils/images';
import CustomButton from '../../components/CustomButton';
import InterRegular from '../../components/Text/InterRegular';
import Loader from '../../components/Loader';
import {
  getArticle,
  getBlog,
  getSimilarVideos,
  getVideo,
  updateArticleStatus,
  updateBlogStatus,
} from '../../api/education';
import {EmptyComponent} from '../../components/EmptyComponent';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import Video from 'react-native-video';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import MediaCard from '../../components/MediaCard';
import {vh} from '../../constant';
import InterBoldSmall from '../../components/Text/InterBoldSmall';

const ViewBlog: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [similar, setSimilar] = useState([]);

  const {id, title, type} = route?.params;
  const user = useSelector(selectUserProfile);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (type == 'blog') {
        res = await getBlog(id);
      } else if (type == 'article') {
        res = await getArticle(id);
      } else {
        res = await getVideo(id);
      }
      console.log('RESSSSSSSSSSSSSSSS');
      if (res?.data) {
        setItem(res?.data.data);
      }
    } catch (err) {
      console.error('GET ARTTTTTTICLESSSS ERRORRR', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async () => {
    try {
      let res = await getSimilarVideos(id);
      if (res?.data) {
        setSimilar(res?.data?.data);
      }
    } catch (err) {
      console.log('SIMILAR ERRRORRRRRRRRRRRR', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      fetchSimilar();
    }
  }, [id]);

  const statusUpdate = async () => {
    if (type == 'blog') {
      await updateBlogStatus(id).then(res => {
        if (res?.data) {
          fetchData();
        }
      });
    } else {
      await updateArticleStatus(id).then(res => {
        if (res?.data) {
          fetchData();
        }
      });
    }
  };

  const renderItem = ({item}: any) => {
    return (
      <MediaCard
        type={'video'}
        source={item?.video}
        title={item?.title}
        description={item?.content}
        category={item?.category?.title}
        onBookmarkPress={() => {}}
        onItemPress={() =>
          navigation.navigate('ViewBlog', {
            id: item?.id,
            title: item?.title,
            type: 'video',
          })
        }
      />
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      headerTitle: () => {
        return (
          <InterBoldSmall style={styles.header_title}>{title}</InterBoldSmall>
        );
      },
      // headerTitleStyle: {
      //   color: colors.black,
      // },
      // headerRight: () => (
      //   <>
      //     <TouchableOpacity
      //       style={styles.postButton}
      //       onPress={() => {
      //         if (title == 'My Blogs') {
      //           navigation.navigate('AddBlog', {title: 'Update Blog'});
      //         } else if (title == 'Blog Title') {
      //           navigation.navigate('AddBlog', {title: 'Update Blog'});
      //         } else if (title == 'Video') {
      //           navigation.navigate('AddBlog', {title: 'Update Video'});
      //         } else {
      //           navigation.navigate('AddBlog', {title: 'Update Article'});
      //         }
      //       }}>
      //       <Image source={images.edit} />
      //     </TouchableOpacity>
      //   </>
      // ),
    });
  }, [navigation]);

  if (loading) {
    return <Loader />;
  }

  if (item == null) {
    return <EmptyComponent text={'No detail found'} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.contentContainer}>
        <View>
          {type == 'video' ? (
            <Video
              source={{
                uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              }}
              style={styles.media}
              controls={true}
              paused={false}
              repeat={true}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={item?.image ? {uri: item?.image} : images.blog1} // Replace with the correct image URL or require local image
              style={styles.blogImage}
              resizeMode="cover"
            />
          )}
          {item?.user_id == user?.id && (
            <View
              style={[
                styles.statusContainer,
                !item?.status && styles.activeContainer,
              ]}>
              <InterRegular style={styles.activeTitle}>
                {item?.status ? 'Active' : 'Inactive'}
              </InterRegular>
            </View>
          )}
        </View>

        <Text style={styles.blogTitle}>{item?.title}</Text>
        <Text style={styles.blogContent}>{item?.content && item?.content}</Text>

        {title == 'Video' && (
          <InterRegular style={styles.category}>{item.category}</InterRegular>
        )}

        {item?.user_id == user?.id && (
          <View style={styles.btnContainer}>
            <CustomButton
              style={styles.checkoutButton}
              txtstyle={styles.buttonTxt}
              onPress={() => {
                if (title == 'My Blogs') {
                  navigation.navigate('EditBlog', {title: 'Update Blog', item});
                } else if (title == 'Blog Title') {
                  navigation.navigate('EditBlog', {title: 'Update Blog', item});
                } else if (title == 'Video') {
                  navigation.navigate('EditBlog', {
                    title: 'Update Video',
                    item,
                  });
                } else {
                  navigation.navigate('EditBlog', {
                    title: 'Update Article',
                    item,
                  });
                }
              }}>
              {title == 'My Blogs'
                ? 'Edit Blog'
                : title == 'Video'
                ? 'Video'
                : 'Edit Article'}
            </CustomButton>

            <CustomButton
              style={styles.shoppingButton}
              txtstyle={styles.shoppingTxt}
              onPress={statusUpdate}>
              {item?.status ? 'Inactive ' : 'Active '}
              {title == 'My Blogs'
                ? 'Blog'
                : title == 'Video'
                ? 'Video'
                : 'Article'}
            </CustomButton>
          </View>
        )}
      </Card>

      {item?.user_id != user?.id && similar.length != 0 && (
        <>
          <InterBoldLabel style={styles.similar_header}>
            Similar Videos
          </InterBoldLabel>
          <FlatList
            data={similar}
            renderItem={renderItem}
            keyExtractor={(item: any) => item?.id.toString()}
            contentContainerStyle={{paddingTop: vh * 2}}
          />
        </>
      )}
    </ScrollView>
  );
};

export default ViewBlog;
