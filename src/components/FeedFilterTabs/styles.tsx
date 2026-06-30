import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    marginBottom: vh * 1,
    marginTop: vh * 0.5,
  },
  scrollContent: {
    paddingHorizontal: vw * 1,
    paddingVertical: 4,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E4E6EB',
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.themeColor,
    borderColor: colors.themeColor,
  },
  tabText: {
    fontSize: fontSizes.f14,
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
