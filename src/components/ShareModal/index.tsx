import React, {useState, useEffect, useMemo} from 'react';
import {getConversations} from '../../api/home';
import moment from 'moment';
import {
  ActivityIndicator,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Keyboard,
  Dimensions,
} from 'react-native';
import {colors} from '../../utils/theme';
import {Search, Check, MoreHorizontal, Repeat} from 'lucide-react-native';
import styles from './styles';
import {getProductSharePreviewText} from '../../utils/productSharePayload';
import {getPostSharePreviewText} from '../../utils/postSharePayload';
import {getAbsoluteAvatarUrl} from '../../utils/helpers';
import {vh} from '../../constant';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onSendToChats: (selectedIds: number[]) => void;
  onShareToNewsfeed?: () => void;
  title?: string;
  showNewsfeedOption?: boolean;
  sendLabel?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  onShareToNewsfeed,
  onSendToChats,
  title = 'Share Post',
  showNewsfeedOption = true,
  sendLabel = 'Send',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      fetchChats();
    } else {
      setSearchQuery('');
      setSelectedIds([]);
      setKeyboardHeight(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: any) => {
      setKeyboardHeight(e?.endCoordinates?.height ?? 0);
    };
    const onHide = () => setKeyboardHeight(0);
    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [visible]);

  const fetchChats = () => {
    setLoading(true);
    getConversations({})
      .then(res => {
        setChats(res?.data?.data || []);
      })
      .catch(err => {
        console.log('Error fetching chats for share:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return chats;
    }
    return chats.filter((item: any) => {
      const name = String(
        item?.name || item?.user?.full_name || item?.user?.username || '',
      ).toLowerCase();
      const username = String(item?.user?.username || '').toLowerCase();
      return name.includes(q) || username.includes(q);
    });
  }, [chats, searchQuery]);

  if (!visible) {
    return null;
  }

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSend = () => {
    if (selectedIds.length > 0) {
      onSendToChats(selectedIds);
      onClose();
      return;
    }

    if (showNewsfeedOption && onShareToNewsfeed) {
      onShareToNewsfeed();
      onClose();
    }
  };

  const windowHeight = Dimensions.get('window').height;
  const sheetHeight = Math.min(
    vh * 85,
    Math.max(320, windowHeight - keyboardHeight - (Platform.OS === 'ios' ? 8 : 0)),
  );

  const renderItem = ({item}: {item: any}) => {
    const isSelected = selectedIds.includes(item.id);
    const rawAvatar =
      item?.image || item?.user?.avatar || '';
    const avatar =
      getAbsoluteAvatarUrl(rawAvatar) ||
      rawAvatar ||
      'https://via.placeholder.com/150';
    const name = item?.name || item?.user?.full_name || 'Unknown';
    const description =
      getPostSharePreviewText(item?.last_message?.message) ||
      getProductSharePreviewText(item?.last_message?.message) ||
      item?.last_message?.message ||
      'No messages yet';
    const time = item?.last_message?.created_at
      ? moment(item.last_message.created_at).local().fromNow()
      : '';

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => toggleSelection(item.id)}>
        <View style={styles.checkboxContainer}>
          <View
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Check color="white" size={14} strokeWidth={3} />}
          </View>
        </View>

        <Image source={{uri: avatar}} style={styles.avatar} />

        <View style={styles.contentContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <TouchableOpacity
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <MoreHorizontal color="#000" size={20} />
            </TouchableOpacity>
          </View>
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.modalBackground}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />

        <View style={[styles.container, {height: sheetHeight}]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>{sendLabel}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search color="#9CA3AF" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              blurOnSubmit={false}
            />
          </View>

          {showNewsfeedOption && onShareToNewsfeed ? (
            <TouchableOpacity
              style={styles.reshareButton}
              onPress={() => {
                onShareToNewsfeed();
                onClose();
              }}>
              <View style={styles.reshareIconContainer}>
                <Repeat color="#0C959B" size={20} />
              </View>
              <Text style={styles.reshareText}>Reshare on Newsfeed</Text>
            </TouchableOpacity>
          ) : null}

          {loading && chats.length === 0 ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color={colors.themeColor} />
            </View>
          ) : (
            <FlatList
              data={filteredChats}
              keyExtractor={(item, index) =>
                item?.id?.toString() || index.toString()
              }
              renderItem={renderItem}
              style={styles.listContainer}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{padding: 20, alignItems: 'center'}}>
                  <Text style={{color: '#65676B'}}>
                    {searchQuery.trim()
                      ? 'No chats match your search'
                      : 'No chats found'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ShareModal;
