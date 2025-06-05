import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const VideosTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Videos</Text>
      <Text style={styles.comingSoonText}>Coming Soon!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  comingSoonText: {
    fontSize: 18,
    color: '#0C959B', // Using the same blue color as in your styles
    fontStyle: 'italic',
  },
});

export default VideosTab;
