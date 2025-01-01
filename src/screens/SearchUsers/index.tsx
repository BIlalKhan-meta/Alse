// Home.tsx
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';
import Card from '../../components/Card';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import styles from './styles';
import SearchComponent from '../../components/SearchComponent';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import Loader from '../../components/Loader';
import {getAllUsers, userFollow, userUnFollow} from '../../api/home';
import {FollowingCard} from '../../components/FollowingCard';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import {EmptyComponent} from '../../components/EmptyComponent';
import {colors} from '../../utils/theme';

const SearchUsers: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [text, setText] = useState('');

  // const handleSearch = (query: string) => {
  //   setText(query);
  //   let filtered = users.filter((item: any) =>
  //     item?.shop_name?.includes(query),
  //   );
  //   setFilteredData(filtered);
  // };

  useEffect(() => {
    getData();
  }, [isFocused, page, text]);

  useEffect(() => {
    const filterOrders = () => {
      let filtered = [...users];
      setFilteredData(filtered);
    };

    filterOrders();
  }, [users]);

  const getData = async () => {
    setLoading(true);

    const res = await getAllUsers(page, text);
    if (res?.data?.data?.length > 0) {
      setUsers(prev => [...prev, ...res?.data?.data]);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  const handleActionButton = async (userItem: any) => {
    let index = users.findIndex((item: any) => item?.id == userItem?.id);
    let arr = JSON.parse(JSON.stringify(users));

    if (!userItem?.is_following) {
      await userFollow(userItem?.id).then(res => {
        if (res?.data) {
          if (userItem?.is_private) {
            arr[index].is_follow_requested = true;
          } else {
            arr[index].is_following = true;
          }
        }
      });
    } else {
      await userUnFollow(userItem?.id).then(res => {
        if (res?.data) {
          arr[index].is_following = false;
        }
      });
    }

    setUsers(arr);
  };

  const renderUserItem = ({
    item,
  }: {
    item: {id: string; avatar: string; name: string; type: string};
  }) => (
    <>
      <FollowingCard
        item={{
          user_id: item?.id,
          avatar: item?.avatar,
          name: `${item?.first_name} ${item?.last_name}`,
        }}
        text={'Follow'}
        onPress={handleActionButton(item)}
      />
      <HorizontalSeparator />
    </>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Card>
        <SearchComponent onSearch={setText} placeholder="Find Users" />
        <FlatList
          showsVerticalScrollIndicator={false}
          data={users}
          onEndReached={() => {
            if (hasMore && !loading) {
              setPage(prevPage => prevPage + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loading ? (
              <ActivityIndicator size="large" color={colors.themeColor} />
            ) : null
          }
          renderItem={renderUserItem}
          ListEmptyComponent={<EmptyComponent text={'No Users Found'} />}
          keyExtractor={item => item?.id?.toString()}
          contentContainerStyle={styles.contentContainer}
        />
      </Card>
    </View>
  );
};

export default SearchUsers;
