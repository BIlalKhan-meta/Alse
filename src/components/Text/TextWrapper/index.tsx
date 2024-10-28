import React from 'react';
import {Text, TextProps} from 'react-native';

interface TextWrapperProps extends TextProps {
  children: React.ReactNode;
  lines?: number;
}

const TextWrapper: React.FC<TextWrapperProps> = props => {
  return (
    <Text numberOfLines={props.lines} {...props} allowFontScaling={false}>
      {props.children}
    </Text>
  );
};

export default TextWrapper;
