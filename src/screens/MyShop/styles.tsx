import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerColor,
    paddingHorizontal: 15,
    // paddingTop: 50,
  },
  dropDown: {
    borderColor: colors.inputcolor,
    backgroundColor: colors.inputcolor,
    borderWidth: 1,
    width: vw * 45,
  },
  activeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: colors.themeColor,
    paddingHorizontal: vw * 3,
    paddingVertical: vw * 2,
    borderRadius: 5,
  },
  activeTxt: {
    fontSize: fontSizes.f14,
    color: colors.white,
  },
  InactiveBtn: {
    // backgroundColor: colors.themeColor
  },
  InactiveTxt: {
    fontSize: fontSizes.f14,
    color: colors.black,
  },
  contentContainer: {
    marginTop: vh * 2,
    marginBottom: vh * 4,
  },
  mainheading: {
    fontSize: fontSizes.f16,
    color: colors.black,
  },
  sortConatiner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh * 2,
  },
  sortInput: {
    backgroundColor: colors.inputcolor,
    // backgroundColor:"yellow",
    marginVertical: vh * 1,
    width: vw * 40,
    height: vh * 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    color: colors.inputText,
    fontSize: fontSizes.f14,
  },
  label: {
    // fontSize:fontSizes.f14,
    alignSelf: 'flex-start',
    // marginLeft:vw*8,
    marginTop: vh * 2,
    color: colors.black,
    fontSize: fontSizes.f14,
  },
  pickercontainer: {
    fontFamily: fonts.Inter.Bold,
    color: colors.inputText,
    fontSize: fontSizes.f11,
    height: vh * 6,
    marginTop: vh * 2,
    width: vw * 55,
    // fontWeight: '200',
    borderColor: colors.inputcolor,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.inputcolor,
    // backgroundColor: "yellow"
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  banner: {
    width: vw * 86,
    height: vh * 30,
  },
  threeDots: {
    width: vh * 4,
    height: vh * 4,
  },
  btnConatiner: {
    flexDirection: 'row',
    // width: vw * 80,
    width: '100%',
    justifyContent: 'space-evenly',
    alignSelf: 'center',
  },
  secondaryBtn1: {
    minWidth: '45%',
  },
  secondaryBtn2: {
    minWidth: '45%',
    backgroundColor: colors.white,
  },
});

export default styles;
