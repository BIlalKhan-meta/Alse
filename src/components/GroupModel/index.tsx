import {BlurView} from '@react-native-community/blur';
import {useNavigation} from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import GeneralModal from '../GeneralModal';
import HorizontalSeparator from '../HorizontalSeparator';
import styles from './styles'; // Assuming you have styles in a separate file
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import {vh, vw} from '../../constant';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

interface User {
  id: number;
  avatar: string;
  name: string;
}

interface NewGroupModalProps {
  visible: boolean;
  closeModal: () => void;
  users: User[];
  handleGroupCreationbtn: () => {};
  loader: boolean;
}

const NewGroupModal: React.FC<NewGroupModalProps> = props => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {visible, closeModal, users} = props;
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [groupModel, setGroupModel] = useState(false);
  const [groupSuccess, setGroupSuccess] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const toggleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const {t} = useTranslation();

  const Camera = () => {
    let options = {
      mediaType: 'photo', // 'photo' or 'video'
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
    };
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode == 'camera_unavailable') {
        console.log('Camera not available on device');
      } else if (response.errorCode == 'permission') {
        console.log('Permission not satisfied');
      } else {
        console.log('response ===>', response);

        setImage(response?.assets[0]?.uri);

        // Set the captured image URI
        // Handle further processing if needed (e.g., setting file type)
      }
    });
  };
  const renderUserItem = ({item}: {item: User}) => {
    // console.log('item ====>', item);
    return (
      <>
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => toggleSelectUser(item.id)}>
          <Image
            source={
              item?.image ? {uri: item?.image} : images.placeholderProfile
            }
            style={styles.userAvatar}
          />
          <Text style={styles.userName}>{item?.full_name}</Text>

          <Checkbox
            style={styles.checkbox}
            value={selectedUsers.includes(item?.id)}
            onValueChange={() => toggleSelectUser(item?.id)}
            color={selectedUsers.includes(item.id) ? colors.blue : undefined}
          />
        </TouchableOpacity>
        <HorizontalSeparator />
      </>
    );
  };
  const handleCreate = () => {
    // () => setGroupModel(true)
    if (groupName == '') {
      Toast.show({
        text1: t('error'),
        text2: t('toast.enterGroupName'),
        type: 'error',
        props: {
          style: {
            position: 'absolute',
            zIndex: 999,
          },
        },
      });
      return;
    }
    if (!image) {
      Toast.show({
        text1: t('error'),
        text2: t('toast.selectGroupImage'),
        type: 'error',
        props: {
          style: {
            position: 'absolute',
            zIndex: 999,
            backgroundColor: 'red',
          },
        },
      });
      return;
    }
    if (selectedUsers.length < 1) {
      Toast.show({
        text1: t('error'),
        text2: t('toast.selectGroupMembers'),
        type: 'error',
        props: {
          style: {
            position: 'absolute',
            zIndex: 999,
            backgroundColor: 'red',
          },
        },
      });
      return;
    }
    let imagePath = image.split('/');

    let formData = new FormData();

    // Append the group name
    formData.append('name', groupName);

    // Append the image as a file
    formData.append('image', {
      uri: image,
      name: imagePath[imagePath.length - 1],
      type: 'image/jpeg', // Ensure the MIME type is correct based on the file type
    });

    // Append the users array (users[0], users[1], etc.)
    selectedUsers.forEach((user, index) => {
      formData.append(`users[${index}]`, user);
    });
    props?.handleGroupCreationbtn(formData);
  };
  return (
    <Modal
      visible={visible}
      onRequestClose={closeModal}
      animationType="slide"
      transparent>
      <Toast />
      <BlurView
        style={styles.absolute}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="white"
      />
      {/* <View style={styles.backdrop} /> */}
      <TouchableOpacity style={styles.blurContainer} onPress={closeModal} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>{t('groups.newGroup')}</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            disabled={props?.loader}>
            {props?.loader ? (
              <ActivityIndicator size={'small'} color={colors.white} />
            ) : (
              <Text style={styles.createButtonText}>{t('groups.create')}</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.cameConatner} onPress={Camera}>
            <Image
              source={image ? {uri: image} : images.camera}
              style={[
                image
                  ? styles.cameIcon
                  : {height: vh * 5, width: vw * 5, resizeMode: 'contain'},
              ]}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.groupNameInput}
            placeholder={t('groups.enterGroupName')}
            value={groupName}
            onChangeText={setGroupName}
            placeholderTextColor={colors.black}
          />
        </View>
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
        />

        <GeneralModal
          visible={groupModel}
          closeModal={() => setGroupModel(false)}
          title={t('groups.setPrivacy')}
          buttonText={t('apply').toUpperCase()}
          groupPrivacy={true}
          onPress={() => {
            setGroupModel(false);
            setGroupSuccess(true);
            // navigation.navigate("Profile", { account: account })
          }}
        />

        <GeneralModal
          visible={groupSuccess}
          closeModal={() => setGroupSuccess(false)}
          title={t('groups.groupCreated')}
          message={t('groups.groupCreatedMsg')}
          buttonText={t('ok').toUpperCase()}
          onPress={() => {
            setGroupSuccess(false);
            closeModal();
            // navigation.navigate("ChatScreen")
          }}
        />
      </View>
    </Modal>
  );
};

export default NewGroupModal;
