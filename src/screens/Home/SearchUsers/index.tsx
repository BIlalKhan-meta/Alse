import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';
import Card from '../../../components/Card';
import {useIsFocused} from '@react-navigation/native';
import styles from './styles';
import SearchComponent from '../../../components/SearchComponent';
import {getAllUsers, userFollow, userUnFollow} from '../../../api/home';
import {FollowingCard} from '../../../components/FollowingCard';
import HorizontalSeparator from '../../../components/HorizontalSeparator';
import {EmptyComponent} from '../../../components/EmptyComponent';
import {colors} from '../../../utils/theme';

const DEBOUNCE_MS = 350;

const extractUsersPage = (res: any) => {
  const pageData = res?.data?.data ?? res?.data ?? {};
  const list = pageData?.data ?? (Array.isArray(pageData) ? pageData : []);
  const meta = pageData?.meta ?? res?.data?.meta ?? {};
  return {
    users: Array.isArray(list) ? list : [],
    currentPage: Number(meta?.current_page ?? pageData?.current_page ?? 1),
    lastPage: Number(meta?.last_page ?? pageData?.last_page ?? 1),
  };
};

const SearchUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [text, setText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const fetchData = useCallback(async (page: number, query: string, append: boolean) => {
    if (loadingRef.current && append) {
      return;
    }
    const requestId = ++requestIdRef.current;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await getAllUsers(page, query);
      if (requestId !== requestIdRef.current) {
        return;
      }
      const {users: nextUsers, currentPage: pageNum, lastPage: last} =
        extractUsersPage(res);
      setUsers(prev => (append ? [...prev, ...nextUsers] : nextUsers));
      setCurrentPage(pageNum);
      setLastPage(last);
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.error('Error fetching users:', error);
        if (!append) {
          setUsers([]);
        }
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    void fetchData(1, debouncedText, false);
  }, [isFocused, debouncedText, fetchData]);

  const onLoadMore = async () => {
    if (!loading && currentPage < lastPage) {
      await fetchData(currentPage + 1, debouncedText, true);
    }
  };

  const handleActionButton = async (userItem: any) => {
    const index = users.findIndex(item => item?.id === userItem?.id);
    if (index === -1) {
      return;
    }

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

  const renderUserItem = ({item}: {item: any}) => (
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
