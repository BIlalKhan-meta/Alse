import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {PostSharePayload} from '../../utils/postSharePayload';
import {getAbsoluteAvatarUrl} from '../../utils/helpers';

type Props = {
  payload: PostSharePayload;
  onPress?: () => void;
};

const ChatPostCard: React.FC<Props> = ({payload, onPress}) => {
  const imageUri = payload.image
    ? getAbsoluteAvatarUrl(payload.image) || payload.image
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}>
      {imageUri ? (
        <Image source={{uri: imageUri}} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.body}>
        <Text style={styles.badge}>
          {payload.type === 'video_share' ? 'Shared Video' : 'Shared Post'}
        </Text>
        {payload.author ? (
          <Text style={styles.author} numberOfLines={1}>
            {payload.author}
          </Text>
        ) : null}
        <Text style={styles.title} numberOfLines={3}>
          {payload.title || payload.description || 'Open shared content'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatPostCard;

const styles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 10,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1877F2',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
