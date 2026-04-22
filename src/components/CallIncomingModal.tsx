import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  callerName: string;
  callType: 'video' | 'audio';
  onAccept: () => void;
  onReject: () => void;
};

const CallIncomingModal: React.FC<Props> = ({
  visible,
  callerName,
  callType,
  onAccept,
  onReject,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            Incoming {callType === 'audio' ? 'voice' : 'video'} call
          </Text>
          <Text style={styles.sub}>{callerName}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.reject}
              onPress={onReject}
              activeOpacity={0.85}>
              <Text style={styles.rejectText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.accept}
              onPress={onAccept}
              activeOpacity={0.85}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  title: {fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8},
  sub: {fontSize: 16, color: '#333', marginBottom: 24},
  row: {flexDirection: 'row', justifyContent: 'space-between', gap: 12},
  reject: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  rejectText: {fontWeight: '600', color: '#333'},
  accept: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2471ED',
    alignItems: 'center',
  },
  acceptText: {fontWeight: '600', color: '#fff'},
});

export default CallIncomingModal;
