import {FlatList, Image, TouchableOpacity, View} from 'react-native';
import styles from './styles';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import InterBold from '../../../components/Text/InterBold';
import {colors} from '../../../utils/theme';
import Card from '../../../components/Card';
import {images} from '../../../utils/images';
import InterMedium from '../../../components/Text/InterMedium';
import HorizontalSeparator from '../../../components/HorizontalSeparator';
import {useEffect, useLayoutEffect, useState} from 'react';
import {getNotifications, markAllRead, markRead} from '../../../api/home';
import {EmptyComponent} from '../../../components/EmptyComponent';
import {dateHelper, timeFormat} from '../../../utils';

const Notifications: React.FC = ({navigation}) => {
  const [data, setData] = useState([]);
  const isFocused = useIsFocused();
  const [loader, setLoader] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={markAllAsRead}
          style={[styles.readBtn, {borderColor: colors.themeColor}]}>
          <InterBold style={[styles.readTxt, {color: colors.themeColor}]}>
            Mark All As Read
          </InterBold>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const markAsRead = async (id: string) => {
    setLoader(true);
    await markRead(id).then(res => {
      if (res?.data) {
        getData();
      }
    });
  };
  const markAllAsRead = async () => {
    setLoader(true);
    await markAllRead()
      .then(res => {
        if (res?.data) {
          getData();
        }
      })
      .catch(err => {
        console.log('ERRORRRRR', err?.message);
      });
  };

  const getData = async () => {
    setLoader(true);
    await getNotifications()
      .then(res => {
        if (res?.data) {
          setData(res?.data?.data?.data);
        }
      })
      .finally(() => {
        setLoader(false);
      });
  };

  useEffect(() => {
    getData();
  }, [isFocused]);

  const renderItem = ({item}) => {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.notiIcon}>
            <Image
              source={images.noti}
              style={{width: '100%', height: '100%'}}
            />
          </View>
          <View style={styles.innercontainer}>
            <InterMedium
              style={!item.read ? styles.readNoti : styles.notification}>
              {item?.data?.message}
            </InterMedium>
            <View style={styles.unreadContainer}>
              <InterMedium style={styles.time}>
                {dateHelper(item?.created_at)}
              </InterMedium>

              <InterMedium style={styles.time}>
                {timeFormat(item?.created_at)}
              </InterMedium>

              <TouchableOpacity
                onPress={() => markAsRead(item?.id)}
                style={styles.readBtn}>
                <InterBold style={styles.readTxt}>{`Mark As ${
                  item?.read_at ? 'Unread' : 'Read'
                }`}</InterBold>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <HorizontalSeparator />
      </>
    );
  };
  return (
    <View style={styles.contentCOntainer}>
      <Card style={styles.cardContainer}>
        <FlatList
          refreshing={loader}
          onRefresh={getData}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => item?.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 60}}
          ListEmptyComponent={<EmptyComponent text={'No Notifications'} />}
        />
      </Card>
    </View>
  );
};

export default Notifications;
