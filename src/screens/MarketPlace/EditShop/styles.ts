import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/theme';
import {fontSizes, vh, vw} from '../../../constant';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerColor,
    paddingHorizontal: 15,
    // paddingTop: 50,
  },
  inputStyle: {
    marginBottom: 16,
    backgroundColor: colors.inputcolor,
    paddingLeft: vw * 4,
    height: vh * 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownLabel: {
    color: colors.black,
    fontSize: fontSizes.f14,
    // fontWeight: 'bold',
    marginBottom: 8,
  },
  uploadBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: colors.dropdownColor,
    alignItems: 'center',
    paddingHorizontal: vw * 4,
    height: vh * 6,
  },
  uploadTxt: {
    fontSize: fontSizes.f12,
  },
  uploadImg: {
    width: vw * 6,
    height: vh * 3,
  },
});
