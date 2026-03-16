import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  Modal,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {GiftedChat, IMessage, InputToolbar} from 'react-native-gifted-chat';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {
  renderBubble,
  renderMessageImage,
  renderMessageText,
  renderMessageVideo,
} from './MessageContainer';
import styles from './styles';

import {EllipsisVertical, Phone, Video} from 'lucide-react-native';
import {useSelector} from 'react-redux';
import {
  createMessage,
  getChat,
  uploadImages,
  uploadVideo,
} from '../../api/home';
import {selectUserProfile} from '../../store/slices/authSlice';
import {
  connectSocket,
  disconnectSocket,
  emitMessage,
  listenMessage,
} from '../../utils/socket';
import {renderComposer, renderSend} from './InputToolbar';
// @ts-ignore
import call from 'react-native-phone-call';
import callManagerService from '../../services/callManagerService';
import ReportBlockModal from '../../components/ReportBlockModal';
import {DEVICE_HEIGHT} from '../../constant';
import useImagePicker from '../../hooks/useImagePicker-story';
import {
  createFile,
  createVideoFile,
  getAbsoluteAvatarUrl,
} from '../../utils/helpers';

interface Props {
  route?: {
    params?: {
      id?: string;
      name?: string;
      user?: any;
      phoneNumber?: string;
    };
  };
}

