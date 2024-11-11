import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerColor,
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: vh * 15,
  },

  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    width: vw * 60,
    alignSelf: 'center',
    marginTop: vh,
  },
  buttonText: {
    color: colors.inputText,
    fontSize: 16,
    marginLeft: 5,
  },
});

export default styles;
