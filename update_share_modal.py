import re

with open('src/components/ShareModal/index.tsx', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace("import React, {useState} from 'react';", "import React, {useState, useEffect} from 'react';\nimport {getConversations} from '../../api/home';\nimport moment from 'moment';\nimport {ActivityIndicator} from 'react-native';\nimport {colors} from '../../utils/theme';")

# Remove DUMMY_CHATS
dummy_chats_pattern = r"// Dummy data to match the screenshot\nconst DUMMY_CHATS = \[.*?\];\n\n"
content = re.sub(dummy_chats_pattern, "", content, flags=re.DOTALL)

# Add state and effect
state_and_effect = """  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchChats();
    } else {
      setSearchQuery('');
      setSelectedIds([]);
    }
  }, [visible]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (visible) {
        fetchChats(searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchChats = (search = '') => {
    setLoading(true);
    getConversations({search})
      .then(res => {
        setChats(res?.data?.data || []);
      })
      .catch(err => {
        console.log('Error fetching chats for share:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };"""

content = content.replace("  const [searchQuery, setSearchQuery] = useState('');\n  const [selectedIds, setSelectedIds] = useState<number[]>([]);", state_and_effect)

# Update renderItem
old_render_item = "  const renderItem = ({item}: {item: typeof DUMMY_CHATS[0]}) => {"
new_render_item = """  const renderItem = ({item}: {item: any}) => {
    const isSelected = selectedIds.includes(item.id);
    const avatar = item?.image || item?.user?.avatar || 'https://via.placeholder.com/150';
    const name = item?.name || item?.user?.full_name || 'Unknown';
    const description = item?.last_message?.message || 'No messages yet';
    const time = item?.last_message?.created_at ? moment(item.last_message.created_at).local().fromNow() : '';"""

content = content.replace(old_render_item, new_render_item)

content = content.replace("item.avatar", "avatar")
content = content.replace("item.name", "name")
content = content.replace("item.description", "description")
content = content.replace("item.time", "time")

# Update FlatList
old_flatlist = """          <FlatList
            data={DUMMY_CHATS}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />"""

new_flatlist = """          {loading && chats.length === 0 ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color={colors.themeColor} />
            </View>
          ) : (
            <FlatList
              data={chats}
              keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
              renderItem={renderItem}
              style={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{padding: 20, alignItems: 'center'}}>
                  <Text style={{color: '#65676B'}}>No chats found</Text>
                </View>
              }
            />
          )}"""

content = content.replace(old_flatlist, new_flatlist)

with open('src/components/ShareModal/index.tsx', 'w') as f:
    f.write(content)

print("Replaced successfully")
