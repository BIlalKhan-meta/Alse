import { StyleSheet } from 'react-native';
import { fontSizes, vh, vw } from '../../constant';
import { colors } from '../../utils/theme';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // paddingHorizontal: 15,
        // paddingTop: 50,
        // paddingBottom: vh * 34
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: vw * 4,
        marginVertical: vh * 2,
        zIndex: 1
    },
    label: {
        fontSize: fontSizes.f14,
        color: colors.darkGray,
    },
    selectionCon: {
        marginTop: vh * 1
    },
    checkoutButton: {
        alignSelf: "center",
        width: vw * 40,
        marginTop: 0
        // marginBottom: vh * 2
    },
    btnContainer: {
        marginTop: vh * 1,
        flexDirection: "row",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "space-between",
        // backgroundColor: "yellow",
        width: vw * 68,

    },


});

export default styles;