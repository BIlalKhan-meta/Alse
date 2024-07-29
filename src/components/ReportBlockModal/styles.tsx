import { StyleSheet } from "react-native";
import { vh, vw } from "../../constant";

const styles = StyleSheet.create({

    dots: {
        padding: 10,
    },
    modalBackground: {
        // flex: 1,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        // justifyContent: 'flex-end',
        alignItems: 'center',
        width: vw * 30,
        // alignSelf: "flex-end",
        // marginTop: vh * 8,
        // marginRight: vw * 12,
        position: "absolute",
        right: vh * 2,
        zIndex: 100
        // top: 55
        // elevation: 4,
        // borderWidth: 1
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 5,
        // marginBottom: 20,
        width: "100%",
        elevation: 5,
        paddingVertical: vh * 1

    },
    modalOption: {
        paddingVertical: vh * 0.5,
        // borderBottomWidth: 1,
        // borderBottomColor: '#ccc',
        alignItems: 'center',
    },
});

export default styles;