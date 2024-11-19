import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  GiftedChat,
  IMessage,
  Send,
  InputToolbar,
  Composer,
} from 'react-native-gifted-chat';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {renderBubble, renderMessageText} from './MessageContainer';
import styles from './styles';
import messagesData from './messages';
import {renderComposer, renderInputToolbar, renderSend} from './InputToolbar';
import CustomInputToolbar from './CustomInputToolbar';
import GeneralModal from '../../components/GeneralModal';
import ReportBlockModal from '../../components/ReportBlockModal';
import Card from '../../components/Card';
import {getChat, createMessage} from '../../api/home';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import {
  connectSocket,
  disconnectSocket,
  emitMessage,
  listenMessage,
} from '../../utils/socket';

const ChatOngoing: React.FC = props => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loader, setLoader] = useState(false);
  const user = useSelector(selectUserProfile);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  const getData = () => {
    setLoader(true);
    getChat(props?.route?.params?.id)
      .then(res => {
        // console.log('Response from ===============>', res?.data?.data);
        // setMessages(res?.data?.data);
        let m = res?.data?.data?.map(item => ({
          _id: item?.id,
          chat_id: item?.chat_id,
          text: item?.message,
          user: {_id: item?.user_id, avatar: item?.image},
        }));
        setMessages(m);
        setLoader(false);
      })
      .catch(Err => {
        setLoader(false);

        console.log('Error from get Conversation ', Err);
      });
  };

  useEffect(() => {
    if (isFocused) {
      getData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (props?.route?.params?.id) {
      listenMessage(props?.route?.params?.id, res => {
        console.log('Response from socket ==>', res);

        let p = {
          _id: Math.random(),
          chat_id: res?.chat_id,
          text: res?.message,
          user: {
            _id: res?.user?._id,
            avatar: res?.user?.avatar,
          },
        };
        // if(res?.user?._id != user?.id){
        // console.log('Inside listen', res?.user?._id != user?.id);

        setMessages(m => [p, ...m]);
      });
    }
  }, []);

  const onSend = (newMessages: IMessage[] = []) => {
    let message = newMessages?.[0];
    const data = {
      chat_id: props?.route?.params?.id,
      message: message?.text,
      created_at: Date.now(),
    };
    emitMessage({
      chat_id: props?.route?.params?.id,
      message: message?.text,
      created_at: Date.now(),
      user: {
        _id: user?.id,
        avatar: user?.avatar ? user?.avatar : images.profile,
        // url:
      },
    });
    // setMessages(m => [data, ...m]);

    createMessage(data)
      .then(res => {
        // console.log(
        //   'Response from Create message  =========>',
        //   res?.data?.data,
        // );
      })
      .catch(Err => {
        console.log('Errorm from Create Message  =======>', Err);
      });
    // setMessages(GiftedChat.append(messages, newMessages));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      title: props?.route?.params?.name,
      headerRight: () => (
        <View style={styles.header}>
          {/* <TouchableOpacity onPress={() => {
                        // setModalVisible(true)
                    }}>
                        <Image
                            source={images.callIcon}
                            style={styles.threeDots}

                        />
                    </TouchableOpacity> */}

          {/* <TouchableOpacity onPress={() => {
                        // setModalVisible(true)
                    }}>
                        <Image
                            source={images.videoIcon}
                            style={styles.threeDots}

                        />
                    </TouchableOpacity> */}

          {/* <TouchableOpacity onPress={() => {
                        // setModalVisible(true)
                    }}
                        style={styles.savedConatiner}
                    >
                        <Image
                            source={images.save}
                            style={styles.saveicon}

                        />
                    </TouchableOpacity> */}
        </View>
      ),
    });
  }, [navigation]);

  return (
    <TouchableWithoutFeedback
    // onPress={() => setModalVisible(false)}
    >
      <View style={styles.container}>
        <Card style={styles.cardStyle}>
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{_id: user?.id, avatar: user?.image}}
            renderSend={renderSend}
            // renderInputToolbar={props => <CustomInputToolbar {...props} />}
            renderMessageText={renderMessageText}
            // renderComposer={renderComposer}
            // renderTime={renderTime}
            messagesContainerStyle={styles.messagesContainer}
            renderBubble={renderBubble}
            // renderBubble={(props) => (
            //     <View>
            //         <Text>{props.currentMessage.text}</Text>
            //         {renderTime(props)}
            //     </View>
            // )}
          />
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ChatOngoing;
