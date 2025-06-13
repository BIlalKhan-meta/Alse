import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {View, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {Wifi} from 'lucide-react-native';

const {width} = Dimensions.get('window');

export default function NetworkLoggerFAB() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('NetworkLogger')}>
        <Wifi color="black" size={30} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: width / 4,
    right: width / 12,
  },
  btn: {
    backgroundColor: '#ffee8c',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    padding: 12,
  },
});
