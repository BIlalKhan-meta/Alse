import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        paddingHorizontal: 15,
        paddingTop: 30,
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

});

export default styles;