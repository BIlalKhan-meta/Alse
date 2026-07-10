import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: vw * 2,
    paddingBottom: vh * 0.8,
  },
  scrollContent: {
    paddingHorizontal: vw * 1,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E4E6EB',
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.themeColor,
    borderColor: colors.themeColor,
  },
  tabText: {
    fontSize: fontSizes.f12,
    fontFamily: fonts.Inter.Regular,
    color: '#65676B',
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default styles;
