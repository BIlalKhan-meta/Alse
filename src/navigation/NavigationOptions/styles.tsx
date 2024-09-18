import { StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../constant';
import { colors } from '../../utils/theme';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.headerColor,
        width: vw * 100
    },

    headerTitle: {
        color: colors.black,
        fontSize: fontSizes.f20,
        fontWeight: 'bold',
        width: vw * 80
    },
    headerTitleWhite: {
        color: colors.white,
        fontSize: fontSizes.f16,
        width: vw * 80
    },
    headericonStyle: {
        // marginLeft: vw * 2,
        width: vw * 5,
        height: vh * 3,
    },
    headericonButton: {
        marginRight: vw * 2.1,
        marginTop: vh * 2,
        width: vw * 5.5,
        height: vh * 5,
    },
    iconContainer: {
        backgroundColor: colors.headerGrey,
        height: vw * 10,
        width: vw * 10,
        borderRadius: vw * 5,
        alignItems: "center",
        justifyContent: "center"
    },
    notificationandshopcontainer: {
        marginLeft: 'auto',
        flexDirection: 'row',

        // marginRight:vw*1,
        // backgroundColor:'green',
    },
    notificationcontainer: {
        width: vw * 10,
        height: vh * 5,
        borderRadius: vw * 10,
        backgroundColor: colors.white,
        borderColor: colors.gray,
        // alignSelf: 'center',
        marginHorizontal: vw * 1,
    },
    notificationicon: {
        // alignSelf: 'center',
        // marginTop: vh * 1,
        width: "100%",
        height: "100%"
    },
    shopcontainer: {},
});
export default styles;
