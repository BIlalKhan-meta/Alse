import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../../constant';
import {colors} from '../../../utils/theme';
import fonts from '../../../assets/fonts';

const styles = StyleSheet.create({
  scrollview: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    backgroundColor: colors.headerColor,
    alignItems: 'center',
    paddingBottom: vh * 5,
    paddingTop: vh * 2,
  },
  cardStyle: {
    alignItems: 'center',
    paddingTop: vh * 2,
  },
  heading: {
    color: colors.black,
    fontSize: fontSizes.f20,
    // fontWeight: '600',
  },
  imageStyle: {
    width: vh * 12,
    height: vh * 12,
    borderRadius: vh * 12,
    backgroundColor: colors.inputBorder
  },
  imageContainer: {
    width: vw * 25,
    height: vh * 12,
    paddingTop: vh * 4,
    // marginTop:vh*4,
    // backgroundColor:"yellow"
  },
  camera: {
    backgroundColor: colors.white,
    width: vh * 3.5,
    height: vh * 3.5,
    borderRadius: vh * 3.5,
    borderWidth: 1.5,
    borderColor: colors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: vh * 12,
    left: vw * 17,
  },
  label: {
    // fontSize:fontSizes.f14,
    alignSelf: 'flex-start',
    // marginLeft:vw*8,
    marginTop: vh * 2,
    color: colors.black,
    fontSize: fontSizes.f14,
  },
  textinputbox: {
    fontSize: fontSizes.f11,
    height: vh * 6,
    marginTop: vh * 2,
    width: vw * 84,
    fontWeight: '300',
    borderColor: colors.inputcolor,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.inputcolor,
    // backgroundColor:colors.green,
    color: colors.inputText,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    // marginRight: 10
  },
  pickercontainer: {
    fontFamily: fonts.Inter.Bold,
    color: colors.inputText,
    fontSize: fontSizes.f11,
    height: vh * 6,
    marginTop: vh * 2,
    width: vw * 42,
    fontWeight: '300',
    borderColor: colors.inputcolor,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.inputcolor,
  },
  checkboxStyle: {
    alignSelf: 'flex-start',
    marginLeft: vw * 8,
    marginTop: vh * 2,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: vh * 2,
  },
  loginTxt: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },
  loginTxt2: {
    fontSize: fontSizes.f12,
    color: colors.themeColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeColor,
  },
  faceBtn: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: vh * 2,
  },
  faceImg: {
    width: vw * 10,
    height: vh * 5,
    alignSelf: 'center',
    marginTop: vh,
  },
  faceTxt: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },
  error: {
    color: colors.redText,
    marginTop: vh * 1,
  },
});

export default styles;
