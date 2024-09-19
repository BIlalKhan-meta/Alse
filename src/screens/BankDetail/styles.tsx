import { Platform, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';


const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.headerColor,
        paddingHorizontal: vw * 5,
        // paddingVertical: vh * 4,
        flex:1
    },
    contentContainer: {

        marginTop:Platform.OS=="ios"?vh*8:vh * 1

        // alignItems: "center"
    },
    btnConatiner: {
        alignSelf: "center",
        marginTop: vh * 4,
    },
    txtImage: { flexDirection: "row", alignItems: "center" },
    heading: {
        fontSize: fontSizes.f20,
        color: colors.blueD,
        fontWeight: "bold",
        alignSelf: "center",
        marginTop: vh * 4
    },
    txt: {
        fontSize: fontSizes.f14,
        color: colors.black,
        // fontWeight: "bold",
        // alignSelf: "center",
        // width: vw * 50,

    },
    txtConatiner: {
        // flexDirection: "row",
        // alignContent: "center",
        // justifyContent: "space-between",
        // alignItems: "center",
        marginVertical: vh * 2,
        // alignSelf: "center",
        // width: vw * 90,
    },

    phoneTxt: {
        fontSize: fontSizes.f14,
        color: colors.forgotColor,
        // marginLeft: vw * 2,
        textAlign: "left",
        // width: vw * 50,

    }


});

export default styles;