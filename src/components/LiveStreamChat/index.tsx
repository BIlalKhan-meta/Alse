import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import firestore from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useTranslation} from 'react-i18next';

const ChatComponent = ({
  channelId,
  isLive,
}: {
  channelId: string;
  isLive: boolean;
}) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const flatListRef = useRef(null);
  const messageListener = useRef(null);
  const user = useSelector(selectUserProfile);

  const {t} = useTranslation();

  // Set up Firebase chat listener
  useEffect(() => {
    // Only set up listeners if we have a valid channel and the stream is live
    if (!channelId || !isLive) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Reference to the messages collection
    const chatRef = firestore()
      .collection('liveStreamChats')
      .doc(channelId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(50);

    try {
      // Create a snapshot listener using the standard method
      const unsubscribe = chatRef.onSnapshot(
        snapshot => {
          const messageData: any[] = [];
          snapshot.forEach(doc => {
            messageData.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          // Reverse to get chronological order
          setMessages(messageData.reverse());
          setLoading(false);
        },
        err => {
          console.error('Error in chat listener:', err);
          setError(err.message);
          setLoading(false);
        },
      );

      // Store the unsubscribe function
      // @ts-ignore
      messageListener.current = unsubscribe;
    } catch (err) {
      console.error('Failed to set up chat listener:', err);
      setError('Failed to connect to chat. Please try again.');
      setLoading(false);
    }

    // Clean up listener on unmount
    return () => {
      if (messageListener.current) {
        // @ts-ignore
        messageListener.current();
      }
    };
  }, [channelId, isLive]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        // @ts-ignore
        flatListRef.current?.scrollToEnd({animated: false});
      }, 100);
    }
  }, [messages]);

  // Get message bubble color
  const getMessageColor = userId => {
    // Define consistent colors for better visual identification of users
    const colors = [
      'rgba(255,255,255,0.8)',
      'rgba(255,94,153,0.85)',
      'rgba(119,221,255,0.85)',
      'rgba(255,215,112,0.85)',
      'rgba(190,240,175,0.85)',
    ];

    // Use userId to get a consistent color for each user
    const colorIndex = userId
      ? Math.abs(
          userId
            .toString()
            .split('')
            .reduce((a, b) => {
              return a + b.charCodeAt(0);
            }, 0) % colors.length,
        )
      : 0;

    return colors[colorIndex];
  };

  // Send a message
  const sendMessage = async () => {
    if (!messageText.trim() || !channelId) return;

    try {
      // Create message data
      const messageData = {
        userId: user.id,
        username: user.full_name,
        avatarUrl:
          user.profile_picture_url ||
          `https://randomuser.me/api/portraits/men/${user.id}.jpg`,
        message: messageText.trim(),
        timestamp: firestore.FieldValue.serverTimestamp(),
        backgroundColor: getMessageColor(user.id),
        textColor: '#000',
      };

      // Clear input
      setMessageText('');

      // Add to Firestore
      await firestore()
        .collection('liveStreamChats')
        .doc(channelId)
        .collection('messages')
        .add(messageData);
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Render a single message
  const renderMessage = ({item}) => (
    <View style={styles.chatMessage}>
      <Image source={{uri: item.avatarUrl}} style={styles.chatAvatar} />
      <View style={styles.messageWrapper}>
        <Text style={styles.chatUsername}>{item.username}</Text>
        <View
          style={[
            styles.messageContent,
            {backgroundColor: item.backgroundColor || 'rgba(255,255,255,0.8)'},
          ]}>
          <Text style={[styles.messageText, {color: item.textColor || '#000'}]}>
            {item.message}
          </Text>
        </View>
      </View>
    </View>
  );

  // If not live, don't render anything
  if (!isLive) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      {/* Messages area */}
      <View style={styles.messagesArea}>
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.statusText}>{t('livestreamChat.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.statusText}>
              {t('livestreamChat.noMessages')}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
          />
        )}
      </View>

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder={t('livestreamChat.typeMsg')}
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={messageText}
          onChangeText={setMessageText}
        />
        <View style={styles.inputIcons}>
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!messageText.trim()}>
            <FontAwesome6
              name="paper-plane"
              size={20}
              color={messageText.trim() ? '#38b6ff' : 'rgba(56,182,255,0.5)'}
              iconStyle="solid"
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  messagesArea: {
    maxHeight: '80%',
  },
  centerContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  messagesList: {
    paddingBottom: 5,
  },
  chatMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageWrapper: {
    flexDirection: 'column',
    maxWidth: '75%',
  },
  chatUsername: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  messageContent: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageText: {
    color: '#000',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    marginTop: 10,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  inputField: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  inputIcons: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
});

export default ChatComponent;
