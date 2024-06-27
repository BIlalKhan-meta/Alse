import { StyleSheet } from "react-native";
import { fontSizes, vh, vw } from "../../constant";
import { colors } from "../../utils/theme";

const styles = StyleSheet.create({
    container: {
        // padding: 10,
    },
    productContainer: {
        flex: 1,
        flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: "space-between",
        margin: 5,
        borderRadius: 10,
        // overflow: 'hidden',
        // backgroundColor: '#fff',
        // backgroundColor: 'pink',
        // position: 'relative',
    },
    productImage: {
        width: vw * 25, // Adjust width as per your design
        height: vh * 15,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },

    activeButton: {
        backgroundColor: colors.themeColor,
        width: vw * 12,
        height: vh * 3,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        padding: vh * 0.5,
        marginLeft: vw * 2
        // zIndex: 1,
    },
    inactiveButton: {
        backgroundColor: colors.redText,
        width: vw * 13,
        height: vh * 3,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        padding: vh * 0.5,
        marginLeft: vw * 2
        // zIndex: 1,
    },
    addButtonText: {
        color: colors.white,
        fontSize: fontSizes.f10,
    },
    productDetails: {
        // flex: 1,
        flexDirection: 'row',
        // justifyContent: 'space-between',
        width: vw * 45,
        // backgroundColor: "yellow"
        // alignItems: 'center',
        // marginLeft: 10, // Adjust spacing between image and text
    },
    blogDetail: {
        fontSize: fontSizes.f12,
        color: colors.lightGrey,
        marginLeft: vw * 2
    },
    blogTitle: {
        fontSize: fontSizes.f14,
        color: colors.black,
        fontWeight: 'bold',
        marginLeft: vw * 2

    },
});


export default styles;