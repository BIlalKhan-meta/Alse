import React, {useState, useEffect} from 'react';
import {getConversations} from '../../api/home';
import moment from 'moment';
import {ActivityIndicator} from 'react-native';
import {colors} from '../../utils/theme';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {Search, Check, MoreHorizontal, Repeat} from 'lucide-react-native';
import styles from './styles';
import {getProductSharePreviewText} from '../../utils/productSharePayload';

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
  }, [searchQuery, visible]);

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
  };

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

  const renderItem = ({item}: {item: any}) => {
    const isSelected = selectedIds.includes(item.id);
    const avatar = item?.image || item?.user?.avatar || 'https://via.placeholder.com/150';
    const name = item?.name || item?.user?.full_name || 'Unknown';
    const description =
      getProductSharePreviewText(item?.last_message?.message) ||
      'No messages yet';
    const time = item?.last_message?.created_at ? moment(item.last_message.created_at).local().fromNow() : '';

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => toggleSelection(item.id)}>
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Check color="white" size={14} strokeWidth={3} />}
          </View>
        </View>

        <Image source={{uri: avatar}} style={styles.avatar} />

        <View style={styles.contentContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
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
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalBackground}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>
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
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ShareModal;
