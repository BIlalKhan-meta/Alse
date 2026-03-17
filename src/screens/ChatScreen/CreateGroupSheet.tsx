import {BlurView} from '@react-native-community/blur';
import Checkbox from 'expo-checkbox';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {getAllUsers} from '../../api/home';
import {createGroup} from '../../api/home';
import CustomeImage from '../../components/CustomeImage';
import {vh, vw} from '../../constant';
import {changeUrlForData} from '../../utils/helpers';
import {colors} from '../../utils/theme';
import Toast from 'react-native-toast-message';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: (groupData: any) => void;
}

const CreateGroupSheet: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const filteredUsers = users.filter(
    (u: any) =>
      (u?.username || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (u?.name || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (u?.full_name || '')
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const toggleUser = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getAllUsers(1, '')
        .then(res => {
          if (res?.data && res?.data?.data?.data) {
            setUsers(res?.data?.data?.data || []);
          }
        })
        .catch(Err => {
          console.log('Error fetching users:', Err);
        })
        .finally(() => setLoading(false));
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setSearch('');
      setSelectedUserIds([]);
      setGroupName('');
    }
  }, [visible]);

  const handleCreate = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a group name',
      });
      return;
    }
    if (selectedUserIds.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select at least one member',
      });
      return;
    }

    setCreating(true);
    const formData = new FormData();
    formData.append('name', trimmedName);
    selectedUserIds.forEach((userId, index) => {
      formData.append(`users[${index}][user_id]`, userId.toString());
    });

    try {
      const res = await createGroup(formData);
      setCreating(false);
      onClose();
      onSuccess(res?.data?.data);
    } catch (err: any) {
      setCreating(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'Failed to create group. Please try again.',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent>
      <Toast />
      <BlurView
        style={{
          position: 'absolute',
          top: 100,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: -99,
        }}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="white"
      />

      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Group</Text>

          <TextInput
            style={styles.groupNameInput}
            placeholder="Enter group name"
            placeholderTextColor="#999"
            value={groupName}
            onChangeText={setGroupName}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search user..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.themeColor}
              style={styles.loader}
            />
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => toggleUser(item.id)}
                  activeOpacity={0.7}>
                  <CustomeImage
                    source={{uri: changeUrlForData(item.avatar)}}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.name}>
                      {item?.name || item?.full_name}
                    </Text>
                  </View>
                  <Checkbox
                    value={selectedUserIds.includes(item.id)}
                    onValueChange={() => toggleUser(item.id)}
                    color={selectedUserIds.includes(item.id) ? colors.themeColor : undefined}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !loading ? (
                  <Text style={styles.emptyText}>No users found</Text>
                ) : null
              }
            />
          )}

          <TouchableOpacity
            style={[
              styles.createButton,
              (creating || selectedUserIds.length === 0 || !groupName.trim()) &&
                styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={
              creating ||
              selectedUserIds.length === 0 ||
              !groupName.trim()
            }>
            {creating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.createButtonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    marginTop: 'auto',
    width: vw * 100,
    height: vh * 72,
    backgroundColor: 'white',
    borderTopLeftRadius: vw * 7,
    borderTopRightRadius: vw * 7,
    paddingVertical: vh * 3,
    paddingHorizontal: vh * 2,
  },
  content: {
    width: '100%',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'black',
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: 'black',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  loader: {
    marginTop: 40,
  },
  createButton: {
    backgroundColor: colors.themeColor,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGroupSheet;
