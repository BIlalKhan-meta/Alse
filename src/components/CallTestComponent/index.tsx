import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import callManagerService from '../../services/callManagerService';

interface CallTestComponentProps {
  onNavigateToCall?: (params: any) => void;
}

const CallTestComponent: React.FC<CallTestComponentProps> = ({
  onNavigateToCall,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Test outgoing call
  const testOutgoingCall = async () => {
    try {
      setIsLoading(true);

      const result = await callManagerService.initiateCall(
        '123', // Test receiver ID
        'Test User',
        'video',
        'https://example.com/avatar.jpg',
      );

      if (result.success && result.data && onNavigateToCall) {
        onNavigateToCall({
          channel: result.data.channel,
          uid: 1,
          receiverName: result.data.receiverName,
          receiverAvatar: result.data.receiverAvatar,
          callType: result.data.callType,
          sessionId: result.data.sessionId,
        });
      } else {
        Alert.alert('Test Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Test call error:', error);
      Alert.alert('Test Failed', 'Error initiating test call');
    } finally {
      setIsLoading(false);
    }
  };

  // Test incoming call
  const testIncomingCall = () => {
    if (onNavigateToCall) {
      onNavigateToCall({
        callerName: 'Test Caller',
        callerAvatar: 'https://example.com/caller.jpg',
        channel: 'test_channel_123',
        uid: 2,
        callType: 'video',
        sessionId: 'test_session_123',
      });
    }
  };

  // Test call manager status
  const testCallStatus = () => {
    const isInCall = callManagerService.isInCall();
    const currentCall = callManagerService.getCurrentCall();

    Alert.alert(
      'Call Status',
      `In Call: ${isInCall}\nCurrent Call: ${JSON.stringify(
        currentCall,
        null,
        2,
      )}`,
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Test Component</Text>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={testOutgoingCall}
        disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Outgoing Call'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testIncomingCall}>
        <Text style={styles.buttonText}>Test Incoming Call</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testCallStatus}>
        <Text style={styles.buttonText}>Check Call Status</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: This component is for testing purposes only. Make sure to provide
        the onNavigateToCall prop to handle navigation.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: vw * 4,
    backgroundColor: colors.white,
    borderRadius: 8,
    margin: vw * 2,
  },
  title: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: vh * 2,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.themeColor,
    paddingVertical: vh * 1.5,
    paddingHorizontal: vw * 4,
    borderRadius: 8,
    marginBottom: vh * 1,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  note: {
    fontSize: fontSizes.small,
    color: colors.gray,
    textAlign: 'center',
    marginTop: vh * 1,
    fontStyle: 'italic',
  },
});

export default CallTestComponent;
