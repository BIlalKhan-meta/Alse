import React from 'react';
import {StyleSheet, View} from 'react-native';
import InterRegular from '../Text/InterRegular';
import {colors} from '../../utils/theme';

export const EmptyComponent = ({text}) => {
  return (
    <View style={styles.emptyContainer}>
      <InterRegular style={styles.emptyText}>{text}</InterRegular>
    </View>
  );
};

export const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.headerColor,
  },
  emptyText: {
    color: colors.blue,
  },
});
