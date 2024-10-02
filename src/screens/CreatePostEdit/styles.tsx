import { Platform, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        paddingHorizontal: 15,
        paddingTop: Platform.OS == "ios" ? vh * 10 : vh * 3,
        paddingBottom: vh * 4
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
    postButton: {
        width: vw * 20,
        height: vh * 5,
        margin: 0,
        backgroundColor: colors.themeColor,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4
    },
    postTxt: {
        color: colors.white,
        fontSize: fontSizes.f13
    }

});

export default styles;