import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import {ChevronLeft} from 'lucide-react-native';
import Card from '../../components/Card';
import styles from './styles';
import InterRegular from '../../components/Text/InterRegular';
import {images} from '../../utils/images';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import Loader from '../../components/Loader';
import {
  getFollowersList,
  getFollowingList,
  getRequestFollow,
  removeFollower,
  userFollow,
  userFollowAccept,
  userUnFollow,
} from '../../api/home';
import {FollowingCard} from '../../components/FollowingCard';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {colors} from '../../utils/theme';

const RequestScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const me = useSelector(selectUserProfile);

  const initialTab = Number(route.params?.initialTab) || 1;
  const profileUserId =
    route.params?.userId != null ? Number(route.params.userId) : undefined;
  const viewingOther =
    profileUserId != null &&
    Number.isFinite(profileUserId) &&
    me?.id != null &&
    profileUserId !== Number(me.id);

  const [active, setActive] = useState<number>(
    viewingOther && initialTab === 1 ? 2 : initialTab,
  );
  const [showSearch, setShowSearch] = useState(false);
  const [searchTxt, setSearchTxt] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const tab = Number(route.params?.initialTab);
    if (tab === 1 || tab === 2 || tab === 3) {
      setActive(viewingOther && tab === 1 ? 2 : tab);
    }
  }, [route.params?.initialTab, viewingOther]);

  useLayoutEffect(() => {
    const title =
      active === 1
        ? 'Follow Request'
        : active === 2
          ? 'Followers'
          : 'Following';

    const handleBack = () => {
      if ((navigation as any).canGoBack?.()) {
        navigation.goBack();
        return;
      }
      (navigation as any).navigate?.('TabNavigation');
    };

    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerBackButton}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={22} color={colors.black} strokeWidth={2.4} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setShowSearch(!showSearch);
          }}>
          <Image source={images.searchIcon} style={styles.icon} />
        </TouchableOpacity>
      ),
      // Prefer string title so it cannot cover the back button hit area.
      title: showSearch ? '' : title,
      headerTitle: showSearch
        ? () => (
            <View style={styles.searchContainer}>
              <TextInput
                value={searchTxt}
                onChangeText={setSearchTxt}
                style={styles.searchInput}
                placeholder="Search..."
                returnKeyType="search"
              />
            </View>
          )
        : undefined,
    });
  }, [navigation, showSearch, searchTxt, active]);

  const isFocused = useIsFocused();

  useEffect(() => {
    getApi();
  }, [active, isFocused, profileUserId]);

  const getApi = async () => {
    setLoading(true);
    try {
      if (active == 1) {
        if (viewingOther) {
          setData([]);
          return;
        }
        const res = await getRequestFollow();
        if (res?.data) {
          setData(res?.data?.data?.data || res?.data?.data || []);
        }
      } else if (active == 2) {
        const res = await getFollowersList(
          viewingOther ? profileUserId : undefined,
        );
        if (res?.data) {
          setData(res?.data?.data?.data || res?.data?.data || []);
        }
      } else {
        const res = await getFollowingList(
          viewingOther ? profileUserId : undefined,
        );
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

  const handleActionButton = async (status: string, id: number) => {
    let index = data.findIndex(item => item?.id == id);
    let arr = [...data];
    arr.splice(index, 1);
    setData(arr);

    if (status == 'Follow Back') {
      await userFollowAccept(data[index].user_id).then(async res => {
        if (res?.data) {
          await userFollow(data[index].user_id)
            .then(res => {
              if (res?.data) {
                console.log('USER FOLLOWED');
              }
            })
            .catch(err => console.log('FOLLOW ERROR', err));
        }
      });
    } else if (status == 'Unfollow') {
      await userUnFollow(data[index].following_id)
        .then(res => {
          if (res?.data) {
            console.log('USER UNFOLLOWED');
          }
        })
        .catch(err => {
          console.log('UNFOLLOW ERROR', err?.message);
        });
    } else {
      await removeFollower(data[index]?.user_id).then(res => {
        if (res?.data) {
          console.log('FOLLOWER REMOVED');
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
        text={
          viewingOther
            ? ''
            : active == 1
            ? 'Follow Back'
            : active == 2
            ? 'Remove'
            : 'Unfollow'
        }
        onPress={() =>
          handleActionButton(
            active == 1 ? 'Follow Back' : active == 2 ? 'Remove' : 'Unfollow',
            item?.id,
          )
        }
      />
      <HorizontalSeparator />
    </>
  );

  const emptyLabel = useMemo(() => {
    if (active === 1) return 'No Request to Show.';
    if (active === 2) return 'No followers yet.';
    return 'Not following anyone yet.';
  }, [active]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <InterRegular style={styles.emptyText}>{emptyLabel}</InterRegular>
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
            {!viewingOther ? (
              <TouchableOpacity
                style={active === 1 ? styles.activeBtn : styles.inactiveBtn}
                onPress={() => setActive(1)}>
                <InterRegular
                  style={active === 1 ? styles.activeTxt : styles.inactiveTxt}>
                  Follow Request
                </InterRegular>
              </TouchableOpacity>
            ) : null}

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

          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            renderItem={renderUserItem}
            ListEmptyComponent={renderEmpty}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.contentContainer}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

export default RequestScreen;
