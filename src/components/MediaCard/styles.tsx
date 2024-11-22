import { StyleSheet } from "react-native";
import { fontSizes, vh, vw } from "../../constant";
import { colors } from "../../utils/theme";

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        // marginBottom: 10,
    },
    media: {
        width: '100%',
        height: vh * 20,
        borderRadius: 10,
    },
    textContainer: {
        paddingTop: 10,
        // backgroundColor: "yellow",
        width: vw * 80
    },
    title: {
        fontSize: fontSizes.f16,
        color: colors.black
        // fontWeight: 'bold',
    },
    description: {
        fontSize: fontSizes.f12,
        color: colors.lightGrey,
        marginVertical: 5,
    },
    category: {
        fontSize: fontSizes.f12,
        color: colors.themeColor,
    },
    bookmarkContainer: {
        // position: 'absolute',
        marginTop: vh * 1,
        // right: 10,
    },
    bookmarkIcon: {
        width: vw * 5,
        height: vh * 3
    },
});

export default styles;