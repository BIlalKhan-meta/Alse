import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {FlatList, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../utils/theme';
import InterMedium from '../../components/Text/InterMedium';
import styles from './styles';
import Card from '../../components/Card';
import ContentSavedScreen from '../../components/ContentSaved';
import MediaCard from '../../components/MediaCard';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {getMyArticles, getMyBlogs, getMyVideos} from '../../api/education';
import Loader from '../../components/Loader';
import {EmptyComponent} from '../../components/EmptyComponent';
import {useTranslation} from 'react-i18next';

const MyBlogs: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const title = route?.params?.title || '';

  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState([]);

  const user = useSelector(selectUserProfile);
  const isFocused = useIsFocused();

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (title == 'My Articles') {
        res = await getMyArticles();
      } else if (title == 'My Blogs') {
        res = await getMyBlogs();
      } else {
        res = await getMyVideos();
      }

      if (res?.data) {
        setDisplay(res?.data?.data?.data);
      }
    } catch (err) {
      console.error('GET ARTTTTTTICLESSSS ERRORRR', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [title, isFocused]);

  const {t} = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      title: title,
      headerRight: () => (
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => {
            if (title == t('blogs.myBlogs')) {
              navigation.navigate('AddBlog', {title: t('blogs.addBlog')});
            } else if (title == 'My Videos') {
              navigation.navigate('AddBlog', {title: t('blogs.addVideos')});
            } else {
              navigation.navigate('AddBlog', {title: t('blogs.addArticle')});
            }
          }}>
          <InterMedium style={styles.postTxt}>
            {title == 'My Blogs'
              ? 'Add Blog'
              : title == 'My Videos'
              ? 'Add Videos'
              : 'Add Article'}
          </InterMedium>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // if (display.length == 0) {
  //   return <EmptyComponent text={'No Data Available'} />;
  // }

  return (
    <View style={styles.container}>
      {loading ? (
        <Loader />
      ) : display.length == 0 ? (
        <EmptyComponent text={'No Data Available'} />
      ) : title == 'My Videos' ? (
        <FlatList
          data={display}
          refreshing={loading}
          onRefresh={fetchData}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <Card style={styles.itemCard}>
              <MediaCard
                item={item}
                type={'video'}
                source={item?.video}
                title={item?.title}
                description={item?.content}
                category={item?.category?.title}
                onItemPress={() =>
                  navigation.navigate('ViewBlog', {
                    id: item?.id,
                    title: item?.title,
                    type: 'video',
                  })
                }
              />
            </Card>
          )}
          keyExtractor={item => item?.id?.toString()}
          contentContainerStyle={styles.container}
        />
      ) : (
        <FlatList
          data={display}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <Card style={styles.itemCard}>
              <ContentSavedScreen
                item={item}
                userId={user?.id}
                title={title == 'My Blogs' ? 'Blog Title' : 'Article Title'}
                viewBtn="View Full Blog"
                onItemPress={() =>
                  // navigation.navigate('ViewBlog', {
                  //   item,
                  //   title: title == 'My Blogs' ? 'Blog Title' : 'Article Title',
                  //   edit: true,
                  // })

                  navigation.navigate('ViewBlog', {
                    id: item?.id,
                    title: item?.title,
                    type:
                      title == 'My Blogs'
                        ? 'blog'
                        : title == 'My Articles'
                        ? 'article'
                        : null,
                  })
                }
                //  onAddToCart={handleAddToCart}
                // onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            </Card>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.container}
        />
      )}
    </View>
  );
};

export default MyBlogs;
