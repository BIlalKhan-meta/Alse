import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';



const styles = StyleSheet.create({
  scrollview: {
    // flex: 1
  },
  container: {
    backgroundColor: colors.headerColor,
    flex: 1,
    alignItems: "center",
    paddingBottom: vh * 34,
    paddingTop: vh * 1

  },
  heading: {
    alignSelf: "center",
    color: colors.headingColor,
    fontWeight: "bold",
    fontSize: fontSizes.f16

  },
  adddetailsheading: {
    // marginVertical: vh * 1.5,
    fontSize: fontSizes.f12,
    alignSelf: "center",
    color: colors.darkGray
  }
  , locationtext: {
    color: colors.green,
    marginTop: vh * 1.5
  },
  // backgroundImage: { marginTop: vh * -31 },
  // backgroundContainer: { height: vh * 29 }
  headingContainer: {
    marginBottom: vh * 2
  },
  cvvStyle: {
    width: vw * 40,
    height: vh * 6,
    backgroundColor: colors.dropdownColor,
    paddingLeft: vw * 4,
    borderRadius: vw * 1
  },
  cvvContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: vw * 84
  }
});

export default styles;