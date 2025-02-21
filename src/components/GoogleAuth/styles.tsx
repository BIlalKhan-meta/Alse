import { StyleSheet } from "react-native";
import { vh } from "../../constant";

const styles = StyleSheet.create({

    googleButton: {
        borderWidth: 0,
        marginTop: vh * 2,
        backgroundColor: "#0C959B1A",
        width: "100%",
        paddingLeft: 20,
        paddingVertical: 16,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    googleLogin: {
    },
    googleButtonLoading: {
        borderWidth: 0,
        marginTop: vh * 2,
        backgroundColor: "#0C959B1A",
        width: "100%",
        paddingLeft: 20,
        paddingTop: 5,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default styles;