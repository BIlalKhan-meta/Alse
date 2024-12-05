import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  scrollview: {
    backgroundColor: colors.white,
  },
  container: {
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 2,
    margin: vh * 2,
  },
  adddetailsheading: {
    color: colors.darkGray,
    fontSize: fontSizes.f14,
  },
});

export default styles;
