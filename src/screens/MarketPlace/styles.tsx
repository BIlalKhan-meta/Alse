import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { vh, vw } from '../../constant';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        paddingHorizontal: 15,
        paddingTop: vh * 1.2,
        paddingBottom: 30
    },



    uploadOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        width: vw * 60,
        alignSelf: "center"
    },
    buttonText: {
        color: colors.inputText,
        fontSize: 16,
        marginLeft: 5,
    },

});

export default styles;