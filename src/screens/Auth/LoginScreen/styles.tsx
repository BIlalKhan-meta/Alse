import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/theme';
import { fontSizes, vh, vw } from '../../../constant';

const styles = StyleSheet.create({
  scrollview: {
    // flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    backgroundColor: colors.headerColor,
    alignItems: "center",
    paddingBottom: vh * 5,
    paddingTop: vh * 2,
    // flex: 1

  },
  cardStyle: {
    alignItems: "center",
    flex: 1,


  },
  heading: {
    color: colors.black,
    fontSize: fontSizes.f24,
    fontWeight: "600"
  },
  bottomStyle: {
    paddingTop: vh * 35,

  }

});

export default styles;
