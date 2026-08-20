import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import Card from '../../components/Card';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import InterRegular from '../../components/Text/InterRegular';
import {images} from '../../utils/images';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import InterBold from '../../components/Text/InterBold';
import {useAppDispatch} from '../../hooks/storeHooks';
import {
  acceptFollow,
  followUser,
  getFollowers,
  getFollowing,
  getFollowRequest,
  rejectFollow,
  unFollowUser,
} from '../../store/slices/homeSlice';
import Loader from '../../components/Loader';
import {getMessage, Toast} from '../../utils/helpers';
import CustomButton from '../../components/CustomButton';
import {colors} from '../../utils/theme';
import {
  getFollowersList,
  getFollowingList,
  getRequestFollow,
  removeFollower,
  userFollow,
  userFollowAccept,
  userUnFollow,
} from '../../api/home';
import Row from '../../components/Row';
import {FollowingCard} from '../../components/FollowingCard';

const RequestScreen: React.FC = () => {
  const navigation = useNavigation();
  // const isFoused = useIsFocused();
  const dispatch = useAppDispatch();

  const [active, setActive] = useState<number>(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTxt, setSearchTxt] = useState('');
  const [loading, setLoading] = useState(false);
  const [followLoader, setFollowLoader] = useState(false);
  const [data, setData] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setShowSearch(!showSearch);
            // setSearchTxt('');
            // setSearchResults([]); // Clear search results
            // setIsSearching(false); // Reset searching state
          }}>
          <Image source={images.searchIcon} style={styles.icon} />
        </TouchableOpacity>
      ),
      headerTitle: () => {
        return showSearch ? (
          <View style={styles.searchContainer}>
            <TextInput
              value={searchTxt}
              style={styles.searchInput}
              placeholder="Search..."
              // onSubmitEditing={() => getSearchChatApi()}
              // onChangeText={text => setSearchTxt(text)}
              returnKeyType="search"
            />
          </View>
        ) : (
          <>
            <InterBold style={styles.title}>
              {active === 1
                ? 'Follow Request'
                : active === 2
                ? 'Followers'
                : 'Following'}
            </InterBold>
          </>
        );
      },
    });
  }, [navigation, showSearch, searchTxt, active]);

  const isFocused = useIsFocused();

  useEffect(() => {
    getApi();
  }, [active, isFocused]);

  const getApi = async () => {
    setLoading(true);
    try {
      if (active == 1) {
        const res = await getRequestFollow();
        if (res?.data) {
          setData(res?.data?.data?.data || res?.data?.data || []);
        }
      } else if (active == 2) {
        const res = await getFollowersList();
        if (res?.data) {
          setData(res?.data?.data?.data || res?.data?.data || []);
        }
      } else {
        const res = await getFollowingList();
        if (res?.data) {
          setData(res?.data?.data?.data || res?.data?.data || []);
        }
      }
    } catch (e) {
      console.log('Following list error', e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  console.log('DATAAAAAAAAAAAAA', data);

  const handleActionButton = async (status: string, id: number) => {
    let index = data.findIndex(item => item?.id == id);
    let arr = [...data];
    arr.splice(index, 1);
    setData(arr);

    if (status == 'Follow Back') {
      await userFollowAccept(data[index].user_id).then(async res => {
        if (res?.data) {
          console.log('USERRRR ACCEPTEDDDDDDDDDDDD ');
          await userFollow(data[index].user_id)
            .then(res => {
              if (res?.data) {
                console.log('USERRRRRRRRRRRRR FOLOWWWWWWWWWWEDDDD');
              }
            })
            .catch(err => console.log('ERORRRRRRRRRRRRRRRR', err));
        }
      });
    } else if (status == 'Unfollow') {
      console.log('INDEXXXXXXXXXXXX', index);
      await userUnFollow(data[index].following_id)
        .then(res => {
          if (res?.data) {
            console.log('USERRRR UNFOLOWWWWWEDDDDDDDDDD========');
          }
        })
        .catch(err => {
          console.log('ERORRRRRRR', err?.message);
        });
    } else {
      await removeFollower(data[index]?.user_id).then(res => {
        if (res?.data) {
          console.log('USERRRR REMOVEDDDDDDDDDDDDDDDDDDDDDDD========');
        }
      });
    }
  };

  const renderUserItem = ({
    item,
  }: {
    item: {id: string; avatar: string; name: string; type: string};
  }) => (
    <>
      <FollowingCard
        item={item}
        text={active == 1 ? 'Follow Back' : active == 2 ? 'Remove' : 'Unfollow'}
        onPress={() =>
          handleActionButton(
            active == 1 ? 'Follow Back' : active == 2 ? 'Remove' : 'Unfollow',
            item?.id,
            item?.following_id,
          )
        }
      />
      <HorizontalSeparator />
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <InterRegular style={styles.emptyText}>No Request to Show.</InterRegular>
    </View>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Card>
          <View style={styles.activeContainer}>
            <TouchableOpacity
              style={active === 1 ? styles.activeBtn : styles.inactiveBtn}
              onPress={() => setActive(1)}>
              <InterRegular
                style={active === 1 ? styles.activeTxt : styles.inactiveTxt}>
                Follow Request
              </InterRegular>
            </TouchableOpacity>

            <TouchableOpacity
              style={active === 2 ? styles.activeBtn : styles.inactiveBtn}
              onPress={() => setActive(2)}>
              <InterRegular
                style={active === 2 ? styles.activeTxt : styles.inactiveTxt}>
                Followers
              </InterRegular>
            </TouchableOpacity>

            <TouchableOpacity
              style={active === 3 ? styles.activeBtn : styles.inactiveBtn}
              onPress={() => setActive(3)}>
              <InterRegular
                style={active === 3 ? styles.activeTxt : styles.inactiveTxt}>
                Following
              </InterRegular>
            </TouchableOpacity>
          </View>

          {/* Render user list based on active tab using FlatList */}
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            renderItem={renderUserItem}
            ListEmptyComponent={renderEmpty}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.contentContainer}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

export default RequestScreen;
