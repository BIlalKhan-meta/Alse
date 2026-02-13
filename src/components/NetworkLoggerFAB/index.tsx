import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import {Wifi} from 'lucide-react-native';

const {height} = Dimensions.get('window');

export default function NetworkLoggerFAB() {
  const navigation = useNavigation<any>();

  // Debug log to confirm component is rendered in development
  React.useEffect(() => {
    if (__DEV__) {
      console.log('NetworkLoggerFAB rendered in development mode');
      console.log('Component dimensions:', {height, buttonSize: 70});
    }
  }, []);

  const handlePress = () => {
    console.log('NetworkLoggerFAB pressed, navigating to NetworkLogger');
    // `NetworkLogger` is registered as a top-level screen in `MainNavigation`
    navigation.navigate('NetworkLogger' as never);
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.btn}
        onPress={handlePress}
        activeOpacity={0.8}>
        <Wifi color="white" size={28} />
        {__DEV__ && <Text style={styles.debugText}>NET</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: height * 0.15,
    right: 50,
    zIndex: 9999,
    elevation: 8,
  },
  btn: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    width: 70,
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
