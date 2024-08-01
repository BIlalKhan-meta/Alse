import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';


const styles = StyleSheet.create({
  header: {
    height: vh * 20
  },
  scrollview: {
    backgroundColor: colors.white,
    // flex: 1
  },
  container: {
    paddingHorizontal: vw * 8,
    // paddingVertical: vh * 4,
    backgroundColor: colors.white,
    // paddingBottom: vh * 12
  },

  imagecontainer: {
    alignItems: 'center',
    // position: "absolute",
    marginTop: vh * 2,
    alignSelf: "center",
    borderWidth: 2,
    width: vw * 30,
    height: vw * 30,
    borderColor: colors.white,
    borderRadius: vw * 15

  },
  changePasswordText: {
    color: colors.lightBlack,
    textDecorationLine: 'underline',
    marginVertical: vh * 1
  },
  tierandbadgecontainer: {
    flexDirection: 'row',
    height: vh * 10,
    width: vw * 80,
    // backgroundColor:'yellow',
    alignItems: 'center'
  },
  keyvaluepair: {
    marginLeft: 'auto'
  },
  rejected: { alignSelf: "center", backgroundColor: "white", color: "blue" },
  editTxt: {
    fontSize: fontSizes.f16,
    color: colors.forgotColor,
  },
  editImage: {
    width: vw * 5,
    height: vh * 2.5
  },
  rightImage: {
    width: vw * 10,
    height: vh * 5
  },
  imageStyle: {
    width: "100%",
    height: "100%",

  },
  btnConatiner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: vh * 4
  },
  heading: {
    fontSize: fontSizes.f20,
    color: colors.blueD,
    fontWeight: "bold",
    alignSelf: "center",
    // marginTop: vh * 4
  },
  txt: {
    fontSize: fontSizes.f14,
    // color: colors.forgotColor,
    // alignSelf: "center",
    fontWeight: "bold",
    paddingBottom: vh * 2

  },
  txtConatiner: {
    flexDirection: "row",
    // alignContent:"center",
    justifyContent: "space-between",
    // alignItems: "center",
    marginTop: vh * 4,
    // alignSelf: "center",
    width: vw * 60,
    // backgroundColor: "yellow"
  },
  InnerConatiner: {
    flexDirection: "row",
    alignItems: "center"
  },
  phoneImage: {
    width: vw * 10,
    height: vh * 5
  },
  phoneTxt: {
    fontSize: fontSizes.f14,
    color: colors.forgotColor,
    marginLeft: vw * 2
  },
  Btn2: {
    alignSelf: "center",
    backgroundColor: colors.white,
    borderColor: colors.blueD,
    width: vw * 85,
    borderRadius: 20,
    marginTop: vh * 2

  },
  btnTxt: {
    color: colors.blueD
  },
  phoneContainer: {
    // width: vw * 90
  }

});

export default styles;