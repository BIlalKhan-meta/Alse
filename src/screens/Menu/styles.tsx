import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: vh * 4,
    backgroundColor: colors.headerColor,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  cardContainer: {
    width: vw * 90,
    alignSelf: 'center',
    marginTop: vh * 2,
  },
  contentCon: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: vw * 12,
    height: vw * 12,
    borderRadius: vw * 6,
  },
  userName: {
    fontSize: fontSizes.f16,
    color: colors.black,
    marginLeft: vw * 3,
    // fontWeight: 'bold',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  cardHeading: {
    fontSize: fontSizes.f14,
    color: colors.black,
  },
  cardText: {
    fontSize: fontSizes.f14,
    color: colors.lightGrey,
    marginLeft: vw * 6,
    marginTop: vh * 1,
  },
  btnCon: {
    marginTop: vh * 1.5,
  },
  cardContent5: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifiCon: {
    width: vw * 7,
    height: vh * 4,
    marginRight: vw * 4,
  },
  bottomCon: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: vw * 90,
    justifyContent: 'space-between',
  },

  cardContainer2: {
    width: vw * 43,
    marginTop: vh * 2,
  },
});

export default styles;
