import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: fontSizes.f18,
    color: colors.black,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heading: {
    fontSize: fontSizes.f14,
    color: colors.black,
  },
  value: {
    fontSize: fontSizes.f14,
    // color: colors.darkText,
    marginLeft: vw,
  },
});

export default styles;
