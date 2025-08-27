import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.headerColor,
  },
  scrollview: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.headerColor,
    flex: 1,
    paddingHorizontal: vw * 5,
    paddingBottom: vh * 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw * 5,
    paddingVertical: vh * 2,
    backgroundColor: colors.headerColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  backButton: {
    width: vw * 10,
    height: vw * 10,
    borderRadius: vw * 5,
    backgroundColor: colors.lightColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: fontSizes.f18,
    color: colors.black,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: fontSizes.f18,
    fontWeight: '600',
    color: colors.black,
  },
  headerSpacer: {
    width: vw * 10,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: vw * 3,
    padding: vw * 5,
    marginTop: vh * 3,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: fontSizes.f16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: vh * 3,
  },
  cardNumberContainer: {
    position: 'relative',
    marginBottom: vh * 2,
  },
  cardNumberInput: {
    paddingRight: vw * 20,
    color: colors.black,
  },
  cardIconsContainer: {
    position: 'absolute',
    right: vw * 3,
    top: vh * 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: vw * 8,
    height: vw * 8,
    borderRadius: vw * 1,
    backgroundColor: colors.lightColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw * 1,
  },
  cardIconText: {
    fontSize: fontSizes.f12,
  },
  cvvStyle: {
    backgroundColor: colors.inputcolor,
    borderRadius: vw * 2,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.black,
    marginBottom: vh * 2,
  },
  expirationInput: {
    backgroundColor: colors.inputcolor,
    borderRadius: vw * 2,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.black,
  },
  payButton: {
    backgroundColor: colors.themeColor,
    borderRadius: vw * 2,
    paddingVertical: vh * 1,
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: colors.themeColor,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
    // elevation: 3,
  },
  heading: {
    alignSelf: 'center',
    color: colors.black,
    fontWeight: 'bold',
    fontSize: fontSizes.f16,
  },
  adddetailsheading: {
    fontSize: fontSizes.f12,
    alignSelf: 'center',
    color: colors.darkGray,
  },
  locationtext: {
    color: colors.green,
    marginTop: vh * 1.5,
  },
  headingContainer: {
    marginBottom: vh * 2,
  },
});

export default styles;
