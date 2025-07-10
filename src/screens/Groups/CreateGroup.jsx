import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import GlobalHeader from '../../components/GlobalHeader';
import {vh, vw} from '../../constant';
import {
  Check,
  ChevronRight,
  Plus,
  Search,
  CheckCircle,
  Edit2,
  Bell,
  Home,
  ChevronLeft,
} from 'lucide-react-native';
import InterRegular from '../../components/Text/InterRegular';
import InterBold from '../../components/Text/InterBold';
import {colors} from '../../utils/theme';
import axios from 'axios';
import {colors as themeColors} from '../../utils/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const CreateGroup = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1); // 1: Initial, 2: User selection, 3: Group settings
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchText, setSearchText] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Mock users data
  const mockUsers = [
    {
      id: 1,
      name: 'Alse',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      lastSeen: 'Last unit Week, I am the best 🔥',
      selected: false,
    },
    {
      id: 2,
      name: 'Aaron',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      lastSeen: 'Last unit Week, I am the best 🔥',
      selected: false,
    },
    {
      id: 3,
      name: 'Ali',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      lastSeen: 'Last unit Week, I am the best 🔥',
      selected: false,
    },
    {
      id: 4,
      name: 'Haris',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      lastSeen: 'Last unit Week, I am the best 🔥',
      selected: false,
    },
    {
      id: 5,
      name: 'Alse',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      lastSeen: 'Last unit Week, I am the best 🔥',
      selected: false,
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  };

  const handleSearch = text => {
    setSearchText(text);
    if (text) {
      const filteredUsers = mockUsers.filter(user =>
        user.name.toLowerCase().includes(text.toLowerCase()),
      );
      setUsers(filteredUsers);
    } else {
      setUsers(mockUsers);
    }
  };

  const handleSelectUser = user => {
    const isSelected = selectedUsers.some(u => u.id === user.id);

    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const selectedAsset = response.assets[0];
        setGroupImage({
          uri: selectedAsset.uri,
          type: selectedAsset.type,
          name: selectedAsset.fileName || `image_${Date.now()}.jpg`,
        });
      }
    });
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user');
      return;
    }

    setCreating(true);

    // Prepare form data for the API call
    const formData = new FormData();
    formData.append('name', groupName);
    formData.append('description', groupDescription);

    if (groupImage) {
      formData.append('picture', groupImage);
    }

    // Add selected users to the form data
    selectedUsers.forEach((user, index) => {
      formData.append(`users[${index}][user_id]`, user.id.toString());
    });

    try {
      // For demo purposes, we'll simulate a successful API call
      // In a real app, you would make an actual API call:
      /*
      const response = await axios.post(
        'https://yourdomain.com/api/chat/group/create',
        formData,
        {
          headers: {
            'Authorization': 'Bearer YOUR_AUTH_TOKEN',
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      */

      // Simulate API call delay
      setTimeout(() => {
        setCreating(false);
        navigation.navigate('Groups', {
          newGroup: {
            id: Date.now(),
            name: groupName,
            avatar: groupImage
              ? groupImage.uri
              : 'https://randomuser.me/api/portraits/men/1.jpg',
            isVerified: true,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            lastMessage: 'Group created',
          },
        });
      }, 1500);
    } catch (error) {
      setCreating(false);
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  // STEP 1: Initial Group Creation
  const renderStep1 = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#8E8E8E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E8E"
          />
        </View>

        <View style={styles.formContainer}>
          <InterBold style={styles.sectionTitle}>New Group</InterBold>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Group Name"
              placeholderTextColor="#8E8E8E"
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          <View style={styles.membersSection}>
            <InterBold style={styles.memberTitle}>
              Members: {selectedUsers.length}
            </InterBold>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectedUsersScroll}>
              {selectedUsers.map((user, index) => (
                <View key={user.id} style={styles.selectedUserCard}>
                  <Image
                    source={{uri: user.avatar}}
                    style={styles.userAvatar}
                  />
                  <InterRegular style={styles.userName}>
                    {user.name}
                  </InterRegular>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addUserButton}
                onPress={() => setStep(2)}>
                <Plus size={24} color="#666" />
              </TouchableOpacity>
            </ScrollView>
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Enter Group description (optional)..."
            placeholderTextColor="#8E8E8E"
            multiline
            value={groupDescription}
            onChangeText={setGroupDescription}
          />
        </View>
      </ScrollView>
    );
  };

  // STEP 2: User Selection
  const renderStep2 = () => {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#8E8E8E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E8E"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.selectedUsersHeader}>
          <InterBold style={styles.selectedUsersTitle}>
            Create a group{' '}
            {selectedUsers.length > 0
              ? `(${selectedUsers.length} of 225 selected)`
              : ''}
          </InterBold>

          {selectedUsers.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectedUsersRow}>
              {selectedUsers.map(user => (
                <View key={user.id} style={styles.selectedUserBubble}>
                  <Image
                    source={{uri: user.avatar}}
                    style={styles.selectedUserAvatar}
                  />
                  <InterRegular style={styles.selectedUserName}>
                    {user.name}
                  </InterRegular>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <InterBold style={styles.recentTitle}>Most Recent</InterBold>

        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => handleSelectUser(item)}>
              <View style={styles.userItemLeft}>
                <Image
                  source={{uri: item.avatar}}
                  style={styles.userListAvatar}
                />
                <View style={styles.userDetails}>
                  <InterBold style={styles.userListName}>{item.name}</InterBold>
                  <InterRegular style={styles.userLastSeen}>
                    {item.lastSeen}
                  </InterRegular>
                </View>
              </View>

              {selectedUsers.some(user => user.id === item.id) && (
                <View style={styles.selectedCheck}>
                  <CheckCircle size={20} color={themeColors.themeColor} />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // STEP 3: Group Settings
  const renderStep3 = () => {
    return (
      <View style={styles.container}>
        <View style={styles.groupHeader}>
          <View style={styles.groupHeaderContent}>
            <TouchableOpacity
              style={styles.groupImageContainer}
              onPress={pickImage}>
              {groupImage ? (
                <Image
                  source={{uri: groupImage.uri}}
                  style={styles.groupHeaderImage}
                />
              ) : (
                <View style={styles.groupImagePlaceholder}>
                  <Plus size={24} color="#666" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.groupHeaderInfo}>
              <View style={styles.groupNameRow}>
                <InterBold style={styles.groupHeaderName}>
                  {groupName || 'Fashion'} 🔥
                </InterBold>
                <TouchableOpacity style={styles.editButton}>
                  <Edit2 size={16} color={themeColors.themeColor} />
                </TouchableOpacity>
              </View>
              <InterRegular style={styles.groupSubtitle}>
                {selectedUsers[0]?.name} and {selectedUsers.length - 1} others
              </InterRegular>
            </View>
          </View>

          <View style={styles.groupDescription}>
            <InterRegular style={styles.descriptionText}>
              {groupDescription ||
                'Description: Lorem ipsum is simply dummy text of the printing and typesetting industry.'}
            </InterRegular>
          </View>
        </View>

        <View style={styles.membersSection}>
          <InterBold style={styles.memberTitle}>
            Members: {selectedUsers.length}
          </InterBold>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedUsersScroll}>
            {selectedUsers.map((user, index) => (
              <View key={user.id} style={styles.selectedUserCard}>
                <Image source={{uri: user.avatar}} style={styles.userAvatar} />
                <InterRegular style={styles.userName}>{user.name}</InterRegular>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addUserButton}
              onPress={() => setStep(2)}>
              <Plus size={24} color="#666" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <View style={styles.settingIcon}>
                <InterRegular style={styles.settingIconText}>L</InterRegular>
              </View>
              <InterRegular style={styles.settingName}>Language</InterRegular>
            </View>
            <View style={styles.settingRight}>
              <InterRegular style={styles.settingValue}>English</InterRegular>
              <ChevronRight size={20} color="#CCCCCC" />
            </View>
          </View>

          {[
            'Chat Controls',
            'Notification',
            'Notification',
            'Notification',
          ].map((item, index) => (
            <View key={index} style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <View style={styles.settingIcon}>
                  <InterRegular style={styles.settingIconText}>C</InterRegular>
                </View>
                <InterRegular style={styles.settingName}>{item}</InterRegular>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </View>
          ))}
        </View>

        {/* <TouchableOpacity
          style={styles.createButton}
          onPress={createGroup}
          disabled={creating}>
          {creating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Check size={24} color="#fff" />
          )}
        </TouchableOpacity> */}
      </View>
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      <View style={styles.header}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
        )}
        <InterBold style={styles.headerTitle}>Alse</InterBold>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Bell size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={{marginLeft: 15}}>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/men/1.jpg'}}
              style={styles.profileIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Unified floating action button */}
      <TouchableOpacity
        style={[
          styles.floatingActionButton,
          step === 1 &&
            selectedUsers.length === 0 &&
            styles.floatingActionButtonDisabled,
        ]}
        onPress={() => {
          if (step === 1) {
            if (selectedUsers.length > 0) {
              setStep(3);
            } else {
              // Show alert to select users first
              Alert.alert(
                'Select Members',
                'Please select at least one member for the group',
              );
            }
          } else if (step === 2) {
            setStep(1);
          } else if (step === 3) {
            createGroup();
          }
        }}
        disabled={
          (step === 1 && selectedUsers.length === 0) || (step === 3 && creating)
        }>
        {step === 3 && creating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : step === 2 ? (
          <ChevronRight size={24} color="#fff" />
        ) : (
          <Check size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
  },
  headerTitle: {
    fontSize: 24,
    color: themeColors.themeColor,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
    marginLeft: 20, // Move title to the right to avoid overlap with back button
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    padding: 0,
    marginLeft: 8,
  },
  formContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 15,
  },
  inputContainer: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    padding: 0,
    paddingBottom: 8,
    color: '#333333',
  },
  // Add these styles to the StyleSheet
  // header: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   paddingHorizontal: 16,
  //   height: 50,
  // },
  backButton: {
    position: 'absolute',
    left: 6,
    zIndex: 10,
  },
  // headerTitle: {
  //   fontSize: 24,
  //   color: themeColors.themeColor,
  //   fontWeight: 'bold',
  //   flex: 1,
  //   textAlign: 'center',
  // },
  floatingActionButtonDisabled: {
    backgroundColor: '#CCCCCC',
    elevation: 2,
  },
  membersSection: {
    marginBottom: 20,
  },
  memberTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 10,
  },
  selectedUsersScroll: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  selectedUserCard: {
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  userName: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  addUserButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  descriptionInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    color: '#333333',
  },

  floatingActionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeColors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  selectedUsersHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectedUsersTitle: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 10,
  },
  selectedUsersRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  selectedUserBubble: {
    marginRight: 15,
    alignItems: 'center',
  },
  selectedUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  selectedUserName: {
    fontSize: 12,
    color: '#666666',
  },
  recentTitle: {
    fontSize: 16,
    color: '#000000',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  userItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userListAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userDetails: {
    marginLeft: 15,
    flex: 1,
  },
  userListName: {
    fontSize: 16,
    color: '#000000',
  },
  userLastSeen: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  selectedCheck: {
    marginLeft: 10,
  },
  groupHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  groupHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupImageContainer: {
    marginRight: 15,
  },
  groupHeaderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  groupImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  groupHeaderInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupHeaderName: {
    fontSize: 18,
    color: '#000000',
  },
  editButton: {
    padding: 5,
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  groupDescription: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  settingsList: {
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingIconText: {
    fontSize: 14,
    color: '#666666',
  },
  settingName: {
    fontSize: 16,
    color: '#000000',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
    marginRight: 10,
  },
  createButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeColors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: themeColors.themeColor,
  },
  chatTabIcon: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabProfileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default CreateGroup;
