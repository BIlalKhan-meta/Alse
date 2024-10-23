import {Text, View, Image, TouchableOpacity} from 'react-native';
import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useEffect, useLayoutEffect, useState} from 'react';
import {colors} from '../../utils/theme';
import Card from '../../components/Card';
import {images} from '../../utils/images';
import CustomButton from '../../components/CustomButton';
import InterRegular from '../../components/Text/InterRegular';
import InterMedium from '../../components/Text/InterMedium';
import Loader from '../../components/Loader';
import {getBlog} from '../../api/education';
import {EmptyComponent} from '../../components/EmptyComponent';

const ViewBlog: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);

  const {id, title, edit} = route?.params;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getBlog(id);
      if (res?.data) {
        // console.log('BLOGGGGGGGGGGGGG', res?.data?.data);
        setItem(res?.data.data);
      }
    } catch (err) {
      console.error('GET ARTTTTTTICLESSSS ERRORRR', err);
    } finally {
      setLoading(false);
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
      headerTitle: `${title}`,
      headerTitleStyle: {
        color: colors.black,
      },
      headerRight: () => (
        <>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => {
              if (title == 'My Blogs') {
                navigation.navigate('AddBlog', {title: 'Update Blog'});
              } else if (title == 'Blog Title') {
                navigation.navigate('AddBlog', {title: 'Update Blog'});
              } else if (title == 'Video') {
                navigation.navigate('AddBlog', {title: 'Update Video'});
              } else {
                navigation.navigate('AddBlog', {title: 'Update Article'});
              }
            }}>
            <Image source={images.edit} />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation]);

  if (loading) {
    return <Loader />;
  }

  if (item == null) {
    return <EmptyComponent text={'No detail found'} />;
  }
  return (
    <View style={styles.container}>
      <Card style={styles.contentContainer}>
        <View>
          <Image
            source={item?.image ? {uri: item?.image} : images.blog1} // Replace with the correct image URL or require local image
            style={styles.blogImage}
            resizeMode="cover"
          />
          {edit && (
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

        {edit && (
          <View style={styles.btnContainer}>
            <CustomButton
              style={styles.checkoutButton}
              txtstyle={styles.buttonTxt}
              onPress={() => {
                if (title == 'My Blogs') {
                  navigation.navigate('AddBlog', {title: 'Update Blog'});
                } else if (title == 'Blog Title') {
                  navigation.navigate('AddBlog', {title: 'Update Blog'});
                } else if (title == 'Video') {
                  navigation.navigate('AddBlog', {title: 'Update Video'});
                } else {
                  navigation.navigate('AddBlog', {title: 'Update Article'});
                }
              }}>
              {title == 'My Blogs'
                ? 'Blog'
                : title == 'Video'
                ? 'Video'
                : 'Article'}
            </CustomButton>

            <CustomButton
              style={styles.shoppingButton}
              txtstyle={styles.shoppingTxt}>
              Inactive{' '}
              {title == 'My Blogs'
                ? 'Blog'
                : title == 'Video'
                ? 'Video'
                : 'Article'}
            </CustomButton>
          </View>
        )}
      </Card>
    </View>
  );
};

export default ViewBlog;
