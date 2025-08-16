import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {
  InputToolbar,
  Composer,
  Send,
  InputToolbarProps,
  ComposerProps,
  SendProps,
} from 'react-native-gifted-chat';
import styles from './styles';
import {images} from '../../utils/images';
import {vw} from '../../constant';

export const renderInputToolbar: React.FC<InputToolbarProps> = props => (
  <View style={styles.inputContainer}>
    <View style={styles.inputBox}>
      <TouchableOpacity style={styles.attachButton}>
        <Image source={images.upload} style={styles.attachIcon} />
      </TouchableOpacity>
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbarStyle}
        primaryStyle={styles.primaryStyle}
        renderComposer={renderComposer}
        renderSend={renderSend}
      />
      <TouchableOpacity style={styles.micButton}>
        <Image source={images.recordingIcon} style={styles.micIcon} />
      </TouchableOpacity>
    </View>
  </View>
);

export const renderComposer: React.FC<ComposerProps> = props => (
  <Composer
    {...props}
    textInputStyle={styles.textInputStyle}
    placeholder="Type a message..."
    placeholderTextColor="#999"
    multiline={true}
  />
);

export const renderSend: React.FC<SendProps> = props => (
  <Send
    {...props}
    alwaysShowSend
    disabled={!props.text || (props.text && props.text.trim().length === 0)}
    containerStyle={styles.sendContainerStyle}>
    <Image style={styles.sendIcon} source={images.send} />
  </Send>
);
