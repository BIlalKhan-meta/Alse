import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import styles from './styles';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import GeneralModal from '../../components/GeneralModal';
import _ from 'lodash';
import {
  createChat,
  getConversations,
} from '../../api/home';
import moment from 'moment';
import Loader from '../../components/Loader';
import {EmptyComponent} from '../../components/EmptyComponent';
import SearchComponent from '../../components/SearchComponent';
import CustomeImage from '../../components/CustomeImage';
import SelectUserModal from './SelectUserModal';
import CreateGroupSheet from './CreateGroupSheet';
interface ChatItem {
  id: number;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatar?: string;
  image?: string;
  group?: boolean;
  phone_number?: string;
  last_message?: {
    message: string;
    created_at: string;
  };
}

const ChatScreen: React.FC = () => {
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [createChatModal, setCreateChatModal] = useState(false);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);
  const [linkVisible, setLinkVisible] = useState(false);
  const [loader, setLoader] = useState(false);
  const [activeTab, setActiveTab] = useState('Chats');

  const [data, setData] = useState([]);

  const IsFocused = useIsFocused();
  const navigation = useNavigation();

  const getData = () => {
    setLoader(true);
    getConversations({})
      .then(res => {
        setData(res?.data?.data);
        setLoader(false);
      })
      .catch(Err => {
        setLoader(false);

        console.log('Error from get Conversation ', Err);
      });
  };

  const handleSearchTxt = _.debounce(val => {
    // console.log('val ==>', val);
    const searchData = {
      search: val,
    };
    console.log('searchData ===>', searchData);
    // setLoader(true)
    getConversations(searchData)
      .then(res => {
        setData(res?.data?.data);
        setLoader(false);
      })
      .catch(Err => {
        setLoader(false);

        console.log('Error from get Conversation ', Err);
      });
  });

  useEffect(() => {
    getData();
  }, [IsFocused]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (loader) {
    return <Loader />;
  }
  const renderItem = ({item}: {item: ChatItem}) => {
    const isGroup =
      (item as any)?.group === true ||
      (item as any)?.is_group === true ||
      (item as any)?.type === 'group';
    return (
      <TouchableOpacity
        style={styles.chatContainer}
        onPress={() =>
          (navigation as any).navigate('ChatOngoing', {
            id: item?.id,
            receiverId: (item as any)?.user_id,
            name: item?.name,
            phoneNumber: item?.phone_number || '+1234567890',
            user: {id: (item as any)?.user_id, avatar: item?.image},
            isGroup: isGroup || undefined,
          })
        }>
      <View style={styles.chatItem}>
        <View style={styles.avatarContainer}>
          <CustomeImage source={{uri: item?.image}} style={styles.avatar} />
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <InterMedium style={styles.name}>{item.name}</InterMedium>
            <InterRegular style={styles.time}>
              {moment(item?.last_message?.created_at).local().fromNow()}
            </InterRegular>
          </View>
          <InterRegular style={styles.lastMessage}>
            {item.last_message?.message
              ? item.last_message?.message
              : 'No messages yet'}
          </InterRegular>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderTabButton = (tabName: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tabName && styles.activeTabButton,
      ]}
      onPress={() => setActiveTab(tabName)}>
      <Text
        style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>
        {tabName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alse</Text>
        <View style={styles.headerIcons}>
          {/* <TouchableOpacity style={styles.iconButton}>
            <Image source={images.searchIcon} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={images.bellIcon} style={styles.headerIcon} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchComponent onSearch={handleSearchTxt} placeholder="Search" />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('Chats')}
        {renderTabButton('Groups')}
      </View>

      {/* Chat List */}
      {activeTab === 'Chats' && (
        <View style={styles.chatListContainer}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            contentContainerStyle={styles.chatList}
            ListEmptyComponent={() => <EmptyComponent text={'No chat found'} />}
          />
        </View>
      )}

      {/* Groups List */}
      {activeTab === 'Groups' && (
        <View style={styles.chatListContainer}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data.filter(
              (item: any) => item?.group === true || item?.is_group === true || item?.type === 'group',
            )}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            contentContainerStyle={styles.chatList}
            ListEmptyComponent={() => <EmptyComponent text={'No groups found'} />}
          />
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setFabMenuVisible(!fabMenuVisible)}>
        <Image source={images.chatIcon} style={styles.fabIcon} />
      </TouchableOpacity>

      {/* FAB Action Menu */}
      <Modal
        visible={fabMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFabMenuVisible(false)}>
        <TouchableOpacity
          style={styles.fabMenuOverlay}
          activeOpacity={1}
          onPress={() => setFabMenuVisible(false)}>
          <View style={styles.fabMenuContainer}>
            <TouchableOpacity
              style={[styles.fabMenuOption, styles.fabMenuOptionFirst]}
              onPress={() => {
                setFabMenuVisible(false);
                setCreateChatModal(true);
              }}>
              <Text style={styles.fabMenuOptionText}>Start chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuOption}
              onPress={() => {
                setFabMenuVisible(false);
                setCreateGroupModalVisible(true);
              }}>
              <Text style={styles.fabMenuOptionText}>Create group</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <GeneralModal
        visible={reportVisible}
        closeModal={() => setReportVisible(false)}
        icon={images.qmark}
        title="Leave Group"
        message="Are you sure you want to leave this group?"
        SecondaryText1="Yes"
        SecondaryText2="No"
        buttonText="Yes"
        onPress={() => {
          setReportVisible(false);
          setReportSuccess(true);
        }}
        secondaryBtn={true}
        primaryBtn={false}
      />

      <SelectUserModal
        visible={createChatModal}
        onClose={() => setCreateChatModal(false)}
        onSelect={user => {
          setLoader(true);
          const form = new FormData();
          form.append('user_id', user?.id);
          console.log('formformformformform ====>', form);
          createChat({user_id: user?.id})
            .then(res => {
              console.log('======>>>>', res);
              setLoader(false);
              getData();

              (navigation as any).navigate('ChatOngoing', {
                id: res?.data?.data?.id,
                receiverId: user?.id,
                name: res?.data?.data?.name,
                phoneNumber: res?.data?.data?.phoneNumber,
                user: {id: user?.id, avatar: res?.data?.data?.image},
              });

              // console.log('Respose from Create Chat', res?.data?.data);
            })
            .catch(err => {
              setLoader(false);
              console.log('Error from Create Chat -----', err);
            });
        }}
      />

      <CreateGroupSheet
        visible={createGroupModalVisible}
        onClose={() => setCreateGroupModalVisible(false)}
        onSuccess={groupData => {
          getData();
          (navigation as any).navigate('ChatOngoing', {
            id: groupData?.id,
            receiverId: null,
            name: groupData?.name,
            phoneNumber: '',
            user: {id: null, avatar: groupData?.image},
            isGroup: true,
          });
        }}
      />

      <GeneralModal
        visible={ReportSuccess}
        closeModal={() => setReportSuccess(false)}
        icon={images.checkedIcon}
        title="Leave Group"
        message="Group has been leave successfully."
        buttonText="Ok"
        onPress={() => {
          setReportSuccess(false);
        }}
        primaryBtn={true}
      />

      <GeneralModal
        visible={blockVisible}
        closeModal={() => setBlockVisible(false)}
        icon={images.qmark}
        title="Block User"
        message="Are you sure you want to block this Group?"
        SecondaryText1="Yes"
        SecondaryText2="No"
        buttonText="Yes"
        onPress={() => {
          setBlockVisible(false);
          setBlockSuccess(true);
        }}
        secondaryBtn={true}
        primaryBtn={false}
      />

      <GeneralModal
        visible={blockSuccess}
        closeModal={() => setBlockSuccess(false)}
        icon={images.checkedIcon}
        title="Block User"
        message="User has been blocked successfully!"
        buttonText="Ok"
        onPress={() => {
          setBlockSuccess(false);
        }}
        primaryBtn={true}
      />

      <GeneralModal
        visible={linkVisible}
        closeModal={() => setLinkVisible(false)}
        icon={images.checkedIcon}
        title="Get Link"
        message="Copy the link to share"
        buttonText="COPY"
        onPress={() => {
          setLinkVisible(false);
        }}
        primaryBtn={true}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
