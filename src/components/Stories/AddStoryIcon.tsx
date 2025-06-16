import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Plus} from 'lucide-react-native';

const AddStoryIcon = props => {
  return (
    <View style={styles.container}>
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <Plus color="#FFFFFF" size={20} strokeWidth={2.5} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    width: 70,
    height: 70,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#373737',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddStoryIcon;
