import { StyleSheet } from 'react-native';
import { vh, vw } from '../../../constant';
import { colors } from '../../../utils/theme';




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
        width: vw * 90,
        height: 50,
        backgroundColor: colors.dropdownColor,

    },
    textInput: {
        paddingVertical: 0,
        backgroundColor: colors.dropdownColor,
        color: colors.inputText
    },
    label: {
        // marginLeft:vw*2,
        color: colors.black,
        marginLeft: vh * 1,
        marginTop: vh * 4
    },

});

export default styles;