import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import eventEmitter, {EVENT_TYPES} from '../utils/EventEmitter';
import {colors} from '../utils/theme';

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
    <View style={styles.banner} pointerEvents="none">
      <Text style={styles.text}>
        {message}
        {typeof percent === 'number' ? ` · ${percent}%` : ''}
      </Text>
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
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UploadProgressBanner;
