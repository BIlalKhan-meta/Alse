import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    // flexGrow: 1,
    paddingHorizontal: vw * 4,
    // paddingTop: vh * 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingBottom: vh * 2,
  },
  contentContainer: {
    width: vw * 94,
    marginTop: vw,
  },
  row_style: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: colors.headerColor,
    padding: vh,
  },
  section: {
    // marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputStyle: {
    marginBottom: 16,
    backgroundColor: colors.inputcolor,
    paddingLeft: vw * 4,
    height: vh * 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputConatiner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputStyle2: {
    marginBottom: 16,
    backgroundColor: colors.inputcolor,
    // backgroundColor: "yellow",
    paddingLeft: vw * 4,
    height: vh * 6,
    justifyContent: 'center',
    alignItems: 'center',
    width: vw * 30,
  },
  dropdownLabel: {
    color: colors.black,
    fontSize: fontSizes.f14,
    // fontWeight: 'bold',
    marginBottom: 8,
  },
  dropDown: {
    marginBottom: 16,
    borderWidth: 0,
    backgroundColor: colors.inputcolor,
    // opacity: 4
  },
  submitButton: {
    // backgroundColor: colors.primary,
    // paddingVertical: 12,
    // alignItems: 'center',
    // borderRadius: 8,
    // marginTop: 300,
    alignSelf: 'center',
  },
  uploadBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.dropdownColor,
    alignItems: 'center',
    paddingHorizontal: vw * 4,
    height: vh * 6,
  },
  uploadTxt: {
    fontSize: fontSizes.f12,
  },
  uploadImg: {
    width: vw * 6,
    height: vh * 3,
  },
});

export default styles;