const ChatOngoing: React.FC<Props> = props => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const user = useSelector(selectUserProfile);
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [optionVisibal, setOptionVisible] = useState(false);

  const toggleOption = () => setOptionVisible(!optionVisibal);

  // console.log("USER++++++++++++++++++",user?.full_name)

  // Request phone call permission for Android
  const requestPhonePermission = async () => {
    console.log('=== Permission Check Started ===');
    console.log('Platform:', Platform.OS);

    if (Platform.OS === 'android') {
      try {
        // Check if permission is already granted
        console.log('Checking existing permission...');
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        );

        console.log('Permission check result:', hasPermission);
        console.log(
          'Permission constant:',
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        );

        if (hasPermission) {
          console.log('✅ Phone permission already granted');
          return true;
        }

        console.log('❌ Permission not granted, requesting...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          {
            title: 'Phone Call Permission',
            message:
              'This app needs access to make phone calls to contact users',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        console.log('Permission request result:', granted);
        console.log('GRANTED constant:', PermissionsAndroid.RESULTS.GRANTED);
        console.log('DENIED constant:', PermissionsAndroid.RESULTS.DENIED);
        console.log(
          'NEVER_ASK_AGAIN constant:',
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('Final permission status:', isGranted);

        return isGranted;
      } catch (err) {
        console.error('❌ Permission error:', err);
        return false;
      }
    }

    console.log('✅ iOS - no permission needed');
    return true; // iOS doesn't need this permission
  };

  // Make video call
  const makeVideoCall = async (callType: 'video' | 'audio' = 'video') => {
    if (!props?.route?.params?.id) {
      Alert.alert(
        'Error',
        'Unable to make call. User information not available.',
      );
      return;
    }

    try {
      setIsVideoCalling(true);

      // Use call manager service to initiate call
      const result = await callManagerService.initiateCall(
        props.route.params.id.toString(),
        props.route.params.name || 'Unknown User',
        callType,
        props.route.params.user?.avatar,
      );

      if (result.success && result.data) {
        // Navigate to video call screen with proper Agora data
        (navigation as any).navigate('VideoCall', {
          channel: result.data.channel,
          uid: user?.id,
          receiverName: result.data.receiverName,
          receiverAvatar: result.data.receiverAvatar,
          callType: result.data.callType,
          agoraToken: result.data.agoraToken,
          sessionId: result.data.sessionId,
        });
      } else {
        Alert.alert(
          'Call Failed',
          result.error || 'Unable to initiate call. Please try again.',
        );
      }
    } catch (error) {
      console.error('Video call error:', error);
      Alert.alert(
        'Call Failed',
        (error as any)?.message || 'Unable to initiate call. Please try again.',
      );
    } finally {
      setIsVideoCalling(false);
    }
  };

  // Show call options
  const showCallOptions = () => {
    Alert.alert('Call Options', 'Choose how you want to call', [
      {
        text: 'Video Call',
        onPress: () => makeVideoCall('video'),
      },
      {
        text: 'Voice Call',
        onPress: () => makeVideoCall('audio'),
      },
      {
        text: 'Phone Call',
        onPress: makePhoneCall,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  // Make phone call
  const makePhoneCall = async () => {
    console.log('=== makePhoneCall called ===');
    console.log('Route params:', props?.route?.params);
    const phoneNumberFromParams = props?.route?.params?.phoneNumber;
    console.log('Phone number from params:', phoneNumberFromParams);

    // If no phone number is provided, show modal to enter it manually
    if (!phoneNumberFromParams) {
      console.log('No phone number found, showing modal');
      setPhoneModalVisible(true);
      return;
    }

    console.log('Phone number found, initiating call');

    // Show options for calling
    Alert.alert('Make Phone Call', `Call ${phoneNumberFromParams}?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Call with Permission Check',
        onPress: () => initiateCall(phoneNumberFromParams),
      },
      {
        text: 'Call Directly',
        onPress: () => attemptCall(phoneNumberFromParams),
      },
    ]);
  };

  // Handle phone number input from modal
  const handlePhoneNumberSubmit = async () => {
    if (phoneNumber.trim()) {
      setPhoneModalVisible(false);
      await initiateCall(phoneNumber.trim());
      setPhoneNumber(''); // Clear input
    } else {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
    }
  };

  // Helper function to initiate the actual call
  const initiateCall = async (phoneNumberToCall: string) => {
    console.log('=== Initiating call to:', phoneNumberToCall, '===');
    setIsCalling(true);

    try {
      // Request permission first
      const hasPermission = await requestPhonePermission();
      console.log('Permission check result:', hasPermission);

      if (!hasPermission) {
        // Try to make the call anyway - sometimes permission check is wrong
        console.log('⚠️ Permission check failed, but trying to call anyway...');

        // Show a warning but still attempt the call
        Alert.alert(
          'Permission Warning',
          'Permission check failed, but attempting to make the call. If it fails, please check your app permissions in Settings.',
          [
            {
              text: 'Cancel',
              onPress: () => {
                setIsCalling(false);
                return;
              },
            },
            {
              text: 'Try Anyway',
              onPress: async () => {
                await attemptCall(phoneNumberToCall);
              },
            },
          ],
        );
        return;
      }

      console.log('✅ Permission granted, making call...');
      await attemptCall(phoneNumberToCall);
    } catch (error: any) {
      console.error('❌ Error in initiateCall:', error);
      Alert.alert(
        'Call Failed',
        `Unable to make the phone call. Error: ${
          error.message || 'Unknown error'
        }`,
        [{text: 'OK'}],
      );
      setIsCalling(false);
    }
  };

  // Separate function to attempt the actual call
  const attemptCall = async (phoneNumberToCall: string) => {
    try {
      const args = {
        number: phoneNumberToCall,
        prompt: true, // Show confirmation dialog
        skipCanOpen: true, // Skip the canOpenURL check
      };

      console.log('📞 Call args:', args);
      await call(args);
      console.log('✅ Call initiated successfully');
    } catch (error: any) {
      console.error('❌ Call attempt failed:', error);
      throw error; // Re-throw to be handled by parent
    } finally {
      setIsCalling(false);
    }
  };

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  const getData = useCallback(() => {
    if (!props?.route?.params?.id) {
      return;
    }

    getChat(props?.route?.params?.id)
      .then((res: any) => {
        const messagesData = res?.data?.data || [];
        const formattedMessages = messagesData.map((item: any) => {
          const rawImage =
            item?.image ||
            item?.image_url ||
            item?.message_image ||
            item?.message?.image ||
            (typeof item?.media === 'string' ? item.media : null);
          const imageUrl = rawImage
            ? getAbsoluteAvatarUrl(rawImage) || rawImage
            : undefined;
          const rawVideo =
            item?.video ||
            item?.video_url ||
            item?.message_video ||
            (typeof item?.media === 'string' ? item.media : null);
          const videoUrl = rawVideo
            ? getAbsoluteAvatarUrl(rawVideo) || rawVideo
            : undefined;
          return {
            _id: item?.id || Math.random(),
            chat_id: item?.chat_id,
            text: item?.message || '',
            image: imageUrl,
            video: videoUrl,
            createdAt: new Date(item?.created_at || Date.now()),
            user: {
              _id: item?.user_id,
              avatar:
                getAbsoluteAvatarUrl(
                  item?.user_image || item?.avatar || item?.sender_image,
                ) || images.profile,
            },
          };
        });
        setMessages(formattedMessages);
      })
      .catch((Err: any) => {
        console.log('Error from get Conversation:', Err);
      });
  }, [props?.route?.params?.id]);

  useEffect(() => {
    if (isFocused) {
      getData();
    }
  }, [isFocused, getData]);

  useEffect(() => {
    if (!props?.route?.params?.id) return;
    const cleanup = listenMessage(props.route.params.id, (res: any) => {
      // Only add message if it's from another user (not current user)
      if (res?.user?._id !== user?.id) {
        const imageUrl = res?.image
          ? getAbsoluteAvatarUrl(res.image) || res.image
          : undefined;
        const videoUrl = res?.video
          ? getAbsoluteAvatarUrl(res.video) || res.video
          : undefined;
        const newMessage = {
          _id: res?.id || Math.random(),
          chat_id: res?.chat_id,
          text: res?.message || '',
          image: imageUrl,
          video: videoUrl,
          createdAt: new Date(res?.created_at || Date.now()),
          user: {
            _id: res?.user?._id,
            avatar: res?.user?.avatar,
          },
        };
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [newMessage]),
        );
      }
    });
    return cleanup;
  }, [props?.route?.params?.id, user?.id]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      // Immediately update the UI with optimistic update
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, newMessages),
      );

      const message = newMessages?.[0];
      if (!message?.text || !user?.id || !props?.route?.params?.id) {
        return;
      }

      const data = {
        chat_id: props.route.params.id,
        message: message.text,
        created_at: Date.now(),
      };

      // Send to socket for real-time updates to other users
      emitMessage({
        chat_id: props.route.params.id,
        message: message.text,
        created_at: Date.now(),
        user: {
          _id: user.id,
          avatar: user?.avatar ? user.avatar : images.profile,
        },
      });

      // Save to backend (async, doesn't block UI)
      createMessage(data)
        .then((_res: any) => {
          console.log('Message saved successfully');
        })
        .catch((Err: any) => {
          console.log('Error saving message:', Err);
          // TODO: Implement retry logic or show error to user
        });
    },
    [props?.route?.params?.id, user?.id, user?.avatar],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const {chooseFromLibrary} = useImagePicker();
  // console.log('---->>', imageData?.type?.includes('image'));

  const onSendImage = async () => {
    const asset = await chooseFromLibrary();
    if (!asset?.uri || !props?.route?.params?.id || !user?.id) return;

    const tempId = `img-${Date.now()}`;
    const optimisticMessage: IMessage = {
      _id: tempId,
      text: '',
      image: asset.uri,
      createdAt: new Date(),
      user: {
        _id: user.id,
        avatar: user?.avatar || user?.image || images.profile,
      },
    };
    setMessages(prev => GiftedChat.append(prev, [optimisticMessage]));

    const formData = new FormData();
    formData.append('chat_id', props.route.params.id);
    formData.append('image', createFile(asset.uri));

    try {
      const res: any = await uploadImages(formData);
      const imageUrl =
        res?.data?.data?.image ||
        res?.data?.image ||
        res?.data?.data?.message?.image;
      const serverImageUrl = imageUrl
        ? getAbsoluteAvatarUrl(imageUrl) || imageUrl
        : asset.uri;

      emitMessage({
        chat_id: props.route.params.id,
        message: '',
        image: serverImageUrl,
        message_type: 'image',
        created_at: Date.now(),
        user: {
          _id: user.id,
          avatar: user?.avatar || user?.image || images.profile,
        },
      });
      setTimeout(() => getData(), 800);
    } catch (Err) {
      console.log('Error saving image:', Err);
      setMessages(prev => prev.filter(m => m._id !== tempId));
      Alert.alert('Error', 'Failed to send image. Please try again.');
    }
  };

  const onSendVideo = async () => {
    const asset = await chooseFromLibrary('video');
    if (!asset?.uri || !props?.route?.params?.id || !user?.id) return;

    const tempId = `vid-${Date.now()}`;
    const optimisticMessage: IMessage = {
      _id: tempId,
      text: '',
      video: asset.uri,
      createdAt: new Date(),
      user: {
        _id: user.id,
        avatar: user?.avatar || user?.image || images.profile,
      },
    };
    setMessages(prev => GiftedChat.append(prev, [optimisticMessage]));

    const formData = new FormData();
    formData.append('chat_id', props.route.params.id);
    formData.append('video', createVideoFile(asset.uri));

    try {
      const res: any = await uploadVideo(formData);
      const videoUrl =
        res?.data?.data?.video ||
        res?.data?.video ||
        res?.data?.data?.message?.video;
      const serverVideoUrl = videoUrl
        ? getAbsoluteAvatarUrl(videoUrl) || videoUrl
        : asset.uri;

      emitMessage({
        chat_id: props.route.params.id,
        message: '',
        video: serverVideoUrl,
        message_type: 'video',
        created_at: Date.now(),
        user: {
          _id: user.id,
          avatar: user?.avatar || user?.image || images.profile,
        },
      });
      setTimeout(() => getData(), 800);
    } catch (Err) {
      console.log('Error saving video:', Err);
      setMessages(prev => prev.filter(m => m._id !== tempId));
      Alert.alert('Error', 'Failed to send video. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Image source={images.backicon} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Image
              source={
                props?.route?.params?.user?.avatar
                  ? {uri: props.route.params.user.avatar}
                  : images.profile
              }
              style={styles.profileImage}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {props?.route?.params?.name || 'Mad'}
              </Text>
              <Text style={styles.userStatus}>● Always active</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={showCallOptions}
            style={[
              styles.iconContainer,
              (isCalling || isVideoCalling) && (styles as any).disabledButton,
            ]}
            disabled={isCalling || isVideoCalling}>
            <Phone
              size={20}
              color={isCalling || isVideoCalling ? '#4CAF50' : '#666'}
              strokeWidth={2}
            />
          </TouchableOpacity>
          {/* Test button for direct calling */}
          {/* <TouchableOpacity
            onPress={() => {
              console.log('🧪 Test call button pressed');
              attemptCall('+1234567890');
            }}
            style={[
              styles.iconContainer,
              {backgroundColor: '#FF9800', marginLeft: 8},
            ]}>
            <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
              TEST
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[
              styles.iconContainer,
              isVideoCalling && (styles as any).disabledButton,
            ]}
            onPress={() => makeVideoCall('video')}
            disabled={isVideoCalling}>
            <Video
              size={20}
              color={isVideoCalling ? '#4CAF50' : '#666'}
              strokeWidth={2}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.iconContainer}>
            <EllipsisVertical size={20} color="#666" strokeWidth={2} />
          </TouchableOpacity> */}
        </View>
      </View>

      <ReportBlockModal
        isVisible={optionVisibal}
        options={[
          {
            text: 'Send Image',
            onPress: () => {
              onSendImage();
              toggleOption();
            },
          },
          {
            text: 'Send Video',
            onPress: () => {
              onSendVideo();
              toggleOption();
            },
          },
        ]}
        onClose={toggleOption}
        style={{
          bottom: keyboardVisible ? DEVICE_HEIGHT / 2.2 : 85,
          left: 20,
        }}
      />

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{
            _id: user?.id,
            avatar: user?.avatar || user?.image || images.profile,
          }}
          renderMessageText={renderMessageText as any}
          renderMessageImage={renderMessageImage as any}
          renderMessageVideo={renderMessageVideo as any}
          messagesContainerStyle={styles.messagesContainer}
          renderBubble={renderBubble as any}
          renderInputToolbar={props => (
            <View style={styles.inputContainer}>
              <View style={styles.inputBox}>
                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={toggleOption}>
                  <Image source={images.upload} style={styles.attachIcon} />
                </TouchableOpacity>
                <InputToolbar
                  {...props}
                  containerStyle={styles.inputToolbarStyle}
                  primaryStyle={styles.primaryStyle}
                  renderComposer={renderComposer as any}
                  renderSend={renderSend as any}
                />
                {/* <TouchableOpacity style={styles.micButton}>
                  <Image source={images.recordingIcon} style={styles.micIcon} />
                </TouchableOpacity> */}
              </View>
            </View>
          )}
          minInputToolbarHeight={60}
          maxInputLength={1000}
          keyboardShouldPersistTaps="never"
          loadEarlier={false}
          inverted={true}
        />
      </View>

      {/* Phone Number Input Modal */}
      <Modal
        visible={phoneModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPhoneModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Phone Number</Text>
            <Text style={styles.modalSubtitle}>
              Enter the phone number for{' '}
              {props?.route?.params?.name || 'this user'}:
            </Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setPhoneModalVisible(false);
                  setPhoneNumber('');
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.callButton]}
                onPress={handlePhoneNumberSubmit}>
                <Text style={styles.callButtonText}>
                  {isCalling ? 'Calling...' : 'Call'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChatOngoing;
