import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    width: vw * 100,
    height: vh * 72,
    backgroundColor: 'white',
    borderTopLeftRadius: vw * 7,
    borderTopRightRadius: vw * 7,
    paddingVertical: vh * 3,
    paddingHorizontal: vh * 2,
  },
  blurContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backdrop: {backgroundColor: 'rgba(0,0,0,0.6)', flex: 1, zIndex: -99},
  absolute: {
    position: 'absolute',
    top: 100,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: -99,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: fontSizes.f16,
    color: colors.black,
  },
  createButton: {
    backgroundColor: colors.red,
    paddingVertical: vh * 1,
    paddingHorizontal: vw * 4,
    borderRadius: vw * 2,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupNameInput: {
    backgroundColor: colors.dropdownColor,
    borderRadius: vw * 2,
    width: vw * 80,
    color: colors.black,
    // padding: vh * 2,
    // marginBottom: vh * 2,
  },
  usersList: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    // paddingVertical: 10,
  },
  userAvatar: {
    width: vw * 14,
    height: vw * 14,
    borderRadius: vw * 7,
    marginRight: 10,
  },
  userName: {
    fontSize: fontSizes.f14,
    color: colors.black,
    flex: 1,
  },
  checkedIcon: {
    width: vw * 6,
    height: vh * 6,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  cameConatner: {
    backgroundColor: colors.blueShade,
    width: vw * 10,
    height: vw * 10,
    borderRadius: (vw * 10) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameIcon: {
    // width: vw * 6,
    // height: vh * 2.6,
    width: '100%',
    height: '100%',
  },
});

export default styles;
