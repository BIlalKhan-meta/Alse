import { StyleSheet } from 'react-native';
import { fontSizes, vw } from '../../constant';
import { colors } from '../../utils/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingTop: 50,
    },
    activeContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    activeBtn: {
        backgroundColor: colors.themeColor,
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
    }


});

export default styles;