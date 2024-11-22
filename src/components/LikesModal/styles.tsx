import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    width: vw * 100,
    height: vh * 50,
    backgroundColor: 'white',
    borderTopLeftRadius: vw * 7,
    borderTopRightRadius: vw * 7,
    // borderTopWidth:vw*1,
    alignItems: 'center',
    paddingVertical: vh * 3,
    paddingHorizontal: vh * 2,
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
  titleContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: vh * 1.5,
  },
  title: {
    color: colors.filterTxt,
    marginLeft: vh * 1,
    fontSize: fontSizes.f18,
    // fontWeight: "600"
  },
  message: {
    color: colors.darkGray,
  },

  commentContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
    // width: '80%',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    // flexDirection: 'row',
    // alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: 'bold',
  },
  comment: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },
  likeButton: {
    padding: 10,
  },
  likeIcon: {
    width: 24,
    height: 24,
  },
  postActions: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // alignSelf: 'flex-start',
    // backgroundColor: 'red',
    marginBottom: 10,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  actionText: {
    marginRight: 20,
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  inputConatiner: {
    flexDirection: 'row',
    // backgroundColor: "yellow",
    justifyContent: 'space-between',
    alignContent: 'center',
    width: '100%',
    backgroundColor: colors.inputcolor,
    height: vh * 6,
    paddingHorizontal: vw * 2,
    borderRadius: 5,
    bottom: 0,
  },
  inputCon: {
    width: '80%',
    // backgroundColor: "red",
    justifyContent: 'center',
    alignContent: 'center',
  },
  input: {
    width: '80%',
    height: '100%',
  },
  send: {
    // backgroundColor: "pink",
    alignSelf: 'flex-end',
    height: '100%',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 10
  },
});

export default styles;
