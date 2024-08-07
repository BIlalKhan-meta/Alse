import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: vw * 4,
        backgroundColor: colors.headerColor,
        // alignItems: "center",
        // // paddingBottom: vh * 2,
        // flex: 1,
    },
    contentContainer: {
        marginVertical: vh * 2
        // flex: 1,
        // backgroundColor: "yellow"

    },
    section: {},
    inputStyle: {
        marginBottom: 16,
        backgroundColor: colors.inputcolor,
        paddingLeft: vw * 4,
        height: vh * 6
    },
    dropdownLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    // dropDown: {
    //     marginBottom: 16,
    //     borderWidth: 0
    // },
    submitButton: {
        alignSelf: "center"
    },
    uploadBtn: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: colors.inputcolor,
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
    dropdownContainer: {
        // marginTop: vh * 1.4,
        width: vw * 82,
        zIndex: 5,
        backgroundColor: colors.inputcolor

    },
    dropDown: {
        borderColor: colors.inputcolor,
        // backgroundColor: colors.dateConatiner,
        backgroundColor: colors.inputcolor,
        borderWidth: 1,
        // zIndex: 100

    },
    countryLabel: {
        fontSize: fontSizes.f14,
        color: colors.black,
        marginTop: vh * 3,
        marginLeft: vw * 2
    },

});

export default styles;
