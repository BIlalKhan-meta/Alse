import { Platform, StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../constant';
import { colors } from '../../utils/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        paddingHorizontal: 15,
        paddingTop: Platform.OS == "ios" ? vh * 10 : 10,
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
    icon: {
        width: 30,
        height: 30,
        marginLeft: 20,
    },
    title: {
        fontSize: fontSizes.f24,
        color: colors.black,
        fontWeight: "bold"
    },
    searchContainer: {
        flex: 1, // Ensures the container takes up full space in the header
        // flexDirection: 'row',
        // justifyContent: 'center', // Center horizontally
        // alignItems: 'center', // Center vertically
        // paddingHorizontal: 20, // Padding between left and right icons
        // height: 10,
        // marginLeft: vw * 6,
    },
    searchInput: {
        // flex: 1, // Take full width
        // marginHorizontal: 10, // Add space on left and right of TextInput
        backgroundColor: '#fff', // Example background color
        borderRadius: 8,
        // paddingVertical: 5,
        paddingHorizontal: 15, // Adjust horizontal padding for better input feel
        fontSize: 16,
        elevation: 2, // Adds shadow
        width: vw * 70,
        height: vh * 5
    },
    secondaryBtnCon: {
        flexDirection: "row",
        width: vw * 40,
        // backgroundColor: "yellow",
        justifyContent: "space-between",
        paddingHorizontal: vw * 1
    },
    secondaryBtn1: {
        width: vw * 18,
        height: vh * 5
    },
    secondaryBtn2: {
        width: vw * 18,
        height: vh * 5,
        backgroundColor: colors.white
    },
    buttonContainerStyle: {
        marginTop: vh * 1.4,
    },
    btnTxt: {
        fontSize: fontSizes.f10
    }
});

export default styles;
