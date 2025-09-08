# Search Results Components

This directory contains reusable components for displaying search results in the ALSE app.

## Components

### SearchResultItem

A component that displays individual search result items with:

- Type-specific icons (user, auction, product, shop, article, blog, video, chat)
- Title, subtitle, and description
- Optional image display
- Price and status badges
- Touch handling for navigation

### SearchResultsList

A container component that manages a list of search results with:

- Loading states
- Error handling
- Empty state display
- Pagination support
- Pull-to-refresh functionality

## Usage

```tsx
import {SearchResultsList, SearchResult} from '../components/SearchResults';

const MySearchScreen = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleResultPress = (result: SearchResult) => {
    // Navigate to appropriate detail screen
    navigation.navigate(result.type + 'Detail', {id: result.id});
  };

  return (
    <SearchResultsList
      results={results}
      loading={loading}
      error={error}
      onResultPress={handleResultPress}
      onLoadMore={() => loadMoreResults()}
      hasMore={hasMoreResults}
    />
  );
};
```

## Search Result Types

The search results support the following types:

- `user` - User profiles
- `auction` - Auction listings
- `product` - Product listings
- `shop` - Shop profiles
- `article` - Educational articles
- `blog` - Blog posts
- `video` - Educational videos
- `chat` - Chat conversations

Each result type has appropriate icons and styling to help users quickly identify the content type.
