import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: colors.headerColor,
    },
    sortButton: {
        backgroundColor: colors.white,
        width: vw * 40,
        height: vh * 4,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: vw * 1
    },
    activeTab: {
        backgroundColor: colors.themeColor
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        // backgroundColor: "yellow",
        justifyContent: "space-between",
        width: vw * 85

    },
    sortLabel: {
        fontSize: fontSizes.f12,
        // fontWeight: 'bold',
    },
    activelabel: {
        color: colors.white
    },
    dropDown: {
        flex: 1,
    },
    filterIcon: {
        width: 24,
        height: 24,
        marginRight: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    card: {
        // padding: 16,
        borderRadius: 8,
        margin: vw * 2,
    },
    topHead: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: vh * 1,
    },
    heading: {
        fontSize: fontSizes.f12,
        color: colors.black
    },
    value: {
        fontSize: fontSizes.f14,
        color: colors.darkGray
    }
});

export default styles;
