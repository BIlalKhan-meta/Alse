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

});

export default styles;
