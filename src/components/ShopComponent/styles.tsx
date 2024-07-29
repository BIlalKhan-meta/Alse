import { StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../constant';
import { colors } from '../../utils/theme';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // paddingHorizontal: 15,
        // paddingTop: 50,
        // paddingBottom: vh * 5
    },
    catTxt: {
        paddingLeft: vw * 4
    },
    contentContainer: {
        // top: vh * 32,
        backgroundColor: colors.white,

    },
    feedContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: vw * 4,
        zIndex:1,
        // backgroundColor:"red"

    },
    dropdownContainer: {
        marginTop: vh * 1.4,
        width: vw * 26,
        // backgroundColor: "yellow",
        borderWidth: 1,
        borderColor: colors.white,
        borderRadius: 30,
        zIndex: 5
    },
    activeBtn: {
        backgroundColor: colors.btnColor,
        paddingHorizontal: vw * 3,
        paddingVertical: vw * 2,
        borderRadius: 5
    },
    feedTxt: {
        fontSize: fontSizes.f12,
        color: colors.black,
        borderBottomColor: colors.black,
        borderBottomWidth: 1
    },
    inputContainer: {
        backgroundColor: colors.dropdownColor,
        flexDirection: "row",
        alignItems: "center",
        width: vw * 92,
        height: vh * 5,
        alignSelf: "center",
        borderRadius: vw * 2,
        paddingHorizontal: vw * 4

    },
    searchIcon: {
        width: vw * 4,
        height: vh * 2,
        marginRight: vw * 2
    },
    InactiveTxt: {
        fontSize: fontSizes.f14,
        color: colors.black,
    },

    mainheading: {
        fontSize: fontSizes.f16,
        color: colors.black,
    },
    sortConatiner: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: vh * 2
    },
    heading: {
        color: colors.darkText,
        fontSize: fontSizes.f20,
        fontWeight: "bold"

    },
    label: {
        // fontSize:fontSizes.f14,
        alignSelf: "flex-start",
        marginLeft: vw * 4,
        marginRight: vw * 2,
        marginTop: vh * 1,
        color: colors.darkText,
        fontSize: fontSizes.f12

    },
    pickercontainer: {
        // fontFamily: fonts.Inter.Bold,
        color: colors.inputText,
        fontSize: fontSizes.f11,
        height: vh * 6,
        marginTop: vh * 2,
        width: vw * 55,
        // fontWeight: '200',
        borderColor: colors.inputcolor,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: colors.inputcolor,
        // backgroundColor: "yellow"
    },
    imageStyle: {
        width: '100%',
        height: "100%",
        // borderRadius: 10
    },
    banner: {
        width: vw * 100,
        height: vh * 30,
        top: 0,
        position: "absolute"
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    headericonButton: {
        marginRight: vw * 2.1,
        marginTop: vh * 2,
        width: vw * 5.5,
        height: vh * 5,
    },
    headericonStyle: {
        // marginLeft: vw * 2,
        width: vw * 5,
        height: vh * 2.5,
    },
    threeDots: {
        width: 4,
        height: 19,
    },
    dropDown: {
        borderColor: 'white',
        // backgroundColor: colors.dateConatiner,
        backgroundColor: 'white',

        borderWidth: 1
    },
    editBtn: {
        borderBottomWidth: 1,
        borderBottomColor: colors.btnColor,
        marginLeft: vw * 4,
        marginVertical: vh * 2

    },
    editBtnTxt: {
        color: colors.btnColor
    }
});

export default styles;