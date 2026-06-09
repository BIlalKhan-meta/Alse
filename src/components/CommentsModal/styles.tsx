import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    width: vw * 100,
    height: vh * 85,
    backgroundColor: 'white',
    borderTopLeftRadius: vw * 7,
    borderTopRightRadius: vw * 7,
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
  flatList: {
    flex: 1,
    width: '100%',
  },
  commentItem: {
    width: '100%',
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
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userNameContainer: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '600',
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  comment: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  likeButton: {
    padding: 5,
    marginLeft: 10,
  },
  likeIcon: {
    width: 24,
    height: 24,
  },
  postActions: {
    flexDirection: 'row',
    marginBottom: 5,
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
    marginLeft: 5,
    fontSize: 12,
    color: '#65676B',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 15,
  },
  inputConatiner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8FAFE',
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  inputCon: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    fontSize: 14,
    color: '#333',
  },
  send: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  loaderOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loaderContent: {
    backgroundColor: colors.white,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 160,
  },
  loaderText: {
    marginTop: 12,
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: '500',
  },
});

export default styles;
