import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import fonts from '../../assets/fonts';

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
    gap: vw * 2,
  },
  modalButton: {
    flex: 1,
    minHeight: vh * 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vw * 2,
    paddingVertical: vh * 1.2,
  },
  modalButtonPressed: {
    opacity: 0.85,
    transform: [{scale: 0.97}],
  },
  closeButton: {
    backgroundColor: colors.themeColor,
    borderWidth: 1,
    borderColor: colors.themeColor,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: fontSizes.f16,
    fontFamily: fonts.Inter.Regular,
    fontWeight: '500',
    textAlign: 'center',
  },
  closeFeedButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.themeColor,
  },
  closeFeedButtonPressed: {
    backgroundColor: colors.inputcolor,
    opacity: 0.9,
    transform: [{scale: 0.97}],
  },
  closeFeedButtonText: {
    color: colors.themeColor,
    fontSize: fontSizes.f16,
    fontFamily: fonts.Inter.Regular,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default styles;
