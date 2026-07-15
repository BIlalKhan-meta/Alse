import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {images} from '../../utils/images';
import {ProductSharePayload} from '../../utils/productSharePayload';
import {resolveProductMediaUrl} from '../../utils/shopProductCard';
import {colors} from '../../utils/theme';

interface ChatProductCardProps {
  payload: ProductSharePayload;
  onViewProduct: () => void;
}

const ChatProductCard: React.FC<ChatProductCardProps> = ({
  payload,
  onViewProduct,
}) => {
  const imageUrl = resolveProductMediaUrl(payload.image);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onViewProduct}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`View product ${payload.title}`}>
      <Image
        source={imageUrl ? {uri: imageUrl} : images.shop11}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.label}>Product</Text>
        <Text style={styles.title} numberOfLines={2}>
          {payload.title}
        </Text>
        {payload.vendor ? (
          <Text style={styles.vendor} numberOfLines={1}>
            {payload.vendor}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.price} numberOfLines={1}>
            {payload.price}
          </Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>View Product</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    margin: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: 130,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 10,
  },
  label: {
    color: '#00BCD4',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  vendor: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    flex: 1,
    color: colors.black,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  button: {
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ChatProductCard;
