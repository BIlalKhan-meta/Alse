import {BlurView} from '@react-native-community/blur';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {getAllUsers, getFollowingList} from '../../api/home';
import CustomeImage from '../../components/CustomeImage';
import {vh, vw} from '../../constant';
import {changeUrlForData} from '../../utils/helpers';

interface Props {
  visible: boolean;

  onClose: () => void;
  onSelect: (user: any) => void;
}

const SelectUserModal: React.FC<Props> = ({
  visible,

  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  const filteredUsers = users.filter((u: any) =>
    (u?.username || '').toLowerCase().includes(search.toLowerCase()),
  );

  const getSubtitle = (user: any) => {
    if (user.is_following) return 'You follow';
    if (user.is_follow_requested) return 'Request sent';
    return 'Not following';
  };

  useEffect(() => {
    // getFollowingList()
    getAllUsers(1, '')
      .then(res => {
        if (res?.data && res?.data?.data?.data) {
          console.log('----', res?.data?.data?.data);
          setUsers(res?.data?.data?.data || []);
        }
      })
      .catch(Err => {
        console.log('error------', Err);
      });
  }, []);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent>
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
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        onPress={onClose}
      />

      <View style={styles.overlay}>
        <View style={{width: '100%'}}>
          <Text style={styles.title}>Select User</Text>

          {/* Search Box */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search user..."
            value={search}
            onChangeText={setSearch}
          />

          {/* Users List */}
          <FlatList
            data={filteredUsers}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity
                key={index}
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}>
                <CustomeImage
                  source={{uri: changeUrlForData(item.avatar)}}
                  style={styles.avatar}
                />

                <View>
                  <Text style={styles.name}>
                    {item?.name || item?.full_name}
                  </Text>
                  {/* <Text style={styles.smallText}>{getSubtitle(item)}</Text> */}
                </View>
              </TouchableOpacity>
            )}
          />
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  smallText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SelectUserModal;
