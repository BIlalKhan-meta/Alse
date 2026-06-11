import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/theme';

export const PRODUCT_VIEW_BG = '#EFF4F7';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRODUCT_VIEW_BG,
  },
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
  },
  shareButton: {
    padding: 4,
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
    paddingBottom: 16,
  },
  imageWrap: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F3F3',
    height: 220,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
  },
  negotiableBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.blue,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 2,
  },
  negotiableText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  carouselButtonLeft: {
    left: 8,
  },
  carouselButtonRight: {
    right: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 12,
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    marginBottom: 12,
  },
  tab: {
    marginRight: 20,
    paddingBottom: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.themeColor,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.themeColor,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
    minHeight: 80,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '600',
    marginRight: 8,
  },
  selectorOption: {
    fontSize: 14,
    color: '#666',
    marginRight: 14,
    paddingVertical: 2,
  },
  selectorOptionActive: {
    color: colors.themeColor,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  quantityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    padding: 4,
  },
  quantityValue: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.themeColor,
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.themeColor,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  offerButton: {
    borderWidth: 1,
    borderColor: colors.themeColor,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  offerButtonText: {
    color: colors.themeColor,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});

export default styles;
