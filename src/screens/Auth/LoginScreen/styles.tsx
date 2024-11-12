import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/theme';
import {fontSizes, vh, vw} from '../../../constant';

const styles = StyleSheet.create({
  scrollview: {
    // flex: 1,
    backgroundColor: colors.headerColor,
  },
  container: {
    backgroundColor: colors.headerColor,
    alignItems: 'center',
    marginBottom: vh * 5,
    paddingTop: vh * 2,
    // flex: 1,
  },
  cardStyle: {
    alignItems: 'center',
    flex: 1,
    paddingTop: vh * 2,
  },
  heading: {
    color: colors.black,
    fontSize: fontSizes.f20,
    // fontWeight: "600"
  },
  bottomStyle: {
    paddingTop: vh * 5,
  },
});

export default styles;
