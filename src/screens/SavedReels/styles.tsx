import {StyleSheet} from 'react-native';
import {DEVICE_WIDTH, fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

export const GRID_PADDING = 16;
export const GRID_GAP = 12;
export const GRID_COLS = 2;
export const TILE_WIDTH =
  (DEVICE_WIDTH - GRID_PADDING * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;
export const TILE_HEIGHT = TILE_WIDTH * (16 / 9);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F7',
  },
  list: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: vh * 4,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: GRID_PADDING,
  },
  columnWrapper: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
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
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  tileMedia: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1C1C1E',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tilePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '46%',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  tileTopRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  typeBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  unsaveBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  unsaveIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  userName: {
    flex: 1,
    fontSize: fontSizes.f11,
    color: '#fff',
    fontWeight: '600',
  },
  tileCaption: {
    fontSize: fontSizes.f11,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 15,
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
