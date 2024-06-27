import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    width: vw * 100,
    height: vh * 25,
    backgroundColor: 'white',
    borderTopLeftRadius: vw * 7,
    borderTopRightRadius: vw * 7,
    // borderTopWidth:vw*1,
    alignItems: 'center',
    paddingVertical: vh * 4
  },
  blurcontainer: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,

  },
  uploadOptions: {
    // flexDirection: 'row',
    // justifyContent: 'space-around',
    alignItems: "flex-start",
    alignSelf: "flex-start"
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputcolor,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: vh * 2,
    marginRight: vw * 2
  },
  buttonIcon: {
    width: 17,
    height: 10,
    marginRight: vh * 2
  },
  buttonIcon2: {
    width: 19,
    height: 16,
    marginRight: vh * 2

  },
  buttonText: {
    color: colors.inputText,
    fontSize: 16,
    marginLeft: 5,
  },

});

export default styles;