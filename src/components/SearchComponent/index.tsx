// SearchComponent.tsx
import React, {useState} from 'react';
import {View, TextInput, StyleSheet, Image} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
// import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo for icons

interface SearchComponentProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onSearch,
  placeholder = 'Search...',
}) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (text: string) => {
    setQuery(text);
    onSearch(text); // Trigger search function as user types
  };

  return (
    <View style={styles.container}>
      <Image source={images.search} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleInputChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inputText}
        // autoCorrect={false}
        // autoFocus
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputcolor,
    paddingHorizontal: 10,
    borderRadius: 8,
    margin: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingVertical: 0,
  },
});

export default SearchComponent;
