import React from 'react';
import {ActivityIndicator, StyleProp, ViewStyle} from 'react-native';
import {colors} from '../../utils/theme';
import styles from './styles';

interface LoaderProps {
  loaderStyle?: ViewStyle;
  color?: string;
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'large';
}

const Loader: React.FC<LoaderProps> = ({loaderStyle, color, size, style}) => {
  return (
    <ActivityIndicator
      size={size || 'large'}
      color={color || colors.themeColor}
      style={[styles.loader, loaderStyle, style]}
    />
  );
};

export default Loader;
