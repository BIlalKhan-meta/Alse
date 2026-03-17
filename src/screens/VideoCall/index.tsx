import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {
  ZegoUIKitPrebuiltCall,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {ZEGO_APP_ID, ZEGO_APP_SIGN} from '../../config/zego';

/**
 * ZEGOCLOUD Video Call screen.
 * Used for direct-join scenarios. For invitation flow, ZEGOCLOUD handles navigation automatically.
 */
const VideoCall = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);
  const params = (route.params || {}) as any;

  const chatId = params.chatId;
  const callID = chatId ? `chat_${chatId}` : `call_${Date.now()}`;
  const userID = user?.id != null ? String(user.id) : 'unknown';
  const userName = user?.full_name || user?.name || `user_${userID}`;

  if (!userID || userID === 'unknown') {
    if (navigation.canGoBack()) navigation.goBack();
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ZegoUIKitPrebuiltCall
          appID={ZEGO_APP_ID}
          appSign={ZEGO_APP_SIGN}
          userID={userID}
          userName={userName}
          callID={callID}
          config={{
            ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
            onCallEnd: () => {
              if (navigation.canGoBack()) navigation.goBack();
            },
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
});

export default VideoCall;
