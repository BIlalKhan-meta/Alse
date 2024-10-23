import { Platform, StyleSheet } from "react-native";
import { vh, vw } from "../../constant";
import { colors } from "../../utils/theme";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: vw * 2,
        backgroundColor: colors.headerColor,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    planDetails: {
        backgroundColor: '#E0F7FA',
        // padding: 20,
        paddingVertical: vh * 2,
        paddingHorizontal: vw * 2,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: "space-between",
        height: vh * 60,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    planDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        // backgroundColor: '#00796B',
        // paddingVertical: 10,
        // paddingHorizontal: 20,
        // borderRadius: 5,
        // alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logButton: {
        // backgroundColor: '#00796B',
        // paddingVertical: 15,
        // borderRadius: 5,
        // alignItems: 'center',
        // marginTop: 20,
        width: "90%",
        alignSelf: "center"
    },
    logButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    carasouelContainer: {
        height: Platform.OS == "ios" ? vh * 60 : vh * 65,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: vh * 2
    }
});

export default styles;