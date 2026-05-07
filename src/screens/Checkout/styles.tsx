import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    // flexGrow: 1,
    paddingHorizontal: vw * 5,
    paddingTop: vh * 2,
    paddingBottom: vh * 2,
    backgroundColor: colors.headerColor,
  },
  section: {
    marginBottom: vh,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: vh * 1,
    color: colors.black,
  },
  placeOrderButton: {
    // backgroundColor: colors.primary,
    // paddingVertical: vh * 1,
    // alignItems: 'center',
    // borderRadius: vw * 2,
    // marginTop: vh * 2,
    alignSelf: 'center',
    marginVertical: vh * 2,
  },
  placeOrderButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    // marginHorizontal: vw * 2,
    marginVertical: vh * 2,
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
    color: colors.inputText,
  },
  summaryText: {
    fontSize: fontSizes.f16,
    color: colors.black,
    // marginBottom: 10,
  },
  summaryPrice: {
    fontSize: fontSizes.f14,
    color: colors.inputText,
  },
  fieldContainer: {
    width: '100%',
    alignSelf: 'stretch',
  },
  inputStyle: {
    backgroundColor: colors.inputcolor,
    height: vh * 5,
    color: colors.black,
    width: '100%',
    alignSelf: 'stretch',
  },
  label: {
    color: colors.black,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    width: '100%',
    alignSelf: 'stretch',
    zIndex: 5,
    backgroundColor: colors.inputcolor,
  },
  dropDown: {
    borderColor: colors.inputcolor,
    backgroundColor: colors.inputcolor,
    borderWidth: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  countryLabel: {
    fontSize: fontSizes.f14,
    color: colors.black,
    marginTop: vh * 3,
    marginLeft: vw * 2,
  },
});

export default styles;
