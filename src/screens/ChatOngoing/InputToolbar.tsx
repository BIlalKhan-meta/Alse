import React from 'react';
import {ActivityIndicator, Image, Text, TouchableOpacity, View} from 'react-native';
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

export const renderInputToolbar: React.FC<InputToolbarProps<any>> = props => (
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

type SendWithLoaderProps = SendProps<any> & {
  isSending?: boolean;
};

export const SendWithLoader: React.FC<SendWithLoaderProps> = props => {
  const isSending = Boolean(props.isSending);
  const isDisabled =
    isSending || !props.text || (props.text && props.text.trim().length === 0);

  return (
    <Send
      {...props}
      alwaysShowSend
      disabled={isDisabled}
      containerStyle={styles.sendContainerStyle}>
      {isSending ? (
        <ActivityIndicator size="small" color="#4CAF50" />
      ) : (
        <Image style={styles.sendIcon} source={images.send} />
      )}
    </Send>
  );
};

export const renderSend: React.FC<SendWithLoaderProps> = props => (
  <SendWithLoader {...props} />
);
