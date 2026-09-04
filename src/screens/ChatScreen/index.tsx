import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Search, ChevronDown, MoreVertical, ChevronLeft} from 'lucide-react-native';
import {images} from '../../utils/images';
import styles from './styles';
import GeneralModal from '../../components/GeneralModal';
import _ from 'lodash';
import {
  createChat,
  getConversations,
} from '../../api/home';
import moment from 'moment';
import Loader from '../../components/Loader';
import {EmptyComponent} from '../../components/EmptyComponent';
import SelectUserModal from './SelectUserModal';
import CreateGroupSheet from './CreateGroupSheet';
import {getProductSharePreviewText} from '../../utils/productSharePayload';
import {getPostSharePreviewText} from '../../utils/postSharePayload';
import {colors} from '../../utils/theme';
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
  const [createChatModal, setCreateChatModal] = useState(false);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);
  const [linkVisible, setLinkVisible] = useState(false);
  const [loader, setLoader] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChatItem | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);


  const [data, setData] = useState([]);

  const IsFocused = useIsFocused();
  const navigation = useNavigation();

  const sortChatsByLatest = (chats: ChatItem[] | undefined | null): ChatItem[] => {
    if (!Array.isArray(chats)) {
      return [];
    }
    return [...chats].sort((a, b) => {
      const aTime = a?.last_message?.created_at
        ? moment(a.last_message.created_at).valueOf()
        : 0;
      const bTime = b?.last_message?.created_at
        ? moment(b.last_message.created_at).valueOf()
        : 0;
      return bTime - aTime;
    });
  };

  const getData = () => {
    setLoader(true);
    getConversations({})
      .then(res => {
        setData(sortChatsByLatest(res?.data?.data));
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
        setData(sortChatsByLatest(res?.data?.data));
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

    let timeAgo = '';
    if (item?.last_message?.created_at) {
      const duration = moment.duration(moment().diff(moment(item.last_message.created_at)));
      if (duration.asDays() >= 1) {
        timeAgo = `${Math.floor(duration.asDays())}d ago`;
      } else if (duration.asHours() >= 1) {
        timeAgo = `${Math.floor(duration.asHours())}h ago`;
      } else if (duration.asMinutes() >= 1) {
        timeAgo = `${Math.floor(duration.asMinutes())}m ago`;
      } else {
        timeAgo = 'Just now';
      }
    }

    return (
      <TouchableOpacity
        style={styles.chatCard}
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
        <View style={styles.chatCardHeader}>
          <View style={styles.chatCardHeaderLeft}>
            <Image source={item?.image ? {uri: item.image} : images.profile} style={styles.avatar} />
            <View style={styles.chatCardTitleCol}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.time}>{timeAgo}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            onPress={() => {
              setSelectedItem(item);
              setMenuVisible(true);
            }}>
            <MoreVertical color="#000" size={20} />
          </TouchableOpacity>
        </View>
        <Text style={styles.lastMessage} numberOfLines={3}>
          {getPostSharePreviewText(item.last_message?.message) ||
            getProductSharePreviewText(item.last_message?.message) ||
            item.last_message?.message ||
            'No messages yet'}
        </Text>

        {/* Inline Menu */}
        {menuVisible && selectedItem?.id === item.id && (
          <View style={styles.popupMenu}>
            <TouchableOpacity
              style={styles.popupMenuItem}
              onPress={() => {
                setMenuVisible(false);
                if (isGroup) {
                  setReportVisible(true); // Leave Group
                } else {
                  setBlockVisible(true); // Block User
                }
              }}>
              <Text style={styles.popupMenuText}>
                {isGroup ? 'Leave' : 'Block User'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };


  const filteredData = data.filter((item: any) => {
    if (activeTab === 'All') { return true; }
    const isGroup = item?.group === true || item?.is_group === true || item?.type === 'group';
    if (activeTab === 'Groups') { return isGroup; }
    if (activeTab === 'Chats') { return !isGroup; }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#F8FAFE" barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                (navigation as any).navigate('HomeNavigation', {screen: 'Home'});
              }
            }}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ChevronLeft size={22} color={colors.black} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
        <View style={styles.headerIcons}>
          {/* <TouchableOpacity
            style={styles.manageTemplatesButton}
            onPress={() => navigation.navigate('SavedScripts')}>
            <Text style={styles.manageTemplatesText}>Manage Templates</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.newGroupButton}
            onPress={() => setCreateGroupModalVisible(true)}>
            <Text style={styles.newGroupButtonText}>New Group</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar & Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search color="#65676B" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search here"
            placeholderTextColor="#65676B"
            onChangeText={handleSearchTxt}
          />
        </View>
        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => setFilterVisible(!filterVisible)}>
          <Text style={styles.filterText}>{activeTab}</Text>
          <ChevronDown color="#65676B" size={16} />
        </TouchableOpacity>

        {/* Filter Popup */}
        {filterVisible && (
          <View style={styles.filterPopup}>
            {['All', 'Chats', 'Groups'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.filterPopupItem}
                onPress={() => {
                  setActiveTab(tab);
                  setFilterVisible(false);
                }}>
                <Text style={styles.filterPopupText}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Chat List */}
      <View style={styles.chatListContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item?.id?.toString() || index.toString()
          }
          contentContainerStyle={styles.chatList}
          ListEmptyComponent={<EmptyComponent text={'No chat found'} />}
          onScroll={() => {
            if (menuVisible) { setMenuVisible(false); }
            if (filterVisible) { setFilterVisible(false); }
          }}
        />
      </View>

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
