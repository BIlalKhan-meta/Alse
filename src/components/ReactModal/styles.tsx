import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    width: vw * 100,
    height: vh * 72,
    backgroundColor: 'white',
    borderTopLeftRadius: vw * 7,
    borderTopRightRadius: vw * 7,
    // borderTopWidth:vw*1,
    // alignItems: 'center',
    paddingVertical: vh * 3,
    paddingHorizontal: vh * 2
  },
  blurcontainer: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,

  },
  header: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    // alignItems: 'center',
    // paddingHorizontal: 20,
    // paddingTop: 20,
    // backgroundColor: 'white',
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // elevation: 4,
  },
  heading: {
    fontWeight: "bold",
    fontSize: fontSizes.f16,
    color: colors.black
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tabButtonText: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },
  activeTabTxt: {
    color: colors.blue,
    fontSize: fontSizes.f12
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
  },
  reactionsList: {
    // paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // elevation: 4,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  reactionAvatar: {
    width: vw * 14,
    height: vw * 14,
    borderRadius: vw * 7,
    marginRight: 10,
  },
  reactionUserName: {
    fontSize: fontSizes.f14,
    color: colors.black
  },
  reactionIconCon: {
    position: 'absolute',
    top: vh * 4,
    right: vw * 1,
    width: vw * 6,
    height: vw * 6,
    borderRadius: vw * 3,
    alignItems: "center",
    justifyContent: "center",
    resizeMode: 'contain',
    zIndex: 1,
    backgroundColor: colors.blue
  },
  reactionIcon: {

    width: vw * 4,
    height: vh * 2,

  },
});

export default styles;