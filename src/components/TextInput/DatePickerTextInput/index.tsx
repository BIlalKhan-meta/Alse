import React from "react";
import { TextInput, TextInputProps , StyleProp, TextStyle , View, Image, TouchableOpacity, ViewStyle, Text} from "react-native";
import TextInputWrapper from '../TextInputWrapper'
import { StyleSheet } from "react-native";
import InterBoldLabel from "../../Text/InterBoldLabel";
import { fontSizes, vh, vw } from "../../../constant";
import { colors } from "../../../utils/theme";
import fonts from "../../../assets/fonts";
// import VisibilityOffIcon from '../../../assets/icons/visibilityofficon.png';
// import EyeIcon from '../../../assets/icons/eyeicon.png';
// import InterRegularSmall from "../../Text/InterRegularSmall";
import DatePicker from 'react-native-date-picker'
// import calendericon from '../../../assets/icons/calendericon.png'
// import InterLightSmall from "../../Text/InterLightSmall";
import InterLight from "../../Text/InterLight";
import { FormikErrors } from "formik";
import InterRegularSmallest from "../../Text/InterRegularSmallest";

// type dateProp = Date | string ; 
interface DatePickerTextInputProps extends TextInputProps{
    style?: StyleProp<ViewStyle>;
    label?: string;
    submitted?:boolean;
    errors?:FormikErrors<Date>;
    openDate?:boolean;
    setOpenDate:React.Dispatch<React.SetStateAction<boolean>>;
    date:Date;
    setDate:(newDate: any)=> void;
    value:string;
}

const DatePickerTextInput:React.FC<DatePickerTextInputProps>=(props)=>{

    const {style , label , submitted , errors , openDate , setOpenDate , date , setDate , value } = props;
    
    return(
        <>
        <View style={styles.container}>
        {label && 
        <InterBoldLabel style={styles.label}>
        {label}
       </InterBoldLabel>}
       <TouchableOpacity onPress={() => setOpenDate(true)}>
       <View style={[styles.textinputbox]}>
        <InterLight style={{color:colors.silver}}>{value ? value : 'mm/dd/yyyy'}</InterLight>
                    {/* <Image source={calendericon} style={styles.calendericon}/> */}
          </View>
          </TouchableOpacity>
           <DatePicker
                   modal
                   mode="date"
                   open={openDate}
                   date={date}
                  onConfirm={(date) => {
                      setOpenDate(false)
                      setDate(date)
                  }}
                   onCancel={() => {
                      setOpenDate(false)
                    }}
                   />

        {submitted && errors &&
        <InterRegularSmallest style={styles.error}>
            {errors}
        </InterRegularSmallest>}
        </View>
        </>
    )
}

const styles = StyleSheet.create({
    container:{marginTop:vh*4, 
      // backgroundColor:'red'
    },
    label:{marginLeft:vw*2},
    textinputbox:{
      fontSize:fontSizes.f11,
      height:vh*6,
      marginTop:vh*2,
      width:vw*85, 
      fontWeight:'300', 
      borderColor: 'rgba(48, 86, 112, 0.05)',
      borderWidth: 1,
      borderRadius: 5 , 
      paddingHorizontal: 10 , 
      backgroundColor:'rgba(48, 86, 112, 0.05)',
      // backgroundColor:colors.green,
      color:colors.black,
      flexDirection:'row',
      alignItems:'center'
    },
      eyeicon:{
        position: 'absolute',
        marginTop:vh*7 , 
        marginLeft:vw*77 , 
        height:vh*4, 
        width:vw*8
      },
      error:{
        color:colors.redText, 
        marginTop:vh*1
      },
      calendericon:{
        marginLeft:'auto'
        // alignSelf:'center'
        // position:'absolute',
        // marginTop:vh*7,
        // marginLeft:vw*78,
        // backgroundColor:'yellow'
      }
});

export default DatePickerTextInput; 