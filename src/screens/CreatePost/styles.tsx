import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingTop: 50,
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
    media: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    button2: {
        backgroundColor: '#DDDDDD',
        padding: 10,
        marginHorizontal: 10,
    },

});

export default styles;