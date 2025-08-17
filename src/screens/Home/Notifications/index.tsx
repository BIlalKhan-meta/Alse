// import {FlatList, Image, TouchableOpacity, View} from 'react-native';
// import styles from './styles';
// import {useIsFocused, useNavigation} from '@react-navigation/native';
// import InterBold from '../../../components/Text/InterBold';
// import {colors} from '../../../utils/theme';
// import Card from '../../../components/Card';
// import {images} from '../../../utils/images';
// import InterMedium from '../../../components/Text/InterMedium';
// import HorizontalSeparator from '../../../components/HorizontalSeparator';
// import {useEffect, useLayoutEffect, useState} from 'react';
// import {getNotifications, markAllRead, markRead} from '../../../api/home';
// import {EmptyComponent} from '../../../components/EmptyComponent';
// import {dateHelper, timeFormat} from '../../../utils';

// const Notifications: React.FC = ({navigation}) => {
//   const [data, setData] = useState([]);
//   const isFocused = useIsFocused();
//   const [loader, setLoader] = useState(false);

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <TouchableOpacity
//           onPress={markAllAsRead}
//           style={[styles.readBtn, {borderColor: colors.themeColor}]}>
//           <InterBold style={[styles.readTxt, {color: colors.themeColor}]}>
//             Mark All As Read
//           </InterBold>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   const markAsRead = async (id: string) => {
//     setLoader(true);
//     await markRead(id).then(res => {
//       if (res?.data) {
//         getData();
//       }
//     });
//   };
//   const markAllAsRead = async () => {
//     setLoader(true);
//     await markAllRead()
//       .then(res => {
//         if (res?.data) {
//           getData();
//         }
//       })
//       .catch(err => {
//         console.log('ERRORRRRR', err?.message);
//       });
//   };

//   const getData = async () => {
//     setLoader(true);
//     await getNotifications()
//       .then(res => {
//         if (res?.data) {
//           setData(res?.data?.data?.data);
//         }
//       })
//       .finally(() => {
//         setLoader(false);
//       });
//   };

//   useEffect(() => {
//     getData();
//   }, [isFocused]);

//   const renderItem = ({item}) => {
//     return (
//       <>
//         <View style={styles.container}>
//           <View style={styles.notiIcon}>
//             <Image
//               source={images.noti}
//               style={{width: '100%', height: '100%'}}
//             />
//           </View>
//           <View style={styles.innercontainer}>
//             <InterMedium
//               style={!item.read ? styles.readNoti : styles.notification}>
//               {item?.data?.message}
//             </InterMedium>
//             <View style={styles.unreadContainer}>
//               <InterMedium style={styles.time}>
//                 {dateHelper(item?.created_at)}
//               </InterMedium>

//               <InterMedium style={styles.time}>
//                 {timeFormat(item?.created_at)}
//               </InterMedium>

//               <TouchableOpacity
//                 onPress={() => markAsRead(item?.id)}
//                 style={styles.readBtn}>
//                 <InterBold style={styles.readTxt}>{`Mark As ${
//                   item?.read_at ? 'Unread' : 'Read'
//                 }`}</InterBold>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <HorizontalSeparator />
//       </>
//     );
//   };
//   return (
//     <View style={styles.contentCOntainer}>
//       <Card style={styles.cardContainer}>
//         <FlatList
//           refreshing={loader}
//           onRefresh={getData}
//           data={data}
//           renderItem={renderItem}
//           keyExtractor={(item, index) => item?.id}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{paddingBottom: 60}}
//           ListEmptyComponent={<EmptyComponent text={'No Notifications'} />}
//         />
//       </Card>
//     </View>
//   );
// };

// export default Notifications;
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import GlobalHeader from '../../../components/GlobalHeader';
import {colors} from '../../../utils/theme';
import {getNotifications} from '../../../api/home';
import {vh} from '../../../constant';
import moment from 'moment';
import {getDateSection} from '../../../utils/helpers';

interface Notification {
  id: string;
  data: {
    message: string;
    type: string;
  };
  user_id: string;
  created_at: string;
  read_at: string | null;
  content_image?: string;
  favorites?: number;
}

