import {StyleSheet} from 'react-native';
import {vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

export const styles = StyleSheet.create({
  absoluteStyle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dialogContainer: {
    width: vw * 77,
    // height: vh * 47,
    backgroundColor: 'white',
    borderRadius: vh * 5,
    borderWidth: 1,
    borderColor: colors.themeColor,
    padding: vh * 1,
  },
  crossContainer: {
    height: vh * 4,
    width: vh * 4,
    borderRadius: vh * 4,
    backgroundColor: colors.themeColor,
    alignSelf: 'flex-end',
    margin: vh * 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    color: colors.black,
    textAlign: 'center',
    marginVertical: vh * 2,
    fontSize: vh * 1.9,
    width: '90%',
    alignSelf: 'center',
  },
});
