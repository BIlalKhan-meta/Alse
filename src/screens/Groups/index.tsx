import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import GlobalHeader from '../../components/GlobalHeader';
import {vh, vw} from '../../constant';
import {useIsFocused} from '@react-navigation/native';
import {
  BadgeCheck,
  Bell,
  CircleUser,
  House,
  Mail,
  Plus,
  Search,
} from 'lucide-react-native';
import InterRegular from '../../components/Text/InterRegular';
import {images} from '../../utils/images';

import {RouteProp} from '@react-navigation/native';

type GroupsScreenRouteProp = RouteProp<
  {
    params: {
      newGroup?: {
        id: number;
        name: string;
        avatar: string;
        isVerified: boolean;
        time: string;
        lastMessage: string;
      };
    };
  },
  'params'
>;

const Groups = ({route}: {route: GroupsScreenRouteProp}) => {
  // Add a ref for the search input
  const searchInputRef = useRef<TextInput>(null);

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState('Groups');
  const [searchText, setSearchText] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for groups
  const mockGroups = [
    {
      id: 1,
      name: 'Fashion-Community',
      avatar: images.avatar, // Update path as per your project
      isVerified: true,
      time: '10:20 AM',
      lastMessage: 'Last message here',
    },
    {
      id: 2,
      name: 'Fashion-Community',
      avatar: images.avatar,
      isVerified: true,
      time: '10:15 AM',
      lastMessage: 'Last message here',
    },
    {
      id: 3,
      name: 'Fashion-Community',
      avatar: images.avatar,
      isVerified: true,
      time: '10:10 AM',
      lastMessage: 'Last message here',
    },
    {
      id: 4,
      name: 'Fashion-Community',
      avatar: images.avatar,
      isVerified: true,
      time: '10:05 AM',
      lastMessage: 'Last message here',
    },
    {
      id: 5,
      name: 'Fashion-Community',
      avatar: images.avatar,
      isVerified: true,
      time: '10:00 AM',
      lastMessage: 'Last message here',
    },
    {
      id: 6,
      name: 'Fashion-Community',
      avatar: images.avatar,
      isVerified: true,
      time: '09:55 AM',
      lastMessage: 'Last message here',
    },
    {
      id: 7,
      name: 'Fashion-Community',
      avatar: images.avatar,
      isVerified: true,
      time: '09:50 AM',
      lastMessage: 'Last message here',
    },
    {
      id: 8,
      name: 'Fashion-Community',
      avatar: images.avatar,
      isVerified: true,
      time: '09:45 AM',
      lastMessage: 'Last message here',
    },
  ];

  useEffect(() => {
    // Fetch groups data - using mock data for now
    fetchGroups();
  }, [isFocused]);

  const fetchGroups = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setGroups(mockGroups);
      setLoading(false);
    }, 500);
  };

  // Check if a new group was added
  useEffect(() => {
    if (route.params?.newGroup) {
      const newGroup = route.params.newGroup;

      // Check if the group already exists in the list
      const exists = groups.some(group => group.id === newGroup.id);

      if (!exists) {
        // Add the new group to the top of the list
        setGroups(prevGroups => [newGroup, ...prevGroups]);

        // Clear the route params to prevent adding the same group multiple times
        navigation.setParams({newGroup: null});
      }
    }
  }, [route.params?.newGroup]);

  // Modified handleSearch function
  const handleSearch = text => {
    setSearchText(text);

    // Filter groups based on search text
    const filteredGroups = text
      ? mockGroups.filter(group =>
          group.name.toLowerCase().includes(text.toLowerCase()),
        )
      : mockGroups;

    // Update the groups list
    setGroups(filteredGroups);

    // This ensures keyboard stays up
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
  };

  const renderGroup = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() =>
          navigation.navigate('GroupDetailsScreen', {groupId: item.id})
        }>
        <View style={styles.groupLeft}>
          <Image source={item.avatar} style={styles.groupAvatar} />
          <View style={styles.groupInfo}>
            <View style={styles.nameRow}>
              <InterRegular style={styles.groupName}>{item.name}</InterRegular>
              {item.isVerified && (
                // <Icon name="check-decagram" size={16} color="#009688" />
                <BadgeCheck size={16} color="#009688" />
              )}
            </View>
          </View>
        </View>
        <InterRegular style={styles.groupTime}>{item.time}</InterRegular>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <>
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E8E" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E8E"
            value={searchText}
            onChangeText={handleSearch}
            autoCorrect={false}
            keyboardType="default"
          />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Chats' && styles.activeTab]}
            onPress={() => setActiveTab('Chats')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'Chats' && styles.activeTabText,
              ]}>
              Chats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Groups' && styles.activeTab]}
            onPress={() => setActiveTab('Groups')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'Groups' && styles.activeTabText,
              ]}>
              Groups
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <GlobalHeader title="" showBack={false} />

      <View style={styles.content}>
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchGroups}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          removeClippedSubviews={false}
        />
      </View>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate('CreateGroup')}>
        {/* <Icon name="plus" size={24} color="#ffffff" /> */}
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Bottom Tab Bar - This would typically be handled by your navigation system */}
      {/* <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <House size={24} color="#8E8E8E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Search size={24} color="#8E8E8E" style={styles.searchIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Bell size={24} color="#8E8E8E" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <Mail size={24} color="#009688" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <CircleUser size={24} color="#8E8E8E" />
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    marginHorizontal: vh * 2,
    marginVertical: vh * 1,
    paddingHorizontal: vh * 1.5,
    height: vh * 5,
  },
  searchIcon: {
    marginRight: vh * 1,
  },
  searchInput: {
    flex: 1,
    fontSize: vh * 1.6,
    color: '#000000',
    padding: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: vh * 2,
    marginVertical: vh * 1,
  },
  tab: {
    paddingVertical: vh * 1,
    paddingHorizontal: vh * 3,
    borderRadius: 20,
    marginRight: vh * 1,
  },
  activeTab: {
    backgroundColor: '#0C959B',
  },
  tabText: {
    fontSize: vh * 1.6,
    color: '#8E8E8E',
  },
  activeTabText: {
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: vh * 10,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh * 1,
    paddingHorizontal: vh * 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    width: vh * 7,
    height: vh * 7,
    borderRadius: vh * 2.5,
  },
  groupInfo: {
    marginLeft: vh * 1.5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupName: {
    fontSize: vh * 1.6,
    color: '#000000',
    marginRight: vh * 0.5,
  },
  groupTime: {
    fontSize: vh * 1.4,
    color: '#8E8E8E',
  },
  fabButton: {
    position: 'absolute',
    bottom: vh * 8,
    right: vh * 2,
    width: vh * 5.5,
    height: vh * 5.5,
    borderRadius: vh * 2.75,
    backgroundColor: '#0C959B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: vh * 7,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: vh * 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: vh * 1,
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: '#0C959B',
  },
});

export default Groups;
