import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import { GiftedChat, IMessage, Send, InputToolbar, Composer } from 'react-native-gifted-chat';
import { useNavigation } from '@react-navigation/native';
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';
import { renderBubble, renderMessageText } from './MessageContainer';
import styles from './styles';
import messagesData from './messages';
import { renderComposer, renderInputToolbar, renderSend } from './InputToolbar';
import CustomInputToolbar from './CustomInputToolbar';
import GeneralModal from '../../components/GeneralModal';
import ReportBlockModal from '../../components/ReportBlockModal';
import Card from '../../components/Card';

const ChatOngoing: React.FC = () => {
    const navigation = useNavigation();

    const [messages, setMessages] = useState<IMessage[]>([]);


    useEffect(() => {
        setMessages(messagesData)
    }, []);

    const onSend = (newMessages: IMessage[] = []) => {
        setMessages(GiftedChat.append(messages, newMessages));
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },
            headerRight: () => (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        // setModalVisible(true)
                    }}>
                        <Image
                            source={images.callIcon}
                            style={styles.threeDots}

                        />
                    </TouchableOpacity>



                    <TouchableOpacity onPress={() => {
                        // setModalVisible(true)
                    }}>
                        <Image
                            source={images.videoIcon}
                            style={styles.threeDots}

                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        // setModalVisible(true)
                    }}
                        style={styles.savedConatiner}
                    >
                        <Image
                            source={images.save}
                            style={styles.saveicon}

                        />
                    </TouchableOpacity>
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
                        user={{ _id: 1 }}
                        renderSend={renderSend}
                        renderInputToolbar={(props) => <CustomInputToolbar {...props} />}

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
