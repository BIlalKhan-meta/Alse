import {StyleSheet} from 'react-native';
import {vh, vw} from '../../../constant';
import {colors} from '../../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    // padding: 10,
    // backgroundColor:'rgba(48, 86, 112, 0.05)',
    // backgroundColor:"yellow"
  },
  phoneContainer: {
    width: vw * 86,
    height: 50,
    backgroundColor: colors.inputcolor,
  },
  textInput: {
    paddingVertical: 0,
    backgroundColor: colors.inputcolor,
    color: colors.inputText,
  },
  label: {
    // marginLeft:vw*2,
    color: colors.black,
    marginBottom: vh * 2,
    marginTop: vh * 4,
  },
  error: {
    color: colors.redText,
    marginTop: vh * 1,
    marginLeft: vw * 2,
  },
});

export default styles;
