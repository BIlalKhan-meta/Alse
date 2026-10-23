import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import eventEmitter, {EVENT_TYPES} from '../../utils/EventEmitter';
import {colors} from '../../utils/theme';
import {cancelPostUpload} from '../../services/postUploadQueue';

const clampPercent = (value?: number): number | undefined => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
};

const UploadProgressBanner: React.FC = () => {
  const [message, setMessage] = useState('');
  const [percent, setPercent] = useState<number | undefined>();
  const lastPercentRef = useRef(0);

  useEffect(() => {
    const onProgress = (payload: {message?: string; percent?: number}) => {
      const nextMessage = payload?.message || '';
      if (!nextMessage) {
        setMessage('');
        setPercent(undefined);
        lastPercentRef.current = 0;
        return;
      }

      setMessage(nextMessage);
      const nextPercent = clampPercent(payload?.percent);
      if (typeof nextPercent !== 'number') {
        return;
      }

      // Keep displayed % monotonic so it never flickers backwards mid-upload.
      const stablePercent = Math.max(lastPercentRef.current, nextPercent);
      lastPercentRef.current = stablePercent;
      setPercent(stablePercent);
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
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.text} numberOfLines={1}>
            {message}
            {typeof percent === 'number' ? `  ${percent}%` : ''}
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelPostUpload}
            accessibilityRole="button"
            accessibilityLabel="Cancel post upload">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        {typeof percent === 'number' ? (
          <View style={styles.track}>
            <View style={[styles.fill, {width: `${percent}%`}]} />
          </View>
        ) : null}
      </View>
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
  content: {
    gap: 8,
  },
  row: {
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
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});

export default UploadProgressBanner;
