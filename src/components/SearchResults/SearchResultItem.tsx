import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {
  User,
  ShoppingBag,
  Gavel,
  BookOpen,
  Video,
  MessageCircle,
} from 'lucide-react-native';

export type SearchResultType =
  | 'user'
  | 'auction'
  | 'product'
  | 'shop'
  | 'article'
  | 'blog'
  | 'video'
  | 'chat';

export interface SearchResultItemProps {
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  price?: number;
  status?: string;
  onPress: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  type,
  title,
  subtitle,
  description,
  image,
  price,
  status,
  onPress,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'user':
        return <User size={20} color="#666" />;
      case 'auction':
        return <Gavel size={20} color="#666" />;
      case 'product':
        return <ShoppingBag size={20} color="#666" />;
      case 'shop':
        return <ShoppingBag size={20} color="#666" />;
      case 'article':
        return <BookOpen size={20} color="#666" />;
      case 'blog':
        return <BookOpen size={20} color="#666" />;
      case 'video':
        return <Video size={20} color="#666" />;
      case 'chat':
        return <MessageCircle size={20} color="#666" />;
      default:
        return <User size={20} color="#666" />;
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {image ? (
            <Image source={{uri: image}} style={styles.image} />
          ) : (
            <View style={styles.defaultImageContainer}>
              {getIcon()}
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}

          {(price || status) && (
            <View style={styles.footer}>
              {price && <Text style={styles.price}>{formatPrice(price)}</Text>}
              {status && (
                <View style={[styles.statusBadge, getStatusStyle(status)]}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return {backgroundColor: '#4CAF50'};
    case 'ended':
      return {backgroundColor: '#F44336'};
    case 'paused':
      return {backgroundColor: '#FF9800'};
    default:
      return {backgroundColor: '#9E9E9E'};
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});

export default SearchResultItem;
