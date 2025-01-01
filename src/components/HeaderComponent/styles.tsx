import {StyleSheet} from 'react-native';
import {fontSizes, vh} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: fontSizes.f24,
    fontWeight: 'bold',
    color: colors.black,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
  },
  backicon: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  dotIcon: {
    width: 4,
    height: 20,
  },
});

export default styles;
