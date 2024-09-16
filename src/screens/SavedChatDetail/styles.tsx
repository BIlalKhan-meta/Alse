import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { vw, vh } from '../../constant';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.headerColor,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,

    },
    chatIcon: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    chatTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.black,
    },
    chatSubtitle: {
        fontSize: 14,
        color: colors.gray,
    },
    messageContainer: {
        maxWidth: '70%',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    leftMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.lightColor,
    },
    rightMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.inputcolor, // You can customize the color here for right-side messages
    },
    messageText: {
        fontSize: 14,
        color: colors.black,
        marginBottom: 4,
    },
    messageTime: {
        fontSize: 12,
        color: colors.gray,
        alignSelf: 'flex-end',
    },
});

export default styles;
