import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';


const styles = StyleSheet.create({
  header: {
    height: vh * 20
  },
  scrollview: {
    backgroundColor: colors.headerColor,
    flex: 1
  },
  container: {
    // paddingHorizontal: vw * 5,
    // paddingVertical: vh * 4,
    margin: vh * 2
  },

  btnStyle: {
    alignSelf: "center",
    marginTop: vh * 2
  }

});

export default styles;