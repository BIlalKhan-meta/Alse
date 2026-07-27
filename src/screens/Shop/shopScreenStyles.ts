import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';

export const SHOP_SCREEN_BG = '#EFF4F7';

const shopScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHOP_SCREEN_BG,
  },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  bannerWrap: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 160,
    backgroundColor: '#ECECEC',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
  },
  shopName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  saveVendorBtn: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.themeColor || '#0C959B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveVendorText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  shopDescription: {
    paddingHorizontal: 16,
    marginBottom: 8,
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
  },
  shopMeta: {
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  filterCol: {
    flex: 1,
    minWidth: 0,
  },
  filterLabel: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 42,
  },
  filterDropdownText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  filterDropdownArrow: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productGridItem: {
    width: '48%',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
  },
});

export default shopScreenStyles;
