
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({

    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center"
        // marginTop: vh * 1
    },
    quantityButton: {
        // padding: 4,
        backgroundColor: colors.themeColor,
        width: vw * 8,
        height: vw * 8,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: vw * 4,
        // marginHorizontal: 5,

    },
    quantityButtonText: {
        fontSize: fontSizes.f16,
        color: colors.white,
        fontWeight: "bold",
        alignSelf: "center"
    },

    quantityText: {
        fontSize: 16,
        marginHorizontal: 10,
        color: colors.black
    },
    quantityText2: {
        fontSize: fontSizes.f12,
        color: colors.darkText
    },


});

export default styles;