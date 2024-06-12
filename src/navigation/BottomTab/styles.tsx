import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

const styles = StyleSheet.create({
    tabStyle: {
        backgroundColor: colors.white,
        height: vh * 10,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonText: {
        fontSize: fontSizes.f12,
        marginTop: 4, // Add some margin between the icon and the text
    },
    icon: {
        width: vw * 5,
        height: vh * 5,
        resizeMode: 'contain', // Ensures the icons keep their aspect ratio
    },
});

export default styles;
