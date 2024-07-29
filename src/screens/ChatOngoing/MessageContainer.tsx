/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Bubble, MessageText, SystemMessage, BubbleProps, MessageTextProps, SystemMessageProps } from 'react-native-gifted-chat';
import styles from './styles';

export const renderBubble: React.FC<BubbleProps> = (props) => (
    <Bubble
        {...props}
        // renderTime={() => null}
        wrapperStyle={{
            left: styles.rightAlignMessageContainer,
            right: [styles.messagesContainer, styles.leftAlignMessageContainer],
        }}
        tickStyle={{}}
    />
);

export const renderSystemMessage: React.FC<SystemMessageProps> = (props) => (
    <SystemMessage
        {...props}
        containerStyle={{ width: '70%', alignSelf: 'center' }}
        textStyle={styles.erroMsg}
    />
);

export const renderMessageText: React.FC<MessageTextProps> = (props) => (
    <MessageText
        {...props}
        // containerStyle={{
        //   left: { backgroundColor: 'yellow' },
        //   right: { backgroundColor: 'purple' },
        // }}
        textStyle={{
            left: styles.messageTxt,
            right: styles.messageTxtSelf,
        }}
        linkStyle={{
            left: styles.messageTxt,
            right: styles.messageTxtSelf,
        }}
    // customTextStyle={{ fontSize: fontSize.f16 }}
    />
);

// Uncomment and type this if needed
// export const renderCustomView: React.FC<{ user: { name: string } }> = ({ user }) => (
//   <View style={{ minHeight: 20, alignItems: 'center' }}>
//     <Text>
//       Current user:
//       {user.name}
//     </Text>
//     <Text>From CustomView</Text>
//   </View>
// );
