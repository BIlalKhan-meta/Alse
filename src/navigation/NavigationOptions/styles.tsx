import {Platform, StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.headerColor,
    width: vw * 100,
  },

  headerTitle: {
    color: colors.black,
    fontSize: fontSizes.f20,
    fontWeight: 'bold',
    width: vw * 80,
  },
  headerTitleWhite: {
    color: colors.white,
    fontSize: fontSizes.f16,
    width: vw * 80,
  },
  headericonStyle: {
    width: vw * 5,
    height: vh * 3,
  },
  headericonButton: {
    marginRight: vw * 2.1,
    marginTop: Platform.OS === 'ios' ? vh * 1 : vh * 2,
    width: vw * 5.5,
    height: vh * 5,
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
    backgroundColor: colors.white,
    marginHorizontal: vw * 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationicon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
  },
  shopcontainer: {},
});
export default styles;