interface GroupedNotifications {
  title: string;
  data: Notification[];
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchNotifications();
  }, [isFocused]);

  useEffect(() => {
    if (notifications.length > 0) {
      groupNotifications();
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications();
      if (response?.data?.data?.data) {
        setNotifications(response.data.data.data);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupNotifications = () => {
    // ... existing grouping code ...
  };

  const handleMarkAsRead = async (id: string) => {
    // ... existing mark as read code ...
  };

  const handleMarkAllAsRead = async () => {
    // ... existing mark all as read code ...
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))}d ago`;
    }
  };

  const renderSectionHeader = (title: string) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  // Check if we need to show a section header for this item
  const shouldShowSectionHeader = (
    currentItem: Notification,
    index: number,
  ) => {
    if (index === 0) return true; // Always show header for first item

    const currentSection = getDateSection(currentItem.created_at);
    const previousSection = getDateSection(notifications[index - 1].created_at);

    return currentSection !== previousSection;
  };

  // Modified renderNotificationItem to include conditional section header
  const renderNotificationItemWithHeader = (
    item: Notification,
    index: number,
  ) => {
    const isLike = item.data.type === 'like';
    const userAction = isLike ? 'liked your post' : 'Mentioned you';
    const userName = isLike ? 'Alse' : 'Ali';
    const favorites = item.favorites || 0;

    return (
      <View>
        {/* Conditionally render section header */}
        {shouldShowSectionHeader(item, index) &&
          renderSectionHeader(getDateSection(item.created_at))}

        {/* Original notification item */}
        <TouchableOpacity
          style={styles.notificationItem}
          onPress={() => handleMarkAsRead(item.id)}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: `https://randomuser.me/api/portraits/men/${
                  item.user_id || '1'
                }.jpg`,
              }}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.notificationContent}>
            <Text style={styles.notificationText}>
              <Text style={styles.userName}>{userName} </Text>
              {userAction}
            </Text>

            <View style={styles.notificationMeta}>
              <Text style={styles.notificationMetaText}>
                {isLike ? 'like' : 'a mentioned'}{' '}
                {isLike && favorites > 0 ? `• favorites • ` : '• '}
                {getTimeAgo(item.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.contentImageContainer}>
            {/* Your image content here */}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderNotificationItem = ({item}: {item: Notification}) => {
    const isLike = item.data.type === 'like';
    const userAction = isLike ? 'liked your post' : 'Mentioned you';
    const userName = isLike ? 'Alse' : 'Ali';
    const favorites = item.favorites || 0;

    return (
      <TouchableOpacity
        style={styles.notificationItem}
        onPress={() => handleMarkAsRead(item.id)}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: `https://randomuser.me/api/portraits/men/${
                item.user_id || '1'
              }.jpg`,
            }}
            style={styles.profileImage}
          />
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.userName}>{userName} </Text>
            {userAction}
          </Text>

          <View style={styles.notificationMeta}>
            <Text style={styles.notificationMetaText}>
              {isLike ? 'like' : 'a mentioned'}{' '}
              {isLike && favorites > 0 ? `• favorites • ` : '• '}
              {getTimeAgo(item.created_at)}
            </Text>
          </View>
        </View>

        <View style={styles.contentImageContainer}>
          {/* <Image
            source={
              item.content_image
                ? {uri: item.content_image}
                : isLike
                ? require('../../../assets/images/post-image.jpg')
                : require('../../../assets/images/mention-image.jpg')
            }
            style={styles.contentImage}
          /> */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader icon={true} />

      <View style={styles.notificationCounter}>
        <Text style={styles.notificationCounterText}>
          {notifications.length === 0 ? (
            "You're all caught up!"
          ) : (
            <>
              You have{' '}
              <Text style={styles.notificationCounterNumber}>
                {notifications.length}
              </Text>{' '}
              new notification{notifications.length !== 1 ? 's' : ''}
            </>
          )}
        </Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={({item, index}) =>
          renderNotificationItemWithHeader(item, index)
        }
        refreshing={loading}
        onRefresh={fetchNotifications}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notificationCounter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  notificationCounterText: {
    fontSize: 14,
    color: '#333',
  },
  notificationCounterNumber: {
    fontSize: 14,
    color: colors.themeColor,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#333',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  userName: {
    fontWeight: 'bold',
    color: '#000',
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationMetaText: {
    fontSize: 12,
    color: '#777',
  },
  contentImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 6,
    overflow: 'hidden',
    marginLeft: 12,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  contentImage: {
    width: '100%',
    height: '100%',
  },
  listContentContainer: {
    paddingBottom: vh * 10,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});

export default Notifications;
