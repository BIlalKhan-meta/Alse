import { StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../../constant';
import { colors } from '../../../utils/theme';
import fonts from '../../../assets/fonts';



const styles = StyleSheet.create({
  scrollview:{
    flex:1,
    backgroundColor:colors.white,
  },
  container: {
    backgroundColor:colors.white,
    alignItems:"center",
    paddingBottom:vh*5

    },
    heading:{
      color:colors.black,
      fontSize:fontSizes.f24,
      fontWeight:"600"
    },
    imageContainer:{
      width:vw*25,
      height:vh*12,
      paddingTop:vh*4
      // marginTop:vh*4,
      // backgroundColor:"yellow"
    },
    camera:{
      backgroundColor:colors.white,
      width:26, 
      height:26,
      borderRadius:26/2,
      alignItems:"center",
      justifyContent:"center",
      position:"absolute",
      top:vh*12,
      left:vw*17
    },
      label:{
        // fontSize:fontSizes.f14,
        alignSelf:"flex-start",
        // marginLeft:vw*8,
        marginTop:vh*2,
      color:colors.black,
      fontSize:fontSizes.f14

      },
      textinputbox:{
        fontSize:fontSizes.f11,
        height:vh*6,
        marginTop:vh*2,
        width:vw*42, 
        fontWeight:'300', 
        borderColor: colors.inputcolor,
        borderWidth: 1,
        borderRadius: 5 , 
        paddingHorizontal: 10 , 
        backgroundColor:colors.inputcolor,
        // backgroundColor:colors.green,
        color:colors.inputText,
        flexDirection:'row',
        alignItems:'center',
        alignSelf:"flex-start",
        marginRight:10
      },
      pickercontainer:{        
        fontFamily: fonts.Inter.Bold,
        color: colors.inputText,
        fontSize:fontSizes.f11,
        height:vh*6,
        marginTop:vh*2,
        width:vw*42, 
        fontWeight:'300', 
        borderColor:colors.inputcolor,
        borderWidth: 1,
        borderRadius: 5 , 
        paddingHorizontal: 10 , 
        backgroundColor:colors.inputcolor
      },
      checkboxStyle:{
        alignSelf:"flex-start",
        marginLeft:vw*8,
        marginTop:vh*2,

      },
      loginContainer:{
        flexDirection:"row",
        marginTop:vh*2
      },
      loginTxt:{
        fontSize:fontSizes.f12,
        color:colors.inputText
      },
      loginTxt2:{
        fontSize:fontSizes.f12,
        color:colors.themeColor,
        borderBottomWidth:1,
        borderBottomColor:colors.themeColor
      },

});

export default styles;