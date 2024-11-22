import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    marginTop: vh * 4,
  },
  productContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // width: vw * 90,
    alignSelf: 'center',
    // backgroundColor: "yellow",
    // padding: vw * 2,
    // borderBottomWidth: 1,
    // borderColor: '#ccc',
  },
  productImage: {
    width: vw * 20,
    height: vh * 10,
    borderRadius: vw * 2,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  productName: {
    fontSize: fontSizes.f16,
    color: colors.black,
    fontWeight: 'bold',
  },
  colorContainer: {
    flexDirection: 'row',
  },
  productColor: {
    fontSize: fontSizes.f10,
    color: colors.black,
    // width: vw * 10,
  },
  colorValue: {
    fontSize: fontSizes.f10,
    color: colors.themeColor,
    width: vw * 10,
  },
  productPrice: {
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh * 1,
  },
  quantityButton: {
    // padding: 4,
    backgroundColor: colors.themeColor,
    width: vw * 8,
    height: vw * 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: vw * 4,
    // marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: fontSizes.f12,
    color: colors.white,
    fontWeight: 'bold',
    alignSelf: 'center',
  },

  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: colors.black,
  },
  quantityText2: {
    fontSize: fontSizes.f12,
    color: colors.darkText,
  },
  deleteButton: {
    // padding: 10,
    alignSelf: 'flex-end',
    marginBottom: vh * 1.5,
  },
  deleteButtonIcon: {
    width: vw * 4,
    height: vh * 2.5,
  },
  lineStyle: {
    width: vw * 90,
    alignSelf: 'center',
  },
  summaryContainer: {
    marginHorizontal: vw * 4,
    marginTop: vh * 5,
    // padding: 20,
    // backgroundColor: '#f7f7f7',
    // borderTopWidth: 1,
    // borderColor: '#ccc',
  },
  summaryTxtContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh * 1,
  },
  summary: {
    fontSize: fontSizes.f20,
    color: colors.darkText,
  },
  summaryText: {
    fontSize: fontSizes.f16,
    color: colors.black,
    // marginBottom: 10,
  },
  summaryPrice: {
    fontSize: fontSizes.f14,
    color: colors.darkText,
  },
  checkoutButton: {
    marginBottom: vh * 1,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  continueShoppingText: {
    color: colors.black,
    fontSize: fontSizes.f12,
  },
  shoppingButton: {
    borderBottomColor: colors.black,
    borderBottomWidth: vw * 0.3,
    // width: vw * 40,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: vh * 2,
  },
});

export default styles;
