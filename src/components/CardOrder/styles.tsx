import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: vw * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh * 0.5,
  },
  orderId: {
    fontWeight: 'bold',
    color: colors.black,
    fontSize: fontSizes.f12,
  },
  customerName: {
    marginBottom: vh * 0.5,
    color: colors.darkGray,
    fontSize: fontSizes.f11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDate: {
    fontWeight: 'bold',
  },
  amountPaid: {
    fontWeight: 'bold',
  },
});

export default styles;
