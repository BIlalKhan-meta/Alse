import {Platform, StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.headerColor,
    paddingHorizontal: vw * 5,
    paddingVertical: vh * 2,
    flex: 1,
  },
  similar_header: {
    fontSize: vh * 3,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },

  header_title: {
    fontSize: vh * 2,
    color: colors.black,
    maxWidth: vw * 70,
    fontFamily: fonts.Inter.Medium,
  },
  contentContainer: {
    marginTop: Platform.OS == 'ios' ? vh * 8 : 2,
    marginBottom: vh * 4,
    padding: vh * 2,
    backgroundColor: colors.white,
    borderRadius: vw * 2,
  },
  blogImage: {
    width: '100%',
    height: vh * 30,
    borderRadius: vw * 2,
  },
  statusContainer: {
    backgroundColor: colors.themeColor,
    width: vw * 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vw * 2,
    height: vh * 2.8,
    position: 'absolute',
    alignSelf: 'flex-end',
    top: vh * 2,
    right: vh * 2,
  },
  activeContainer: {
    backgroundColor: colors.redStatus,
  },
  activeTitle: {
    fontSize: fontSizes.f12,
    color: colors.white,
  },
  blogTitle: {
    fontSize: fontSizes.f20,
    color: colors.black,
    fontWeight: 'bold',
    marginVertical: vh * 2,
  },
  blogContent: {
    fontSize: fontSizes.f14,
    color: colors.black,
    lineHeight: vh * 2.5,
  },
  category: {
    fontSize: fontSizes.f12,
    color: colors.themeColor,
    paddingTop: vh * 2,
  },
  checkoutButton: {
    alignSelf: 'center',
    width: vw * 40,
    marginRight: vw * 2,
  },
  shoppingButton: {
    backgroundColor: colors.white,
    width: vw * 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  shoppingTxt: {
    color: colors.themeColor,
    fontSize: fontSizes.f14,
  },
  buttonTxt: {
    fontSize: fontSizes.f14,
  },
  btnContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: vh * 2,
  },
  postButton: {
    width: vw * 10,
    height: vh * 5,
    margin: 0,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (vh * 5) / 2,
  },
  postTxt: {
    color: colors.white,
    fontSize: fontSizes.f13,
  },
});

export default styles;
