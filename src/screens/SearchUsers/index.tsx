import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';
import Card from '../../components/Card';
import {useIsFocused} from '@react-navigation/native';
import styles from './styles';
import SearchComponent from '../../components/SearchComponent';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {getAllUsers, userFollow, userUnFollow} from '../../api/home';
import {FollowingCard} from '../../components/FollowingCard';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import {EmptyComponent} from '../../components/EmptyComponent';
import {colors} from '../../utils/theme';

const SearchUsers: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [text, setText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (isFocused) {
      resetAndFetchData();
    }
  }, [isFocused, text]);

  const resetAndFetchData = async () => {
    setUsers([]);
    setCurrentPage(1);
    await fetchData(1);
  };

  const onLoadMore = async () => {
    if (!loading && currentPage < lastPage) await fetchData(currentPage + 1);
  };

  const fetchData = async (page = currentPage) => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await getAllUsers(page, text);
      console.log('RESSSSS=====================', res?.data);
      setUsers(prev => [...prev, ...res.data.data.data]);
      setCurrentPage(res?.data?.data?.meta?.current_page);
      setLastPage(res?.data?.data?.meta?.last_page);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionButton = async userItem => {
    const index = users.findIndex(item => item?.id === userItem?.id);
    if (index === -1) return;

    const updatedUsers = [...users];
    try {
      if (userItem?.is_follow_requested || userItem?.is_following) {
        const res = await userUnFollow(userItem?.id);
        if (res?.data) {
          updatedUsers[index].is_following = false;
          updatedUsers[index].is_follow_requested = false;
        }
      } else {
        const res = await userFollow(userItem?.id);
        if (res?.data) {
          updatedUsers[index].is_following = !userItem?.is_private;
          updatedUsers[index].is_follow_requested = userItem?.is_private;
        }
      }
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const renderUserItem = ({item}) => (
    <>
      <FollowingCard
        item={{
          user_id: item?.id,
          avatar: item?.avatar,
          name: `${item?.full_name}`,
        }}
        text={
          item.is_follow_requested
            ? 'Requested'
            : item.is_following
            ? 'Unfollow'
            : 'Follow'
        }
        onPress={() => handleActionButton(item)}
      />
      <HorizontalSeparator />
    </>
  );

  return (
    <View style={styles.container}>
      <Card>
        <SearchComponent
          onSearch={searchText => {
            setText(searchText);
            // resetAndFetchData();
          }}
          placeholder="Find Users"
        />
        <FlatList
          data={users}
          keyExtractor={item => item?.id?.toString()}
          renderItem={renderUserItem}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loading ? (
              <ActivityIndicator size="large" color={colors.themeColor} />
            ) : null
          }
          ListEmptyComponent={
            !loading && users.length === 0 ? (
              <EmptyComponent text="No Users Found" />
            ) : null
          }
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      </Card>
    </View>
  );
};

export default SearchUsers;
