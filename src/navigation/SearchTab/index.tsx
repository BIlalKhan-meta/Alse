import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Clock, Search, X} from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';
import {useTranslation} from 'react-i18next';
import {SearchResultsList, SearchResult} from '../../components/SearchResults';
import searchAPI from '../../api/search';
import {useNavigation} from '@react-navigation/native';
import { vh } from '../../constant';

const SearchTab = () => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches] = useState<Array<{id: string; text: string}>>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const {t} = useTranslation();
  const navigation = useNavigation();

  // Debounced search function - focus only on users
  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search only users
      const usersResponse = await searchAPI.searchUsers({
        search: query,
        page,
        per_page: 15,
      });

      const results: SearchResult[] = [];

      // Process users
      if (usersResponse.data.status && usersResponse.data.data?.data) {
        const users = usersResponse.data.data.data.map((user: any) => ({
          id: user.id,
          type: 'user' as const,
          title: user.full_name,
          subtitle: user.username ? `@${user.username}` : user.email,
          image: user.avatar,
          data: user,
        }));
        results.push(...users);
      }

      if (page === 1) {
        setSearchResults(results);
      } else {
        setSearchResults(prev => [...prev, ...results]);
      }

      setHasSearched(true);
      setCurrentPage(page);

      // Check if there are more pages based on the API response
      const totalPages = usersResponse.data.data?.meta?.last_page || 1;
      setHasMore(page < totalPages);
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim()) {
        performSearch(searchText.trim());
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, performSearch]);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    setError(null);
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchText(searchTerm);
  };

  const handleResultPress = (result: SearchResult) => {
    // Navigate to user profile since we're only searching users
    if (result.type === 'user') {
      (navigation as any).navigate('Profile', {
        id: result?.id,
      });
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && searchText.trim()) {
      performSearch(searchText.trim(), currentPage + 1);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const renderRecentSearchItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item.text)}>
      <Clock size={18} color="#888" style={styles.recentSearchIcon} />
      <Text style={styles.recentSearchText}>{item.text}</Text>
    </TouchableOpacity>
  );

  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Searching...</Text>
      <Text style={styles.loadingSubtext}>Finding users</Text>
    </View>
  );

  const renderEmptyRecentSearches = () => (
    <View style={styles.emptyRecentContainer}>
      <Search size={48} color="#E0E0E0" />
      <Text style={styles.emptyRecentText}>Start searching</Text>
      <Text style={styles.emptyRecentSubtext}>Search for users</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
      <GlobalHeader />
      </View>

      <View style={styles.searchInputContainer}>
        <Search style={styles.searchIcon} />

        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          value={searchText}
          onChangeText={handleSearchTextChange}
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper text */}
      <Text style={styles.helperText}>Please search for any users</Text>

      {/* Separator line */}
      <View style={styles.separator} />

      {loading && !hasSearched ? (
        renderLoadingScreen()
      ) : hasSearched ? (
        <SearchResultsList
          results={searchResults}
          loading={loading}
          error={error || undefined}
          onResultPress={handleResultPress}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      ) : (
        <View style={styles.recentSearchesContainer}>
          {recentSearches.length > 0 ? (
            <>
              <Text style={styles.recentSearchesTitle}>
                {t('searchScr.recent')}
              </Text>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearchItem}
                keyExtractor={item => item.id}
                style={styles.recentSearchesList}
              />
            </>
          ) : (
            renderEmptyRecentSearches()
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 10,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8E8E8E',
    backgroundColor: 'transparent',
  },
  searchIcon: {
    marginRight: 6,
    color: '#8E8E8E',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 16,
  },
  headerContainer: {
    marginTop: vh * 3,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  recentSearchesContainer: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: 'heavy',
    color: '#333',
    marginBottom: 10,
  },
  recentSearchesList: {
    marginTop: 5,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recentSearchIcon: {
    marginRight: 10,
  },
  recentSearchText: {
    fontSize: 15,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyRecentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyRecentText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRecentSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchTab;
