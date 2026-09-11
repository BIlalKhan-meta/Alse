import React, {useCallback} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import InterRegular from '../../components/Text/InterRegular';
import {images} from '../../utils/images';
import {vh, vw} from '../../constant';
import {colors} from '../../utils/theme';
import Row from '../../components/Row';
import {
  acceptIncomingCall,
  rejectIncomingCall,
} from '../../services/incomingCallActions';

type AcknowledgeParams = {
  chat_id?: string | number;
  role?: string;
  image?: string;
  name?: string;
  callType?: 'audio' | 'video' | string;
  call_type?: 'audio' | 'video' | string;
  callId?: string;
  call_id?: string;
  callerId?: string | number;
  caller_id?: string | number;
  isVideo?: boolean;
};

const AcknowledgeCall = ({navigation, route}: any) => {
  const params = (route?.params || {}) as AcknowledgeParams;
  const {
    chat_id,
    image,
    name,
    callType,
    call_type,
    callId,
    call_id,
    callerId,
    caller_id,
    isVideo: isVideoParam,
  } = params;

  const resolvedCallType = String(
    callType || call_type || (isVideoParam === false ? 'audio' : 'video'),
  ).toLowerCase();
  const isVideo = resolvedCallType !== 'audio';

  const incoming = {
    callId: String(callId || call_id || chat_id || ''),
    chatId: chat_id != null ? String(chat_id) : '',
    callerId: String(callerId ?? caller_id ?? ''),
    callerName: String(name || 'Call'),
    callType: (isVideo ? 'video' : 'audio') as 'audio' | 'video',
  };

  const onDecline = useCallback(() => {
    if (incoming.chatId) {
      rejectIncomingCall(incoming).catch(() => {});
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [incoming, navigation]);

  const onAccept = useCallback(() => {
    const chatId = incoming.chatId;
    if (!chatId) {
      onDecline();
      return;
    }
    acceptIncomingCall(incoming).catch(() => {});
    const navParams = {
      chatId,
      callId: incoming.callId || undefined,
      userName: incoming.callerName,
      name: incoming.callerName,
      otherUserId: incoming.callerId || undefined,
      isReceiver: true,
      isVideo,
      image,
    };
    if (isVideo) {
      navigation.replace('VideoCall', navParams);
    } else {
      navigation.replace('AudioCall', navParams);
    }
  }, [
    callId,
    call_id,
    callerId,
    caller_id,
    chat_id,
    image,
    isVideo,
    name,
    navigation,
    onDecline,
  ]);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={styles.userContainer}>
        <Image
          source={image ? {uri: image} : images.user}
          style={styles.userImage}
        />
        <InterRegular style={styles.userName}>{name}</InterRegular>
      </View>

      <Row style={{width: vw * 80, marginTop: vh * 8}} justify="space-around">
        <TouchableOpacity
          onPress={onDecline}
          style={[styles.circle, {backgroundColor: colors.redStatus}]}>
          <Image source={images.cancelCall} style={styles.endCallIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAccept} style={styles.circle}>
          <Image source={images.endCall} style={styles.endCallIcon} />
        </TouchableOpacity>
      </Row>
    </View>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    width: vh * 20,
    height: vh * 20,
    alignItems: 'center',
    marginVertical: vh,
  },
  userImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  circle: {
    width: vh * 6,
    height: vh * 6,
    borderRadius: vh * 6,
    backgroundColor: colors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: colors.black,
  },
  endCallIcon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
    tintColor: colors.white,
  },
});

export default AcknowledgeCall;
