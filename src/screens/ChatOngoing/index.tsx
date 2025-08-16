import React, {useState, useEffect, useLayoutEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {renderBubble, renderMessageText} from './MessageContainer';
import styles from './styles';

import {renderInputToolbar} from './InputToolbar';
import {getChat, createMessage} from '../../api/home';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {
  connectSocket,
  disconnectSocket,
  emitMessage,
  listenMessage,
} from '../../utils/socket';
import {EllipsisVertical, Phone, Video} from 'lucide-react-native';

interface Props {
  route?: {
    params?: {
      id?: string;
      name?: string;
      user?: any;
    };
  };
}

const ChatOngoing: React.FC<Props> = props => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const user = useSelector(selectUserProfile);

  // console.log("USER++++++++++++++++++",user?.full_name)

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
        const formattedMessages = messagesData.map((item: any) => ({
          _id: item?.id || Math.random(),
          chat_id: item?.chat_id,
          text: item?.message || '',
          createdAt: new Date(item?.created_at || Date.now()),
          user: {
            _id: item?.user_id,
            avatar: item?.image || images.profile,
          },
        }));
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
    if (props?.route?.params?.id) {
      listenMessage(props?.route?.params?.id, (res: any) => {
        console.log('Response from socket ==>', res);

        // Only add message if it's from another user (not current user)
        if (res?.user?._id !== user?.id) {
          const newMessage = {
            _id: Math.random(),
            chat_id: res?.chat_id,
            text: res?.message,
            createdAt: new Date(),
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
    }
  }, [props?.route?.params?.id, user?.id]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      // Immediately update the UI with optimistic update
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, newMessages),
      );

      const message = newMessages?.[0];
      if (!message?.text) {
        return;
      }

      const data = {
        chat_id: props?.route?.params?.id,
        message: message.text,
        created_at: Date.now(),
      };

      // Send to socket for real-time updates to other users
      emitMessage({
        chat_id: props?.route?.params?.id,
        message: message.text,
        created_at: Date.now(),
        user: {
          _id: user?.id,
          avatar: user?.avatar ? user?.avatar : images.profile,
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
            <Image source={images.profile} style={styles.profileImage} />
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
            onPress={() =>
              (navigation as any).navigate('OutgoingCall', {
                chat_id: props?.route?.params?.id,
                user: props?.route?.params?.user,
                role: '1',
              })
            }
            style={styles.iconContainer}>
            <Phone size={20} color="#666" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer}>
            <Video size={20} color="#666" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer}>
            <EllipsisVertical size={20} color="#666" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{_id: user?.id, avatar: user?.image}}
          renderMessageText={renderMessageText}
          messagesContainerStyle={styles.messagesContainer}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          minInputToolbarHeight={60}
          maxInputLength={1000}
          keyboardShouldPersistTaps="never"
          loadEarlier={false}
          inverted={true}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChatOngoing;
