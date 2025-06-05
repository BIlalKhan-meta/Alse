import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {Clock, Search} from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';

const SearchTab = () => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    {id: '1', text: 'Alse'},
    {id: '2', text: 'Penoza'},
    {id: '3', text: 'Penoza'},
  ]);

  const renderRecentSearchItem = ({item}) => (
    <TouchableOpacity style={styles.recentSearchItem}>
      <Clock size={18} color="#888" style={styles.recentSearchIcon} />
      <Text style={styles.recentSearchText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GlobalHeader />

      <View style={styles.searchInputContainer}>
        <Search style={styles.searchIcon} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#888"
        />
      </View>

      {/* Separator line */}
      <View style={styles.separator} />

      <View style={styles.recentSearchesContainer}>
        <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
        <FlatList
          data={recentSearches}
          renderItem={renderRecentSearchItem}
          keyExtractor={item => item.id}
          style={styles.recentSearchesList}
        />
      </View>
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
});

export default SearchTab;
