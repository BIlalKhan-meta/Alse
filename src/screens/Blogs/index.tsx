// Home.tsx
import React, {act, useEffect, useLayoutEffect, useState} from 'react';
import {View, TouchableOpacity, FlatList} from 'react-native';
import {colors} from '../../utils/theme';
import Card from '../../components/Card';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import InterRegular from '../../components/Text/InterRegular';
import ContentSavedScreen from '../../components/ContentSaved';
import CustomButton from '../../components/CustomButton';
import MediaCard from '../../components/MediaCard';
import {getArticles, getBlogs, getVideos} from '../../api/education';
import {vh} from '../../constant';
import {EmptyComponent} from '../../components/EmptyComponent';
import Loader from '../../components/Loader';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import InterBoldLabel from '../../components/Text/InterBoldLabel';

const Blogs: React.FC = () => {
  const navigation = useNavigation();
  const [active, setActive] = useState<number>(1);
  const [display, setDisplay] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector(selectUserProfile);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: colors.headerColor},
      title:
        active === 1 ? 'Articles' : active === 2 ? 'Blogs' : 'Videos/Tutorials',
    });
  }, [navigation, active]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (active == 1) {
        res = await getArticles();
      } else if (active == 2) {
        res = await getBlogs();
      } else {
        res = await getVideos();
      }

      if (res?.data) {
        setDisplay(
          res.data.data.data.filter((item: any) => item.user_id != user.id),
        );
      }
    } catch (err) {
      // console.error('GET ARTTTTTTICLESSSS ERRORRR', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [active]);

  const renderFlatList = (data, renderItem, title) => {
    if (data.length == 0) {
      return <EmptyComponent text={`No Data Available`} />;
    }
    return (
      <FlatList
        onRefresh={fetchData}
        refreshing={loading}
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingTop: vh * 2}}
      />
    );
  };

  const renderItem = (item, type) => (
    <Card style={styles.itemCard}>
      {active == 1 || active == 2 ? (
        <ContentSavedScreen
          item={item}
          userId={user?.id}
          viewBtn={active == 1 ? 'View Full Article' : 'View Full Blog'}
          type={active == 1 ? 'article' : 'blog'}
          onItemPress={() =>
            navigation.navigate('ViewBlog', {
              id: item?.id,
              title: item?.title,
              type: active == 1 ? 'article' : 'blog',
            })
          }
        />
      ) : (
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
      )}
    </Card>
  );

  if (!user?.has_subscription) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.headerColor,
        }}>
        <InterBoldLabel>Subscription Required</InterBoldLabel>
        <CustomButton onPress={() => navigation.navigate('SubscriptionPlan')}>
          Subscribe
        </CustomButton>
      </View>
    );
  }

  // if (display.length == 0) {
  //   return <EmptyComponent text={'No Data Available'} />;
  // }

  return (
    <View style={styles.container}>
      <View style={styles.activeContainer}>
        {[1, 2, 3].map(index => (
          <TouchableOpacity
            key={index}
            style={active === index ? styles.activeBtn : styles.InactiveBtn}
            onPress={() => setActive(index)}>
            <InterRegular
              style={active === index ? styles.activeTxt : styles.InactiveTxt}>
              {index === 1 ? 'Articles' : index === 2 ? 'Blogs' : 'Videos'}
            </InterRegular>
          </TouchableOpacity>
        ))}
      </View>

      <View>
        {loading ? (
          <Loader style={{marginVertical: vh * 4}} />
        ) : active === 1 ? (
          renderFlatList(
            display,
            ({item}) => renderItem(item, 'article'),
            'My Articles',
          )
        ) : active === 2 ? (
          renderFlatList(
            display,
            ({item}) => renderItem(item, 'blog'),
            'My Blogs',
          )
        ) : (
          active === 3 &&
          renderFlatList(
            display,
            ({item}) => renderItem(item, 'media'),
            'My Videos',
          )
        )}
      </View>

      <CustomButton
        style={styles.btn}
        onPress={() =>
          navigation.navigate('MyBlogs', {
            title:
              active == 1
                ? 'My Articles'
                : active == 2
                ? 'My Blogs'
                : 'My Videos',
          })
        }>
        {active == 1 ? 'My Articles' : active == 2 ? 'My Blogs' : 'My Videos'}
      </CustomButton>
    </View>
  );
};

export default Blogs;
