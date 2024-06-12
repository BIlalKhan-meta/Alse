import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/theme';
import { fontSizes, vh, vw } from '../../../constant';

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

    adddetailsheading:{
      color:colors.inputText,
      fontSize:fontSizes.f12,
      marginTop:vh*2,
      width:vw*80
    }

});

export default styles;
