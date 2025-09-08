import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import SearchResultItem, {SearchResultType} from './SearchResultItem';

export interface SearchResult {
  id: number;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  price?: number;
  status?: string;
  data?: any; // Original data for navigation
}

export interface SearchResultsListProps {
  results: SearchResult[];
  loading: boolean;
  error?: string;
  onResultPress: (result: SearchResult) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({
  results,
  loading,
  error,
  onResultPress,
  onLoadMore,
  hasMore = false,
}) => {
  const renderResultItem = ({item}: {item: SearchResult}) => (
    <SearchResultItem
      type={item.type}
      title={item.title}
      subtitle={item.subtitle}
      description={item.description}
      image={item.image}
      price={item.price}
      status={item.status}
      onPress={() => onResultPress(item)}
    />
  );

  const renderFooter = () => {
    if (!loading && !hasMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#666" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found</Text>
        <Text style={styles.emptySubtext}>Try different search terms</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        renderItem={renderResultItem}
        keyExtractor={item => `${item.type}-${item.id}`}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
});

export default SearchResultsList;
