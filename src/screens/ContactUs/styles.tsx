import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
  scrollview: {
    backgroundColor: colors.white
  },
  cardContainer: {
    margin: vh * 2
  },
  container: {
    paddingHorizontal: vw * 6,
    paddingBottom: vh * 10,
    // backgroundColor:colors.red,
  },
  adddetailsheading: {
    marginTop: vh * 1.5
  },
  msgStyle: {
    height: vh * 20,
    width: vw * 84,
    // alignSelf: "center",
    backgroundColor: colors.inputcolor,
    borderRadius: 8,
    marginTop: vh * 2,
    paddingLeft: vw * 2
  },
  label: {
    marginLeft: vw * 2,
    marginTop: vh * 2,
    fontSize: fontSizes.f14,
    color: colors.black
  },
  inputStyle: {
    fontSize: fontSizes.f11,
    fontWeight: '300',
    color: colors.black,
    backgroundColor: colors.inputcolor
  }
});

export default styles;