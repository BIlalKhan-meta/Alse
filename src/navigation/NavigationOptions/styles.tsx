import {Platform, StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

// Native stack header (RNSScreenStackHeaderConfig) requires integer dimensions to avoid "Loss of precision" on Android
const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.headerColor,
    width: Math.round(vw * 100),
  },

  headerTitle: {
    color: colors.black,
    fontSize: Math.round(fontSizes.f20),
    fontWeight: 'bold',
    width: Math.round(vw * 80),
  },
  headerTitleWhite: {
    color: colors.white,
    fontSize: Math.round(fontSizes.f16),
    width: Math.round(vw * 80),
  },
  homeTitle: {
    color: colors.black,
    fontSize: Math.round(fontSizes.f24),
    fontWeight: 'bold',
    width: Math.round(vw * 80),
  },
  headericonStyle: {
    width: Math.round(vw * 5),
    height: Math.round(vh * 3),
  },
  headericonButton: {
    marginRight: Math.round(vw * 2.1),
    marginTop: Platform.OS === 'ios' ? Math.round(vh * 1) : Math.round(vh * 2),
    width: Math.round(vw * 5.5),
    height: Math.round(vh * 5),
  },
  productHeaderBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Math.round(vw * 2.1),
  },
  iconContainer: {
    height: vw * 10,
    width: vw * 10,
    borderRadius: vw * 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationandshopcontainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  notificationcontainer: {
    width: vw * 10,
    height: vh * 5,
    borderRadius: vw * 10,
    backgroundColor: 'transparent',
    marginHorizontal: vw * 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationicon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },

  messageIcon: {
    width: vh * 3.5,
    height: vh * 3.5,
    resizeMode: 'contain',
  },
  logoImage: {
    height: vh * 4,
    width: vw * 24,
    resizeMode: 'contain',
  },
  shopcontainer: {},
});
export default styles;
