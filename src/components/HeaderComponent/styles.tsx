import { StyleSheet } from "react-native";
import { fontSizes } from "../../constant";
import { colors } from "../../utils/theme";

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: fontSizes.f24,
        fontWeight: 'bold',
        color: colors.black
    },
    headerIcons: {
        flexDirection: 'row',
    },
    icon: {
        width: 30,
        height: 30,
        marginLeft: 20,
    },
});

export default styles;
