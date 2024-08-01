import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: vw * 4,
        backgroundColor: colors.white,
        // alignItems: "center",
        // // paddingBottom: vh * 2,
        flex: 1,
    },
    contentContainer: {
        flex: 1
    },
    section: {},
    inputStyle: {
        marginBottom: 16,
        backgroundColor: colors.dropdownColor,
        paddingLeft: vw * 4,
        height: vh * 6
    },
    dropdownLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    dropDown: {
        marginBottom: 16,
        borderWidth: 0
    },
    submitButton: {
        alignSelf: "center"
    },
    uploadBtn: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: colors.dropdownColor,
        alignItems: "center",
        paddingHorizontal: vw * 4,
        height: vh * 6,
        marginBottom: 16
    },
    uploadTxt: {
        fontSize: fontSizes.f12
    },
    uploadImg: {
        width: vw * 6,
        height: vh * 3
    },

});

export default styles;
