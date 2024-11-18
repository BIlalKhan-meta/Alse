import {Platform, StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: colors.headerColor,
    paddingHorizontal: 15,
    paddingTop: vh * 1,
    marginTop: Platform.OS == 'ios' ? vh * 4 : vh,
  },
  itemCard: {
    marginBottom: vh * 2,
    width: vw * 94,
    alignSelf: 'center',
    padding: 0,
  },
  postButton: {
    width: vw * 22,
    height: vh * 5,
    margin: 0,
    backgroundColor: colors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  postTxt: {
    color: colors.white,
    fontSize: fontSizes.f13,
  },
});

export default styles;
