import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
  header: {
    height: vh * 20,
  },
  scrollview: {
    backgroundColor: colors.headerColor,
    // flex: 1
  },
  container: {
    // paddingHorizontal: vw * 8,
    // paddingVertical: vh * 4,
    backgroundColor: colors.headerColor,
    // paddingBottom: vh * 12
  },
  cardContainer: {
    margin: vh * 2,
    padding: 0,
    paddingBottom: vh * 2,
  },

  banner: {
    width: '100%',
    height: vh * 20,
  },
  profileConatiner: {
    bottom: vh * 10,
  },
  imagecontainer: {
    alignItems: 'center',
    // position: "absolute",
    marginTop: vh * 2,
    alignSelf: 'center',
    borderWidth: 2,
    width: vw * 30,
    height: vw * 30,
    borderColor: colors.white,
    borderRadius: vw * 15,
  },
  camBg: {
    position: 'absolute',
    alignSelf: 'center',
    top: vw * 28,
    backgroundColor: colors.camBg,
    width: vw * 8,
    height: vw * 8,
    borderRadius: vw * 4,
    alignItems: 'center',
    justifyContent: 'center',
    left: vw * 50,
  },
  camcontainer: {
    width: vw * 5.6,
    height: vh * 2.4,
  },
  changePasswordText: {
    color: colors.lightBlack,
    textDecorationLine: 'underline',
    marginVertical: vh * 1,
  },
  tierandbadgecontainer: {
    flexDirection: 'row',
    height: vh * 10,
    width: vw * 80,
    // backgroundColor:'yellow',
    alignItems: 'center',
  },
  keyvaluepair: {
    marginLeft: 'auto',
  },
  rejected: {alignSelf: 'center', backgroundColor: 'white', color: 'blue'},
  editTxt: {
    fontSize: fontSizes.f16,
    color: colors.forgotColor,
  },
  editBtn: {
    position: 'absolute',
    right: vh * 2,
    top: vh * 2,
  },
  editImage: {
    width: vw * 5,
    height: vh * 2.5,
  },
  rightImage: {
    width: vw * 10,
    height: vh * 5,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.borderColor,
  },
  btnConatiner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vh * 4,
  },
  heading: {
    fontSize: fontSizes.f20,
    color: colors.blueD,
    fontWeight: 'bold',
    alignSelf: 'center',
    // marginTop: vh * 4
  },
  txt: {
    fontSize: fontSizes.f14,
    color: colors.black,
    // alignSelf: "center",
    fontWeight: 'bold',
    // paddingBottom: vh * 2
  },
  txtConatiner: {
    // flexDirection: "row",
    // alignContent:"center",
    justifyContent: 'space-between',
    // alignItems: "center",
    marginTop: vh * 4,
    // alignSelf: "center",
    // width: vw * 60,
    // backgroundColor: "yellow"
  },
  InnerConatiner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneImage: {
    width: vw * 10,
    height: vh * 5,
  },
  phoneTxt: {
    fontSize: fontSizes.f12,
    color: colors.forgotColor,
    marginLeft: vw * 2,
    marginTop: vh * 2,
  },
  Btn2: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderColor: colors.blueD,
    width: vw * 85,
    borderRadius: 20,
    marginTop: vh * 2,
  },
  btnTxt: {
    color: colors.blueD,
  },
  phoneContainer: {
    // width: vw * 90
  },
  label: {
    // fontSize:fontSizes.f14,
    // alignSelf: "flex-start",
    // marginLeft:vw*8,
    marginTop: vh * 2,
    color: colors.black,
    fontSize: fontSizes.f14,
    fontWeight: 'bold',
  },
  textinputbox: {
    fontSize: fontSizes.f11,
    height: vh * 6,
    marginTop: vh * 2,
    width: '100%',
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
    alignSelf: 'flex-start',
    marginRight: 10,
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
  inputContainer: {
    bottom: vh * 10,
    marginHorizontal: vw * 3,
    // backgroundColor: "yellow"
  },
  calendericon: {
    width: vw * 4,
    height: vh * 2,
    alignSelf: 'center',
    marginLeft: 'auto',
  },
});

export default styles;
