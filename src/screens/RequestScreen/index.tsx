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
  userFollow,
  userFollowAccept,
} from '../../api/home';
import Row from '../../components/Row';

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

  useEffect(() => {
    getApi();
  }, []);

  const getApi = async () => {
    setLoading(true);
    if (active == 1) {
      await getRequestFollow().then(res => {
        if (res?.data) {
          setData(res?.data?.data?.data);
          setLoading(false);
        }
      });
    } else if (active == 2) {
      await getFollowersList().then(res => {
        if (res?.data) {
          setData(res?.data?.data?.data);
          setLoading(false);
        }
      });
    } else {
      await getFollowingList().then(res => {
        if (res?.data) {
          setData(res?.data?.data?.data);
          setLoading(false);
        }
      });
    }
  };

  console.log('DATAAAAAAAAAAAAA', data);

  const handleActionButton = async (status: string, id: number) => {
    if (status == 'Follow Back') {
      await userFollowAccept(id).then(async res => {
        if (res?.data) {
          // let arr = [...data]
          // let index = data.findIndex((item)=>item?.user_id==id);
          // arr[index].
          await userFollow(id);
        }
      });
    } else if (status == 'Remove') {
    } else {
      await unFollowUser(id);
    }
  };

  const renderUserItem = ({
    item,
  }: {
    item: {id: string; avatar: string; name: string; type: string};
  }) => (
    <>
      <Row justify="space-between" style={{marginVertical: 0}}>
        <Row style={{marginVertical: 0}}>
          <Image
            source={item?.avatar ? {uri: item?.avatar} : images.user}
            style={styles.userAvatar}
          />
          <InterRegular style={styles.userName}>{item?.name}</InterRegular>
        </Row>
        <CustomButton
          onPress={() =>
            handleActionButton(
              active == 1 ? 'Follow Back' : active == 2 ? 'Remove' : 'Unfollow',
              item?.user_id,
            )
          }
          style={styles.secondaryBtn1}
          containerStyle={styles.buttonContainerStyle}
          txtstyle={styles.btnTxt}
          loading={followLoader}>
          {active == 1 ? 'Follow Back' : active == 2 ? 'Remove' : 'Unfollow'}
        </CustomButton>
      </Row>
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
