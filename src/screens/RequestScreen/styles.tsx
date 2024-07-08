import { StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../constant';
import { colors } from '../../utils/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 50,
    },
    activeContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    activeBtn: {
        borderBottomColor: colors.themeColor,
        borderBottomWidth: 1,
        paddingHorizontal: vw * 3,
        paddingVertical: vw * 2,
        borderRadius: 5
    },
    activeTxt: {
        fontSize: fontSizes.f14,
        color: colors.themeColor,
    },
    inactiveBtn: {
        // Styles for inactive buttons if needed
    },
    inactiveTxt: {
        fontSize: fontSizes.f14,
        color: colors.black,
    },
    contentContainer: {
        marginTop: vh * 2,
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        // borderBottomWidth: 1,
        // borderBottomColor: colors.lightGrey,
    },
    avatarConatiner: {
        flexDirection: "row",
        alignItems: "center"
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: 10,
    },
    userName: {
        fontSize: fontSizes.f14,
        color: colors.black,
        marginLeft: vw * 2
    },
    actionButton: {
        padding: 8,
        backgroundColor: colors.themeColor,
        borderRadius: 5,
    },
    actionButtonText: {
        fontSize: fontSizes.f12,
        color: '#fff',
    },
});

export default styles;
