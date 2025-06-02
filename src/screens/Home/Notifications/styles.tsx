import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/theme';
import {fontSizes, vh, vw} from '../../../constant';

const styles = StyleSheet.create({
  contentCOntainer: {marginBottom: 40, backgroundColor: colors.headerColor},
  maincontainer: {backgroundColor: colors.white},
  container: {
    // marginVertical: vh * 1.5,
    // marginHorizontal: vw * 2,
    paddingVertical: vh * 1.5,
    flexDirection: 'row',
  },
  readConatiner: {
    // marginVertical: vh * 1.5,
    marginHorizontal: vw * 2,
    paddingVertical: vh * 1.5,
    flexDirection: 'row',
    backgroundColor: colors.lightGraySearch,
    borderRadius: 6,
  },
  innercontainer: {
    // backgroundColor:'red',
    marginHorizontal: vw * 2,
  },
  profilepic: {},
  notification: {
    color: colors.notiTxt,
    width: vw * 75,
    // backgroundColor:'yellow',
    lineHeight: vh * 2.5,
  },
  readNoti: {
    color: colors.themeColor,
    width: vw * 75,
    // backgroundColor:'yellow',
    lineHeight: vh * 2.5,
  },
  time: {
    color: colors.themeColor,
    lineHeight: vh * 2.5,
    fontSize: vh * 1.5,
  },
  title: {
    color: colors.darkGray,
    marginHorizontal: vw * 5,
    marginVertical: vh * 1.5,
  },
  styledline: {
    backgroundColor: colors.lightSilver,
    borderColor: colors.lightSilver,
    borderWidth: vw * 0.1,
    width: vw * 85,
    alignSelf: 'center',
  },
  unreadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh * 1,
    width: '90%',
  },
  unreadBtn: {
    borderBottomWidth: 1,
    borderBottomColor: colors.inputText,
  },
  unreadTxt: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },
  readBtn: {
    borderBottomWidth: 1,
    borderBottomColor: colors.inputText,
  },
  readTxt: {
    color: colors.inputText,
    fontSize: vh * 1.5,
  },
  dropdownContainer: {
    marginTop: vh * 1.4,
    width: vw * 35,
  },
  dropDown: {
    borderColor: colors.borderColor,
    // backgroundColor: colors.dateConatiner,
    backgroundColor: colors.white,

    borderWidth: 1,
  },
  label2: {
    fontSize: fontSizes.f10,
    color: colors.black,
    marginLeft: vh * 1,
    marginTop: vh * 1,
  },
  statusConatiner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: vh * 4,
    marginLeft: vw * 2,
  },
  notiIcon: {
    width: vw * 6.2,
    height: vh * 3.6,
    marginHorizontal: vw * 2,
  },
  cardContainer: {
    margin: vh * 2,
  },
});

export default styles;
