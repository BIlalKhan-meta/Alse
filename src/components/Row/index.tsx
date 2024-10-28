import React, {FC, memo, ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import { vh } from '../../constant';

interface IRow {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  justify?: string;
  align?: string;
}

const Row: FC<IRow> = ({
  style,
  children,
  justify = 'flex-start',
  align = 'center',
}) => {
  return (
    <View
      style={[
        styles.main_style,
        style,
        {justifyContent: justify, alignItems: align},
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  main_style: {
    flexDirection: 'row',
    marginVertical: vh,
  },
});

export default memo(Row);
