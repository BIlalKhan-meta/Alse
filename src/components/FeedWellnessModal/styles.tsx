import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {vh, vw} from '../../constant';

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  container: {
    width: vw * 90,
    backgroundColor: colors.white,
    borderRadius: vw * 7,
    alignItems: 'center',
    paddingVertical: vh * 4,
    paddingHorizontal: vw * 5,
  },
  title: {
    color: colors.black,
    marginBottom: vh * 1.5,
    textAlign: 'center',
  },
  message: {
    color: colors.inputText,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: vw * 80,
    justifyContent: 'space-between',
    marginTop: vh * 2,
  },
  buttonContainer: {
    marginTop: 0,
  },
  continueButton: {
    minWidth: vw * 38,
  },
  closeFeedButton: {
    minWidth: vw * 38,
    backgroundColor: colors.white,
  },
  closeFeedButtonText: {
    color: colors.themeColor,
  },
});

export default styles;
