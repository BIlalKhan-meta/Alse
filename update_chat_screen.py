import re

with open('src/screens/ChatScreen/index.tsx', 'r') as f:
    content = f.read()

# Add Lucide icons
content = content.replace("import {useIsFocused, useNavigation} from '@react-navigation/native';", "import {useIsFocused, useNavigation} from '@react-navigation/native';\nimport {Search, ChevronDown, MoreVertical} from 'lucide-react-native';")

# Add state for menu
state_addition = """  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChatItem | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
"""
content = content.replace("  const [activeTab, setActiveTab] = useState('Chats');", "  const [activeTab, setActiveTab] = useState('All');\n" + state_addition)

# Update renderItem
old_render_item = """  const renderItem = ({item}: {item: ChatItem}) => {
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
  };"""

new_render_item = """  const renderItem = ({item}: {item: ChatItem}) => {
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
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.last_message?.message
            ? item.last_message?.message
            : 'No messages yet'}
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
  };"""

content = content.replace(old_render_item, new_render_item)

# Update return statement
old_return = """  return (
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
      </Modal>"""

new_return = """  const filteredData = data.filter((item: any) => {
    if (activeTab === 'All') return true;
    const isGroup = item?.group === true || item?.is_group === true || item?.type === 'group';
    if (activeTab === 'Groups') return isGroup;
    if (activeTab === 'Chats') return !isGroup;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F8FAFE" barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.manageTemplatesButton}>
            <Text style={styles.manageTemplatesText}>Manage Templates</Text>
          </TouchableOpacity>
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
          ListEmptyComponent={() => <EmptyComponent text={'No chat found'} />}
          onScroll={() => {
            if (menuVisible) setMenuVisible(false);
            if (filterVisible) setFilterVisible(false);
          }}
        />
      </View>"""

content = content.replace(old_return, new_return)

# Remove unused renderTabButton
content = re.sub(r"  const renderTabButton = \(tabName: string\) => \(.*?\);\n", "", content, flags=re.DOTALL)

with open('src/screens/ChatScreen/index.tsx', 'w') as f:
    f.write(content)

print("Replaced index.tsx successfully")
