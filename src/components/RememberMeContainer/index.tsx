import {StyleProp, Text, TextStyle, TouchableOpacity, View} from 'react-native';
import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import fonts from '../../assets/fonts';
import { useState } from 'react';
import CheckBox from 'expo-checkbox';
import InterLight from '../Text/InterLight';

interface RememberMeContainerProps{
    isSelected:boolean;
    setIsSelected:(isSelected:boolean) => void;
    onPress:()=> void;
}

const RememberMeContainer: React.FC<RememberMeContainerProps> = (props) => {

    const {isSelected , setIsSelected , onPress} = props;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.remembermecontainer}>
            <CheckBox
            value={isSelected}
            onValueChange={()=> setIsSelected(!isSelected)}
            />
            <InterLight style={styles.remembermetext}>Remember me</InterLight>
        </View>
        <TouchableOpacity style={styles.forgottextcontainer} onPress={onPress}>
            <InterLight style={styles.forgottext}>Forgot Password?</InterLight>
        </TouchableOpacity>
        
      </View>
    </>
  );
};

const styles = StyleSheet.create({
    container:{flexDirection:'row' , marginTop:vh*2,width:vw*84},
    remembermecontainer:{flexDirection:'row', alignItems:'center'},
    remembermetext:{marginLeft:vw*2,color:colors.inputText},
    forgottextcontainer:{marginLeft:'auto', },
    forgottext:{color:colors.lightGrey,borderBottomWidth:1,borderBottomColor:colors.redText}
});

export default RememberMeContainer;