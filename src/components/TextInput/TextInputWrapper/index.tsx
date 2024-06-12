import React from "react";
import { TextInput } from "react-native";


const TextInputWrapper:React.FC=(props)=>{
    
    return(
        <TextInput
        {...props}
        allowFontScaling={false}/>
    )
}

export default TextInputWrapper; 