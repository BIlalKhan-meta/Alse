// components/TabsComponent/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { vh, vw } from '../../constant';

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tab: {
        paddingVertical: vw * 2,
        paddingHorizontal: vw * 4,
        backgroundColor: colors.white,
        borderRadius: vw * 1,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",
        // width: vw * 20,
        height: vh * 5
    },
    activeTab: {
        backgroundColor: colors.blue,
    },
    tabText: {
        color: 'black',
    },
    activeTabText: {
        color: 'white',
    },
});

export default styles;
