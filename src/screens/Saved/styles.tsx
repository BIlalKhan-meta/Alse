import { Platform, StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../constant';
import { colors } from '../../utils/theme';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        paddingHorizontal: 15,
        paddingTop: Platform.OS=="ios"?vh*8: vh * 1,
    },
    activeContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    activeBtn: {
        backgroundColor: colors.themeColor,
        paddingHorizontal: vw * 3,
        paddingVertical: vw * 2,
        borderRadius: 5
    },
    activeTxt: {
        fontSize: fontSizes.f14,
        color: colors.white,
    },
    InactiveBtn: {
        // backgroundColor: colors.themeColor
    },
    InactiveTxt: {
        fontSize: fontSizes.f14,
        color: colors.black,
    },
    contentContainer: {
        marginTop: vh * 2,
        marginBottom: vh * 4,
    },
    itemStyle: {
        padding: 0,
        paddingBottom: vh * 2
    },
    heading: {
        color: colors.inputText,
        fontSize: fontSizes.f14,

    },
    label: {
        // fontSize:fontSizes.f14,
        alignSelf: "flex-start",
        // marginLeft:vw*8,
        marginTop: vh * 2,
        color: colors.black,
        fontSize: fontSizes.f14

    },
    pickercontainer: {
        fontFamily: fonts.Inter.Bold,
        color: colors.inputText,
        fontSize: fontSizes.f11,
        height: vh * 6,
        marginTop: vh * 2,
        width: vw * 55,
        fontWeight: '300',
        borderColor: colors.inputcolor,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: colors.inputcolor
        // backgroundColor: "yellow"
    },
    threeDots: {
        width: vw * 10,
        height: vh * 5,
        // marginLeft: 20,
    },

});

export default styles;