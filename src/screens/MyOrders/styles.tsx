import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: colors.headerColor,
    padding: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterIcon: {
    fontSize: 24,
  },
  ordersContainer: {
    padding: vh,
    paddingBottom: vh * 8,
  },
});

export default styles;
