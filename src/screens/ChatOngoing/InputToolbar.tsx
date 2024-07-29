import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { InputToolbar, Composer, Send, InputToolbarProps, ComposerProps, SendProps } from 'react-native-gifted-chat';
import styles from './styles';
import { images } from '../../utils/images';
import { vw } from '../../constant';

export const renderInputToolbar: React.FC<InputToolbarProps> = (props) => (
    <View style={styles.inputToolbarContainer}>
        <TouchableOpacity style={{ backgroundColor: 'red' }}>
            <Text>media</Text>
        </TouchableOpacity>
        <InputToolbar
            {...props}
            containerStyle={styles.inputContainer}
            primaryStyle={styles.inputBox}
        />
        <TouchableOpacity style={{ backgroundColor: 'red' }}>
            <Text>Like</Text>
        </TouchableOpacity>
    </View>
);

export const renderComposer: React.FC<ComposerProps> = (props) => (

    <Composer {...props} textInputStyle={styles.textInputStyle} />

);

export const renderSend: React.FC<SendProps> = (props) => (

    <View
        style={styles.sendContainerBtn}
    >
        <TouchableOpacity onPress={() => { /* Handle smiley icon press */ }}>
            <Image style={styles.smileyIcon} source={images.smile} />
        </TouchableOpacity>

        <Send
            {...props}
            alwaysShowSend
            disabled={!props.text}
            containerStyle={styles.sendContainerStyle}>
            <Image style={styles.sendIcon} source={images.send} />
        </Send>
    </View>
);
