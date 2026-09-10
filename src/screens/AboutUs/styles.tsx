import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F4F7F7',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: vh * 5,
  },
  hero: {
    backgroundColor: colors.themeColor,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 14,
  },
  brand: {
    fontSize: fontSizes.f28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  heroTagline: {
    marginTop: 6,
    fontSize: fontSizes.f16,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  heroLine: {
    marginTop: 10,
    fontSize: fontSizes.f13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  sectionTitle: {
    fontSize: fontSizes.f18,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 6,
  },
  sectionTagline: {
    fontSize: fontSizes.f14,
    color: colors.themeColor,
    fontWeight: '600',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: fontSizes.f14,
    color: colors.darkGray,
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletBlock: {
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.themeColor,
  },
  bulletLabel: {
    fontSize: fontSizes.f14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: vw * 4,
  },
  footerBrand: {
    fontSize: fontSizes.f20,
    fontWeight: '800',
    color: colors.themeColor,
    letterSpacing: 1,
  },
  footerTagline: {
    marginTop: 6,
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: '600',
  },
  footerLine: {
    marginTop: 8,
    fontSize: fontSizes.f13,
    color: colors.lightGrey,
    textAlign: 'center',
  },
});

export default styles;
