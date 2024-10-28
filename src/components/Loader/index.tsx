import React from 'react';
import {ActivityIndicator, ViewStyle} from 'react-native';
import {colors} from '../../utils/theme';
import styles from './styles';

interface LoaderProps {
  loaderStyle?: ViewStyle;
  color?: string;
  size?: 'small' | 'large';
}

const Loader: React.FC<LoaderProps> = ({loaderStyle, color, size}) => {
  return (
    <ActivityIndicator
      size={size || 'large'}
      color={color || colors.themeColor}
      style={[styles.loader, loaderStyle]}
    />
  );
};

export default Loader;
