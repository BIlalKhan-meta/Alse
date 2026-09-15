import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import eventEmitter, {EVENT_TYPES} from '../../utils/EventEmitter';
import {colors} from '../../utils/theme';
import {cancelPostUpload} from '../../services/postUploadQueue';

const UploadProgressBanner: React.FC = () => {
  const [message, setMessage] = useState('');
  const [percent, setPercent] = useState<number | undefined>();

  useEffect(() => {
    const onProgress = (payload: {message?: string; percent?: number}) => {
      setMessage(payload?.message || '');
      setPercent(payload?.percent);
    };
    eventEmitter.on(EVENT_TYPES.UPLOAD_PROGRESS, onProgress);
    return () => {
      eventEmitter.off(EVENT_TYPES.UPLOAD_PROGRESS, onProgress);
    };
  }, []);

  if (!message) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text} numberOfLines={1}>
          {message}
          {typeof percent === 'number' ? ` · ${percent}%` : ''}
        </Text>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={cancelPostUpload}
        accessibilityRole="button"
        accessibilityLabel="Cancel post upload">
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: colors.themeColor,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default UploadProgressBanner;
