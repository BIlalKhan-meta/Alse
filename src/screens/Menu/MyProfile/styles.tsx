import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/theme';
import {fontSizes, vh, vw} from '../../../constant';

const styles = StyleSheet.create({
  header: {
    height: vh * 20,
  },
  scrollview: {
    // backgroundColor: colors.white,
    // flex: 1
  },
  container: {
    backgroundColor: colors.headerColor,
    // paddingHorizontal: vw * 5,
    // paddingVertical: vh * 4,
  },
  cardContainer: {
    margin: vh * 2,
    padding: 0,
    paddingBottom: vh * 2,
  },
  btn_row: {
    width: '100%',
  },

  banner: {
    // width: vw * 90,
    height: vh * 20,
  },
  btn_text: {
    fontSize: vh * 2,
  },

  imagecontainer: {
    alignItems: 'center',
    position: 'absolute',
    top: (vh * 20) / 2,
    alignSelf: 'center',
    width: vw * 30,
    height: vw * 30,
    borderRadius: vw * 15,
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
    color: colors.themeColor,
    // paddingLeft: vw * 6
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
  },
  btnConatiner: {
    // alignSelf: 'center',
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    minWidth: vw * 35,
    marginTop: vh,
    marginHorizontal: vw * 4,
  },
  btnConatiner2: {
    alignSelf: 'center',
    // flexDirection: "row",
    // alignItems: "center",
    // justifyContent: "center",
    marginTop: vh * 6,
    // marginHorizontal: vw * 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeColor,
  },
  txtImage: {flexDirection: 'row', alignItems: 'center'},
  heading: {
    fontSize: fontSizes.f20,
    color: colors.blueD,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: vh * 4,
  },
  txt: {
    fontSize: fontSizes.f14,
    color: colors.black,
    textAlign: 'center',
    fontWeight: 'bold',
    // alignSelf: "center",
    // width: vw * 40
  },
  contentContainer: {
    marginTop: vh * 4,
  },
  txtConatiner: {
    flexDirection: 'row',
    // alignContent:"center",
    justifyContent: 'space-between',
    // alignItems: "center",
    alignSelf: 'center',
    width: vw * 80,
    // backgroundColor: "yellow"
  },
  headingConatiner: {
    flexDirection: 'row',
    // alignContent:"center",
    justifyContent: 'space-between',
    // alignItems: "center",
    marginTop: vh * 2,
    alignSelf: 'center',
    width: vw * 80,
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
    color: colors.black,
    // marginLeft: vw * 2,
    // textAlign: "left",
    // width: vw * 40
  },
  username: {
    fontSize: fontSizes.f20,
    color: colors.black,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: vh * 2,
  },
  email: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
    alignSelf: 'center',
  },
  profileBtn: {
    backgroundColor: colors.themeColor,
    borderRadius: 4,
    alignSelf: 'center',
    padding: vw * 1,
    marginTop: vh * 2,
  },
  profileTxt: {
    color: colors.white,
    fontSize: fontSizes.f12,
  },
  threeDots: {
    height: vh * 2.5,
    width: vw * 1,
  },
});

export default styles;
