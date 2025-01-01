import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Card from '../../components/Card';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import InterRegular from '../../components/Text/InterRegular';
import {images} from '../../utils/images';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import GeneralModal from '../../components/GeneralModal';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Loader from '../../components/Loader';
import {getUserBlockList, unBlockUser} from '../../store/slices/homeSlice';
import {useAppDispatch} from '../../hooks/storeHooks';
import {getMessage, Toast} from '../../utils/helpers';
import {FollowingCard} from '../../components/FollowingCard';
import {EmptyComponent} from '../../components/EmptyComponent';

const BlockedUsers: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isFoused = useIsFocused();

  const [blockVisible, setBlockVisible] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blockList, setBlockList] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerBtn}
          // onPress={() => navigation.navigate("AddProduct")}
        >
          <Image source={images.searchIcon} style={styles.icon} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    getApi();
  }, [isFoused]);

  const getApi = async () => {
    setLoading(true);
    const checkData = await dispatch(getUserBlockList());
    setBlockList(checkData?.payload?.data?.data?.data);
    setLoading(false);
    console.log(checkData?.payload?.data?.data?.data, 'checkkkkmetee');
  };

  if (loading) {
    return <Loader />;
  }

  const handleUnBlockUser = id => {
    let index = blockList.findIndex(item => item?.id == id);
    let arr = [...blockList];
    arr.splice(index, 1);
    setBlockList(arr);
    dispatch(unBlockUser(id))
      .unwrap()
      .then(res => {
        getApi();
        console.log('response from unblock Usere', res);
      })
      .catch(err => {
        Toast.error(getMessage(err?.message));
        console.log('err from unblock Usere', err);
      });
  };

  const renderUserItem = ({
    item,
  }: {
    item: {id: string; name: string; type: string};
  }) => (
    <>
      <FollowingCard
        text={'Unblock'}
        onPress={() => handleUnBlockUser(item?.id)}
        item={item}
      />
      <HorizontalSeparator />
    </>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Card>
          <FlatList
            data={blockList}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.contentContainer}
            ListEmptyComponent={
              <EmptyComponent text={'No Blocked Users Found'} />
            }
          />
        </Card>

        <GeneralModal
          visible={blockVisible}
          closeModal={() => setBlockVisible(false)}
          icon={images.qmark}
          title="Unblock User"
          message="Are you sure you want to unblock this user?"
          SecondaryText1="Yes"
          SecondaryText2="No"
          onPress={() => {
            setBlockVisible(false);
            setBlockSuccess(true);
          }}
          secondaryBtn={true}
        />

        <GeneralModal
          visible={blockSuccess}
          closeModal={() => setBlockSuccess(false)}
          icon={images.checkedIcon}
          title="Unblock User"
          message="User has been unblocked successfully!"
          buttonText="Ok"
          onPress={() => {
            setBlockSuccess(false);
            // navigation.navigate("Profile", { account: account })
          }}
          primaryBtn={true}
        />
      </View>
    </ScrollView>
  );
};

export default BlockedUsers;
