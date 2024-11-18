import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: vh * 4,
    padding: vw * 2,
    borderRadius: vh,
    marginHorizontal: vw * 4,
    // padding: vw * 5,
    backgroundColor: '#fff',
  },

  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh * 2,
    marginTop: vh * 1,
  },
  orderId: {
    fontSize: fontSizes.f14,
    color: colors.black,
  },
  orderDate: {
    fontSize: fontSizes.f14,
    color: colors.black,
    marginVertical: vh * 1,
  },
  statusContainer: {
    // marginTop: vh * 1,
  },
  status: {
    color: 'yellow',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderList: {
    marginBottom: vh * 2,
  },
  titleStyle: {
    color: colors.black,
  },
  summaryContainer: {
    // marginVertical: vh * 1
  },
  rejectHeading: {
    fontSize: fontSizes.f24,
    color: colors.black,
    marginTop: vh * 3,
    fontWeight: 'bold',
  },
  rejectValue: {
    fontSize: fontSizes.f13,
    color: colors.darkGray,
    marginTop: vh * 0.5,
  },
  btnConatiner: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: vw * 84,
    justifyContent: 'space-between',
    // backgroundColor: "yellow"
  },
  acceptBtn: {
    minWidth: vw * 38,
    // backgroundColor: colors.white,
    // borderColor: colors.white,
  },
  rejectBtn: {
    minWidth: vw * 38,
    backgroundColor: colors.white,
    borderColor: colors.black,
  },
  btntxtstyle:{
    color: colors.black
  }
});

export default styles;
