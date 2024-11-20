import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: vw * 30,
  },
  headerButton: {
    padding: 10,
  },
  savedConatiner: {
    width: vw * 9,
    height: vw * 9,
    borderRadius: vw * 4.5,
    backgroundColor: colors.white,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveicon: {
    width: vw * 4,
    height: vh * 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
    backgroundColor: 'yellow',
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 8,
  },
  composer: {
    // borderRadius: 20,
    // borderWidth: 1,
    // borderColor: '#ddd',
    // paddingHorizontal: 10,
    // marginRight: 5,
    // backgroundColor: "yellow",
    color: colors.black,
  },
  timeText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 5,
  },
  messagesContainer: {
    backgroundColor: colors.white,
  },
  leftAlignMessageContainer: {
    backgroundColor: colors.headerColor,
    marginVertical: vh * 0.8,
  },
  rightAlignMessageContainer: {
    backgroundColor: colors.headerColor,
    marginVertical: vh * 0.8,
  },
  erroMsg: {
    color: colors.red,
    fontSize: fontSizes.f14,
    textAlign: 'center',
  },
  sendContainerBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendContainerStyle: {
    width: vw * 5,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: "yellow",
    marginRight: vw * 2,
    // height: pixelSizeVertical(43),
  },
  smileyIcon: {
    marginRight: vw * 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: colors.white,
    // backgroundColor: "pink",
    borderWidth: 0,
    borderTopWidth: 0,
    // height: vh * 7,
    width: vw * 100,
    paddingBottom: vh * 1,
    color: colors.black,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.chatInput,
    borderRadius: vh * 0.9,
    borderColor: colors.inputBorder,
    // padding: vh * 2,
    height: vh * 5.5,
    width: vw * 90,
    color: colors.black,
    marginBottom: vh,
  },
  messageTxt: {
    fontSize: fontSizes.f13,
    color: colors.darkGray,
  },
  messageTxtSelf: {
    fontSize: fontSizes.f13,
    color: colors.darkGray,
  },
  inputToolbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: "green"
  },
  leftButton: {
    // paddingHorizontal: 10,
    // backgroundColor: "yellow",
    // zIndex: 100
  },
  rightButton: {
    // paddingHorizontal: 10,
  },
  likeBtn: {
    width: vw * 8,
    height: vh * 4,
    bottom: vh * 2,
  },
  mediaBtn: {
    width: vw * 9,
    height: vh * 4,
    bottom: vh * 2,
  },
  cardStyle: {
    flexGrow: 1,
    // margin: vh * 2
  },
});

export default styles;
