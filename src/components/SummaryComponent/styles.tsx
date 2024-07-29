// styles.js
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    summary: {
        fontSize: fontSizes.f20,
        color: colors.darkText
    },
    summaryContainer: {
        padding: 16,
        backgroundColor: colors.white,
        borderRadius: 8,
        marginHorizontal: vh * 2,
        marginVertical: vh * 4,

    },
    summaryTxtContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
    summaryText: { fontSize: fontSizes.f14, color: colors.black },
    summaryPrice: { fontSize: fontSizes.f14, color: colors.darkText },
    checkoutButton: { marginTop: 16, alignSelf: "center" },
    shoppingButton: { marginTop: 16, alignItems: 'center' },
    continueShoppingText: { fontSize: 16 },
    // Add other shared styles if needed
});

export default styles;
