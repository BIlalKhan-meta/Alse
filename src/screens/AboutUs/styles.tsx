import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
  scrollview: {
    backgroundColor: colors.white
  },
  container: {
    paddingHorizontal: vw * 6,
    paddingBottom: vh * 4,
    margin: vh * 2
    // backgroundColor:colors.red,
  },
  adddetailsheading: {
    // marginTop: vh * 1.5,
    color: colors.darkGray,
    fontSize: fontSizes.f14

  }

});

export default styles;