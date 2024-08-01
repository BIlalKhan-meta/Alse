import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';


const styles = StyleSheet.create({
  header: {
    height: vh * 20
  },
  scrollview: {
    backgroundColor: colors.white,
    flex: 1
  },
  container: {
    paddingHorizontal: vw * 5,
    // paddingVertical: vh * 4,
    backgroundColor: colors.white
  },

  btnStyle: {
    alignSelf: "center",
    marginTop: vh * 2
  }

});

export default styles;