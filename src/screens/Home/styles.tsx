import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { vh } from '../../constant';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        paddingHorizontal: 15,
        paddingTop: 30,
        height: "100%"
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
    emptyContainer: {
        flexGrow: 1,
        height: "100%"

    },
    emptyText: {
        marginVertical: vh * 4
    }

});

export default styles;