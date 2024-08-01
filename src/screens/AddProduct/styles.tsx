import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
    container: {
        // flexGrow: 1,
        paddingHorizontal: vw * 4,
        // paddingTop: vh * 1,
        backgroundColor: colors.white,
        alignItems: "center",
        paddingBottom: vh * 2
    },
    section: {
        // marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    inputStyle: {
        marginBottom: 16,
        backgroundColor: colors.dropdownColor,
        paddingLeft: vw * 4,
        height:vh*6,
        justifyContent:"center",
        alignItems:"center"

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
        // backgroundColor: colors.primary,
        // paddingVertical: 12,
        // alignItems: 'center',
        // borderRadius: 8,
    },
    uploadBtn: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: colors.dropdownColor,
        alignItems: "center",
        paddingHorizontal: vw * 4,
        height: vh * 6
    },
    uploadTxt: {
        fontSize: fontSizes.f12
    },
    uploadImg: {
        width: vw * 6,
        height: vh * 3
    }
});

export default styles;
