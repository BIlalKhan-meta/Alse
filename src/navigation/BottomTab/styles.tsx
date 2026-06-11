import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  tabStyle: {
    backgroundColor: colors.white,
    height: vh * 8.5,
    paddingTop: vh * 0,
    paddingBottom: vh * 0.5,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarLabel: {
    fontSize: fontSizes.f10,
    marginTop: -12,
    marginBottom: 3,
  },
  tabButtonText: {
    fontSize: fontSizes.f12,
    marginTop: -4,
    color: colors.inputBorder,
  },
  icon: {
    width: vw * 5.5,
    height: vw * 5.5,
    resizeMode: 'contain',
  },
});

export default styles;
