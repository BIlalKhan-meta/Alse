/**
 * Livestream screen - migrating from Agora to Zego Cloud.
 * TODO: Implement Zego livestream using zego-express-engine-reactnative.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors} from '../../../utils/theme';
import {vh, vw} from '../../../constant';

const LiveStreamScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    isHost = false,
    channel = '',
    streamerName = '',
    streamerAvatar = '',
  } = (route.params || {}) as {
    isHost?: boolean;
    channel?: string;
    streamerName?: string;
    streamerAvatar?: string;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Livestream</Text>
        <Text style={styles.message}>
          Livestream is now powered by Zego Cloud. This feature is being
          migrated.
        </Text>
        <Text style={styles.subtext}>
          {isHost ? 'Host' : 'Viewer'} mode
          {channel ? ` • ${channel}` : ''}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vw * 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: vh * 2,
  },
  message: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: vh * 2,
    opacity: 0.9,
  },
  subtext: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
    marginBottom: vh * 4,
  },
  backButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: vh * 1.5,
    paddingHorizontal: vw * 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LiveStreamScreen;
