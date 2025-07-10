import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import {
  GiftedChat,
  Bubble,
  Day,
  InputToolbar,
  Send,
  Avatar,
  Actions,
  Composer,
} from 'react-native-gifted-chat';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {vh, vw} from '../../constant';
import InterRegular from '../../components/Text/InterRegular';
import InterBold from '../../components/Text/InterBold';
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Mic,
  Paperclip,
  SendIcon,
} from 'lucide-react-native';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';

const GroupDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // Mock user data
  const user = {
    _id: 1,
    name: 'You',
  };

  const otherUser = {
    _id: 2,
    name: 'MaddieMcIrwinon',
    avatar: 'https://via.placeholder.com/40',
  };

  useEffect(() => {
    // Load initial messages
    setMessages([
      {
        _id: 5,
        text: 'Missed Voice Call\nNo Answer',
        createdAt: new Date(),
        system: true,
        user: otherUser,
      },
      {
        _id: 4,
        text: 'Just wait a second!',
        createdAt: new Date(Date.now() - 1000 * 60),
        user: user,
      },
      {
        _id: 3,
        text: "I am leaving for school, It's been half an hour now",
        createdAt: new Date(Date.now() - 1000 * 60 * 2),
        user: otherUser,
      },
      {
        _id: 2,
        text: "I am leaving for school, It's been half an hour now",
        createdAt: new Date(Date.now() - 1000 * 60 * 3),
        user: otherUser,
      },
      {
        _id: 1,
        text: "I am leaving for school, It's been half an hour now",
        createdAt: new Date(Date.now() - 1000 * 60 * 4),
        user: otherUser,
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );
    setInputText('');
  }, []);

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#F1F1F1',
            borderRadius: 18,
            marginBottom: 5,
            padding: 1,
          },
          right: {
            backgroundColor: colors.themeColor,
            borderRadius: 18,
            marginBottom: 5,
            padding: 1,
          },
        }}
        textStyle={{
          left: {
            color: '#000000',
            fontSize: 14,
            lineHeight: 20,
          },
          right: {
            color: '#FFFFFF',
            fontSize: 14,
            lineHeight: 20,
          },
        }}
      />
    );
  };

  const renderAvatar = props => {
    return (
      <Avatar
        {...props}
        containerStyle={{
          left: {
            marginRight: 0,
          },
        }}
        imageStyle={{
          left: {
            width: 35,
            height: 35,
            borderRadius: 17.5,
          },
        }}
      />
    );
  };

  const renderSystemMessage = props => {
    return (
      <View style={styles.systemMessageContainer}>
        <InterRegular style={styles.systemMessageText}>
          {props.currentMessage.text}
        </InterRegular>
      </View>
    );
  };

  const renderDay = props => {
    return (
      <Day
        {...props}
        textStyle={styles.dayText}
        wrapperStyle={styles.dayWrapper}
      />
    );
  };

  const renderComposer = props => {
    return (
      <Composer
        {...props}
        textInputStyle={styles.textInput}
        multiline={true}
        textInputProps={{
          placeholderTextColor: '#999',
          placeholder: 'Type a message...',
        }}
      />
    );
  };

  const renderActions = props => {
    return (
      <Actions
        {...props}
        containerStyle={styles.attachButton}
        icon={() => <Paperclip size={20} color="#666" />}
      />
    );
  };

  const renderSend = props => {
    return (
      <Send
        {...props}
        containerStyle={styles.sendContainer}
        disabled={!props.text.trim()}>
        <View
          style={[
            styles.sendButton,
            !props.text.trim() && styles.sendButtonDisabled,
          ]}>
          <SendIcon size={20} color="white" />
        </View>
      </Send>
    );
  };

  const renderInputToolbar = props => {
    return (
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={20} color="#666" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity style={styles.micButton}>
          <Mic size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <ArrowLeft size={22} color="#000" />
          </TouchableOpacity>

          <Image source={images.avatar} style={styles.groupAvatar} />

          <View style={styles.groupInfo}>
            <InterBold style={styles.groupName}>Fashion Co...</InterBold>
            <InterRegular style={styles.groupMeta}>
              Alise, Ali, Barron, Fi...
            </InterRegular>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Phone size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton}>
            <Video size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={user}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar}
        renderSystemMessage={renderSystemMessage}
        renderDay={renderDay}
        renderInputToolbar={props => (
          <InputToolbar
            {...props}
            containerStyle={styles.inputContainer}
            primaryStyle={styles.inputPrimaryContainer}
          />
        )}
        renderComposer={renderComposer}
        renderActions={renderActions}
        renderSend={renderSend}
        minInputToolbarHeight={60}
        maxComposerHeight={100}
        timeTextStyle={{
          right: {color: '#eee', fontSize: 11},
          left: {color: '#777', fontSize: 11},
        }}
        listViewProps={{
          style: {backgroundColor: '#fff'},
          contentContainerStyle: {paddingBottom: 10},
        }}
        messagesContainerStyle={{backgroundColor: '#fff'}}
        renderChatFooter={() => <View style={styles.chatFooter} />}
        alwaysShowSend
        scrollToBottom
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  groupInfo: {
    marginLeft: 10,
  },
  groupName: {
    fontSize: 16,
    color: '#000000',
  },
  groupMeta: {
    fontSize: 12,
    color: '#666666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 20,
  },
  dayWrapper: {
    marginTop: 10,
    marginBottom: 10,
  },
  dayText: {
    color: '#FFFF',
    fontSize: 12,
  },
  systemMessageContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    fontSize: 14,
    maxHeight: 100,
    color: colors.themeColor,
  },
  attachButton: {
    padding: 10,
  },
  micButton: {
    padding: 10,
    marginLeft: 5,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: colors.themeColor,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  sendText: {
    color: 'white',
    fontSize: 14,
  },
  chatFooter: {
    height: 5,
  },
});

export default GroupDetailsScreen;
