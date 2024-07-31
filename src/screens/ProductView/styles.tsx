import { StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../constant';
import { colors } from '../../utils/theme';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        // paddingHorizontal: 15,
        // paddingTop: 50,
        // marginBottom: vh * 30,
        // paddingBottom: 60,
        //iff ios will createe issue then i have to open height only for ios
        // height: vh * 100
    },
    cardContainer: {
        flex:1,
        margin: vh * 2,
        // backgroundColor:"yellow"
    },
    contentContainer: {
        flex: 1,
        // marginTop: vh * 1
    },
    activeContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    activeBtn: {
        backgroundColor: colors.btnColor,
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
        // width: vw * 90,
        height: vh * 40,
        // top: 0,
        // position: "absolute"
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
    headerBtn: {
        width: vw * 30,
        height: vh * 5,
        backgroundColor: colors.btnColor,
        borderRadius: vw * 2,
        justifyContent: "center",
        alignItems: "center"
    },
    headerBtnTxt: {
        color: colors.white,
        fontSize: fontSizes.f13
    },
    productDetails: {
        marginTop: vh * 1.5,
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // backgroundColor: "yellow"
    },
    productName: {
        fontSize: fontSizes.f18,
        color: colors.black,
    },
    priceContainer: {
        flexDirection: "row"
    },
    ratingTxt: {
        fontSize: fontSizes.f12,
        color: colors.darkGray
    },
    productPrice: {
        fontSize: fontSizes.f12,
        color: colors.black,
        fontWeight: "bold",
        paddingLeft: vw * 2
    },
    vendorContainer: {
        flexDirection: "row",
        marginVertical: vh * 1
    },
    vendorTxt: {
        fontSize: fontSizes.f14,
        color: colors.darkGray
    },
    bulletTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: vw * 4,
    },
    bullet: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.darkGray,
        marginRight: 8,
    },
});

export default styles;