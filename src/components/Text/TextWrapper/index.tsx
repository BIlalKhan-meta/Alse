import React from "react";
import { Text, TextProps } from "react-native";

interface TextWrapperProps extends TextProps {
    children: React.ReactNode;
}

const TextWrapper: React.FC<TextWrapperProps> = (props) => {
    return (
        <Text 
        {...props}
        allowFontScaling={false} >
            {props.children}
        </Text>
    );
};

export default TextWrapper;