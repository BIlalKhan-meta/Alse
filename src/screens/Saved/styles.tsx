import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F7',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: vh * 4,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  introCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  introIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF6F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  introTextWrap: {
    flex: 1,
  },
  introTitle: {
    fontSize: fontSizes.f16,
    color: colors.black,
    fontWeight: '700',
  },
  introSubtitle: {
    marginTop: 2,
    fontSize: fontSizes.f12,
    color: colors.lightGrey,
    lineHeight: 18,
  },
  countPill: {
    backgroundColor: '#EAF6F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countPillText: {
    fontSize: fontSizes.f12,
    color: colors.themeColor,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  shareLoaderOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  shareLoaderContent: {
    backgroundColor: colors.white,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 160,
  },
  shareLoaderText: {
    marginTop: 12,
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: '500',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: vh * 8,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF6F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: fontSizes.f18,
    color: colors.black,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: fontSizes.f14,
    color: colors.lightGrey,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default styles;
