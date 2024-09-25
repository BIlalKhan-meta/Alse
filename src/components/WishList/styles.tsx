import { StyleSheet } from "react-native";
import { fontSizes, vh, vw } from "../../constant";
import { colors } from "../../utils/theme";

const styles = StyleSheet.create({
    container: {
        // padding: 10,
    },
    productContainer: {
        // flex: 1,
        width:vw*40,
        flexDirection: 'column',
        alignItems: 'center',
        margin: vh*0.6,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    heartIconContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 1,
    },
    addButton: {
        position: 'absolute',
        bottom: vh * 7,
        right: 5,
        backgroundColor: colors.themeColor,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    addButtonText: {
        color: 'white',
        fontSize: 20,
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
        fontSize: fontSizes.f12,
        color: colors.black,
    },
    product: {
        fontSize: fontSizes.f10,
        color: colors.black,
    },
    productPrice: {
        fontSize: fontSizes.f12,
        color: colors.black,
        fontWeight: "bold"
    },
});

export default styles;