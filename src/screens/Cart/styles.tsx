import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerColor,
    paddingBottom: vh * 6,
  },
  contentContainer: {
    margin: vh * 2,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5, // for Android shadow
  },
  productContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: vw * 90,
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
  productStore: {
    fontSize: fontSizes.f12,
    color: colors.darkText,
  },
  productPrice: {
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    // padding: 4,
    backgroundColor: colors.btnColor,
    width: vw * 6,
    height: vw * 6,
    // justifyContent: "center",
    // alignItems: "center"
    // borderRadius: 5,
    // marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: fontSizes.f16,
    color: colors.white,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
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
    alignSelf: 'center',
    width: vw * 80,
    marginBottom: -10,
  },

  shoppingButton: {
    backgroundColor: colors.white,
    width: vw * 80,
    alignSelf: 'center',
    alignItems: 'center',
  },
  shoppingTxt: {
    color: colors.themeColor,
  },
});

export default styles;
