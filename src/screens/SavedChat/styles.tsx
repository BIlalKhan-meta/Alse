import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { vh, vw } from '../../constant';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    listContainer: {
        paddingBottom: 16,

    },
    chatCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.inputcolor,
        borderRadius: 8,
        paddingHorizontal: vw * 4,
        marginBottom: 10,
        width: vw * 90,
        height: vh * 10,
        alignSelf: "center",
        zIndex: 0,
        // position: "absolute",


        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 2,
    },
    chatInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatIcon: {
        width: vw * 8,
        height: vh * 4,
        marginRight: 10,
    },
    chatDetails: {
        justifyContent: 'center',
    },
    chatTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.black,
    },
    chatTime: {
        fontSize: 14,
        color: colors.gray,
    },
    ellipsisIcon: {
        width: vw * 0.8,
        height: vh * 2,
        marginRight: vw * 2
    },
    dropdownMenu: {
        // position: 'absolute',
        right: 10,
        top: 100,
        backgroundColor: colors.white,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 10000,
    },
    dropdownText: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        fontSize: 14,
        color: colors.black,
    },
});

export default styles;
