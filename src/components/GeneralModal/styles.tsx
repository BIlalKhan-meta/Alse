
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
  container: {
    width: vw * 90,
    backgroundColor: 'white',
    borderRadius: vw * 7,
    alignItems: 'center',
    paddingVertical: vh * 4,
    paddingHorizontal: vw * 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  blurcontainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  title: {
    color: colors.black,
    marginBottom: vh * 1.5,
  },
  message: {
    color: colors.inputText,
    textAlign: 'center',
  },
  inputContainer:{
width:'80%',
  },
  buttonContainerStyle: {
    marginTop: vh * 1.4,
  },
  imageConatiner: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vh * 2
  },
  innerImage: { position: "absolute" },
  secondaryBtnCon: {
    flexDirection: "row",
    width: vw * 80,
    // backgroundColor: "yellow",
    justifyContent: "space-between"
  },
  secondaryBtn1: {
    width: vw * 35
  },
  secondaryBtn2: {
    width: vw * 35,
    backgroundColor: colors.white
  },
});

export default styles;
