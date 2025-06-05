import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  tabStyle: {
    backgroundColor: colors.white,
    height: vh * 9,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    fontSize: fontSizes.f12,
    marginTop: -4, // Add some margin between the icon and the text
    color: colors.inputBorder,
  },
  icon: {
    width: vw * 6,
    height: vh * 6,
    resizeMode: 'contain', // Ensures the icons keep their aspect ratio
  },
});

export default styles;
