import {Platform, StyleSheet} from 'react-native';
import {colors} from '../../utils/theme'; // Assuming you have a theme file for colors
import {fontSizes, vh, vw} from '../../constant'; // Assuming these are your utility functions for responsive sizing

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: vw * 4,
    backgroundColor: colors.headerColor,
    alignItems: 'center',
    paddingBottom: vh * 2,
    // flex: 1
  },
  row_style: {
    width: '90%',
    alignSelf: 'center',
  },
  cardStyle: {
    // marginVertical: vh,
    marginTop: Platform.OS == 'ios' ? vh * 8 : 0,
  },
  section: {
    marginBottom: vh * 2,
  },
  inputStyle: {
    marginBottom: 16,
    backgroundColor: colors.inputcolor,
    paddingLeft: vw * 4,
    height: vh * 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDownContainer: {
    zIndex: 98,
    // backgroundColor: colors.inputcolor,
  },
  dropDown: {
    // marginBottom: 16,
    borderWidth: 0,
    // zIndex: 98,
    backgroundColor: colors.inputcolor,
  },
  dropdownLabel: {
    fontSize: fontSizes.f14,
    color: colors.black,
    // fontWeight: 'bold',
    marginBottom: 8,
    marginTop: vh * 2,
    zIndex: -99,
  },
  submitButton: {
    // backgroundColor: colors.primary, // Assuming colors.primary is your button background color
    // paddingVertical: vh * 2,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: vh * 2,
    marginLeft: vw * 2,
    alignSelf: 'center',
  },
  imgTxt: {
    color: colors.black,
    fontSize: fontSizes.f14,
    alignSelf: 'flex-start',
    marginLeft: vw * 4,
    marginTop: vh * 4,
  },
  uploadBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.inputcolor,
    alignItems: 'center',
    paddingHorizontal: vw * 4,
    height: vh * 7,
    width: vw * 85,
    marginBottom: 16,
    marginTop: vh * 2,
  },
  uploadTxt: {
    marginLeft: vw * 2,
    color: colors.inputText,
    fontSize: fontSizes.f14,
  },
  uploadImg: {
    width: vw * 6,
    height: vh * 3,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh * 2,
    width: '90%',
    paddingHorizontal: vw * 2,
    marginTop: vh * 4,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: vw * 1,
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },
});

export default styles;
