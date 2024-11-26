import React from 'react';
import {TextInput} from 'react-native';

const TextInputWrapper: React.FC = props => {
  return (
    <TextInput
      secureTextEntry={props?.secureTextEntry}
      {...props}
      allowFontScaling={false}
    />
  );
};

export default TextInputWrapper;
