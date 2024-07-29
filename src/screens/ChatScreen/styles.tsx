
import { Platform, StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../constant';
import { colors } from '../../utils/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
    },
    cardStyle: {
        margin: vh * 2,
        flex: 1,
        paddingVertical: vh * 1,
        paddingHorizontal: 0
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.black,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        paddingHorizontal: vw * 4,
        paddingVertical: vh * 1,
        backgroundColor: colors.white,
        zIndex: 100,
        width: vw * 92
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: colors.lightGray,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    plusBtn: {
        backgroundColor: colors.btnColor,
        justifyContent: "center",
        alignItems: "center",
        // width: vw * 6,
        // height: vw * 6,
        // borderRadius: vw * 3
        width: 30, height: 30,
        borderRadius: 15
    },
    plusText: {
        fontSize: fontSizes.f14,
        color: colors.white,
        fontWeight: "bold",
        paddingLeft: 2
    },
    newGroupButton: {
        flexDirection: "row",
        backgroundColor: colors.themeColor,
        borderRadius: 8,
        // paddingVertical: 8,
        // paddingHorizontal: 16,
        // marginRight: 8,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    newGroupButtonText: {
        color: colors.white,
        // paddingLeft: vh * 2
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterText: {
        marginRight: 4,
    },
    chatList: {
        paddingHorizontal: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',

    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    chatInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.black,
    },
    lastMessage: {
        fontSize: 14,
        color: colors.gray,
    },
    dotStyle: {
        width: vw * 1.5,
        height: vh * 3.8
    },
    chatActions: {
        alignItems: 'flex-end',
    },
    lastMessageTime: {
        fontSize: 12,
        color: colors.gray,
    },
    chatActionButton: {
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginVertical: 4,
    },
    chatActionButtonText: {
        fontSize: 12,
        color: colors.black,
    },

    inputContainer: {
        backgroundColor: colors.inputcolor,
        flexDirection: "row",
        alignItems: "center",
        width: vw * 50,
        alignSelf: "center",
        borderRadius: vw * 2,
        paddingHorizontal: vw * 4

    },
    searchIcon: {
        width: vw * 4,
        height: vh * 2,
        marginRight: vw * 2
    },
    chatContainer: {
        backgroundColor: colors.inputcolor,
        marginBottom: vh * 2,
        padding: vh * 2,
        borderRadius: 2
    },
    headerBtn: {
        backgroundColor: colors.btnColor,
        width: vw * 10,
        height: vw * 10,
        borderRadius: vw * 5,
        alignItems: "center",
        justifyContent: "center"
    },
    chatHead: {
        width: vw * 6,
        height: vw * 5
    },
    dropdownContainer: {
        // marginTop: vh * 1.4,
        width: vw * 30,

    },
    dropDown: {
        borderColor: colors.borderColor,
        // backgroundColor: colors.dateConatiner,
        backgroundColor: colors.white,
        borderWidth: 1,
    },
});
export default styles;
