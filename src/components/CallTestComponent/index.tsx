import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import CallButton from '../CallButton';
import useCallManager from '../../hooks/useCallManager';

/**
 * Test component to demonstrate calling functionality
 * This can be used for testing the calling features
 */
const CallTestComponent: React.FC = () => {
  const [isTestMode, setIsTestMode] = useState(false);
  const {
    callState,
    initiateCall,
    endCurrentCall,
    handleIncomingCall,
    answerIncomingCall,
    declineIncomingCall,
  } = useCallManager();

  const testVideoCall = async () => {
    try {
      await initiateCall(
        'video',
        `test_channel_${Date.now()}`,
        12345,
        'Test User',
        'https://via.placeholder.com/150',
      );
      Alert.alert('Success', 'Video call initiated');
    } catch (error) {
      Alert.alert('Error', 'Failed to start video call');
    }
  };

  const testVoiceCall = async () => {
    try {
      await initiateCall(
        'audio',
        `test_channel_${Date.now()}`,
        12345,
        'Test User',
        'https://via.placeholder.com/150',
      );
      Alert.alert('Success', 'Voice call initiated');
    } catch (error) {
      Alert.alert('Error', 'Failed to start voice call');
    }
  };

  const testIncomingCall = () => {
    handleIncomingCall(
      'Incoming Test User',
      'video',
      `incoming_channel_${Date.now()}`,
      67890,
      'https://via.placeholder.com/150',
    );
  };

  const answerTestCall = async () => {
    try {
      await answerIncomingCall();
      Alert.alert('Success', 'Call answered');
    } catch (error) {
      Alert.alert('Error', 'Failed to answer call');
    }
  };

  const declineTestCall = () => {
    declineIncomingCall();
    Alert.alert('Info', 'Call declined');
  };

  if (isTestMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Call Test Component</Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Call Status: {callState.isInCall ? 'In Call' : 'Not in Call'}
          </Text>
          {callState.isInCall && (
            <Text style={styles.statusText}>
              Duration: {Math.floor(callState.callDuration / 60)}:
              {(callState.callDuration % 60).toString().padStart(2, '0')}
            </Text>
          )}
          {callState.incomingCall.isActive && (
            <Text style={styles.statusText}>
              Incoming Call from: {callState.incomingCall.callerName}
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <CallButton
            callType="video"
            onPress={testVideoCall}
            disabled={callState.isInCall}
          />
          <CallButton
            callType="audio"
            onPress={testVoiceCall}
            disabled={callState.isInCall}
          />
          <CallButton
            callType="phone"
            onPress={testIncomingCall}
            disabled={callState.incomingCall.isActive}
          />
        </View>

        {callState.incomingCall.isActive && (
          <View style={styles.incomingCallContainer}>
            <Text style={styles.incomingCallText}>
              Incoming {callState.incomingCall.callType} call from{' '}
              {callState.incomingCall.callerName}
            </Text>
            <View style={styles.incomingCallButtons}>
              <TouchableOpacity
                style={[styles.callActionButton, styles.answerButton]}
                onPress={answerTestCall}>
                <Text style={styles.callActionButtonText}>Answer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.callActionButton, styles.declineButton]}
                onPress={declineTestCall}>
                <Text style={styles.callActionButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {callState.isInCall && (
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={endCurrentCall}>
            <Text style={styles.endCallButtonText}>End Call</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsTestMode(false)}>
          <Text style={styles.toggleButtonText}>Hide Test Mode</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.showTestButton}
      onPress={() => setIsTestMode(true)}>
      <Text style={styles.showTestButtonText}>Show Call Test</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: vw * 4,
    margin: vw * 2,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  title: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: vh * 2,
  },
  statusContainer: {
    marginBottom: vh * 2,
  },
  statusText: {
    fontSize: fontSizes.medium,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: vh * 0.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  incomingCallContainer: {
    backgroundColor: '#F5F5F5',
    padding: vw * 4,
    borderRadius: 8,
    marginBottom: vh * 2,
  },
  incomingCallText: {
    fontSize: fontSizes.medium,
    color: colors.black,
    textAlign: 'center',
    marginBottom: vh * 2,
  },
  incomingCallButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  callActionButton: {
    paddingHorizontal: vw * 6,
    paddingVertical: vh * 1.5,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  answerButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  callActionButtonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  endCallButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: vw * 8,
    paddingVertical: vh * 2,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  endCallButtonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: colors.themeColor,
    paddingHorizontal: vw * 6,
    paddingVertical: vh * 1.5,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  showTestButton: {
    backgroundColor: colors.themeColor,
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1,
    borderRadius: 6,
    alignItems: 'center',
    margin: vw * 2,
  },
  showTestButtonText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '500',
  },
});

export default CallTestComponent;
