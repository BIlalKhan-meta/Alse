import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerColor,
    paddingHorizontal: 15,
    paddingTop: 50,
  },
  iconContainer: {
    height: vw * 10,
    width: vw * 10,
    borderRadius: vw * 10,
    alignItems: 'center',
    justifyContent: 'center',
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

  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputcolor,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonIcon: {
    width: 17,
    height: 10,
  },
  buttonIcon2: {
    width: 16,
    height: 15,
  },
  buttonText: {
    color: colors.inputText,
    fontSize: 16,
    marginLeft: 5,
  },
  header: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // width: vw * 22
  },
  threeDots: {
    width: vw * 10,
    height: vh * 5,
    // marginLeft: 20,
  },
});

export default styles;
