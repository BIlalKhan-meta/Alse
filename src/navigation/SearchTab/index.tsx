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

  // Debounced search function
  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Perform multiple searches in parallel
      const [
        usersResponse,
        auctionsResponse,
        productsResponse,
        shopsResponse,
        articlesResponse,
        blogsResponse,
        videosResponse,
      ] = await Promise.allSettled([
        searchAPI.searchUsers({search: query, page, per_page: 5}),
        searchAPI.searchAuctions({search: query, page, per_page: 5}),
        searchAPI.searchProducts({search: query, page, per_page: 5}),
        searchAPI.searchShops({search: query, page}),
        searchAPI.searchArticles({search: query, page}),
        searchAPI.searchBlogs({search: query, page}),
        searchAPI.searchVideos({search: query, page}),
      ]);

      const results: SearchResult[] = [];

      // Process users
      if (
        usersResponse.status === 'fulfilled' &&
        usersResponse.value.data.success
      ) {
        const users = usersResponse.value.data.data.data.map((user: any) => ({
          id: user.id,
          type: 'user' as const,
          title: user.full_name,
          subtitle: user.email,
          image: user.profile_image,
          data: user,
        }));
        results.push(...users);
      }

      // Process auctions
      if (
        auctionsResponse.status === 'fulfilled' &&
        auctionsResponse.value.data.success
      ) {
        const auctions = auctionsResponse.value.data.data.data.map(
          (auction: any) => ({
            id: auction.id,
            type: 'auction' as const,
            title: auction.title,
            subtitle: auction.seller?.name,
            description: auction.description,
            price: auction.current_price,
            status: auction.status,
            data: auction,
          }),
        );
        results.push(...auctions);
      }

      // Process products
      if (
        productsResponse.status === 'fulfilled' &&
        productsResponse.value.data.success
      ) {
        const products = productsResponse.value.data.data.data.map(
          (product: any) => ({
            id: product.id,
            type: 'product' as const,
            title: product.title,
            subtitle: product.shop?.name,
            description: product.description,
            price: product.price,
            data: product,
          }),
        );
        results.push(...products);
      }

      // Process shops
      if (
        shopsResponse.status === 'fulfilled' &&
        shopsResponse.value.data.success
      ) {
        const shops = shopsResponse.value.data.data.data.map((shop: any) => ({
          id: shop.id,
          type: 'shop' as const,
          title: shop.name,
          description: shop.description,
          image: shop.logo,
          data: shop,
        }));
        results.push(...shops);
      }

      // Process articles
      if (
        articlesResponse.status === 'fulfilled' &&
        articlesResponse.value.data.success
      ) {
        const articles = articlesResponse.value.data.data.data.map(
          (article: any) => ({
            id: article.id,
            type: 'article' as const,
            title: article.title,
            subtitle: article.author?.name,
            description: article.content?.substring(0, 100) + '...',
            data: article,
          }),
        );
        results.push(...articles);
      }

      // Process blogs
      if (
        blogsResponse.status === 'fulfilled' &&
        blogsResponse.value.data.success
      ) {
        const blogs = blogsResponse.value.data.data.data.map((blog: any) => ({
          id: blog.id,
          type: 'blog' as const,
          title: blog.title,
          subtitle: blog.author?.name,
          description: blog.content?.substring(0, 100) + '...',
          data: blog,
        }));
        results.push(...blogs);
      }

      // Process videos
      if (
        videosResponse.status === 'fulfilled' &&
        videosResponse.value.data.success
      ) {
        const videos = videosResponse.value.data.data.data.map(
          (video: any) => ({
            id: video.id,
            type: 'video' as const,
            title: video.title,
            subtitle: video.author?.name,
            description: video.description,
            image: video.thumbnail_url,
            data: video,
          }),
        );
        results.push(...videos);
      }

      if (page === 1) {
        setSearchResults(results);
      } else {
        setSearchResults(prev => [...prev, ...results]);
      }

      setHasSearched(true);
      setCurrentPage(page);
      setHasMore(results.length > 0);
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
    // Navigate based on result type
    switch (result.type) {
      case 'user':
        // Navigate to user profile
        (navigation as any).navigate('UserProfile', {userId: result.id});
        break;
      case 'auction':
        // Navigate to auction detail
        (navigation as any).navigate('AuctionDetail', {auctionId: result.id});
        break;
      case 'product':
        // Navigate to product detail
        (navigation as any).navigate('ProductDetail', {productId: result.id});
        break;
      case 'shop':
        // Navigate to shop detail
        (navigation as any).navigate('ShopDetail', {shopId: result.id});
        break;
      case 'article':
        // Navigate to article detail
        (navigation as any).navigate('ArticleDetail', {articleId: result.id});
        break;
      case 'blog':
        // Navigate to blog detail
        (navigation as any).navigate('BlogDetail', {blogId: result.id});
        break;
      case 'video':
        // Navigate to video detail
        (navigation as any).navigate('VideoDetail', {videoId: result.id});
        break;
      default:
        Alert.alert('Navigation', 'Navigation not implemented for this type');
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
      <Text style={styles.loadingSubtext}>
        Finding users, auctions, products, and more
      </Text>
    </View>
  );

  const renderEmptyRecentSearches = () => (
    <View style={styles.emptyRecentContainer}>
      <Search size={48} color="#E0E0E0" />
      <Text style={styles.emptyRecentText}>Start searching</Text>
      <Text style={styles.emptyRecentSubtext}>
        Search for users, auctions, products, shops, articles, blogs, and videos
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <GlobalHeader />

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
