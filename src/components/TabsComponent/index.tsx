// TabsComponent.tsx
import React from 'react';
import { FlatList, TouchableOpacity, Text, ViewStyle, TextStyle, StyleProp } from 'react-native';
import styles from './styles';
// import styles from './styles';

interface TabsComponentProps {
    tabs: string[];
    selectedTab: string;
    onTabPress: (tab: string) => void;
    tabStyle?: StyleProp<ViewStyle>;
    activeTabStyle?: StyleProp<ViewStyle>;
    tabTextStyle?: StyleProp<TextStyle>;
    activeTabTextStyle?: StyleProp<TextStyle>;
}

const TabsComponent: React.FC<TabsComponentProps> = ({
    tabs,
    selectedTab,
    onTabPress,
    tabStyle,
    activeTabStyle,
    tabTextStyle,
    activeTabTextStyle
}) => {
    return (
        <FlatList
            horizontal
            data={tabs}
            renderItem={({ item: tab }) => (
                <TouchableOpacity key={tab} onPress={() => onTabPress(tab)} style={[styles.tab, tabStyle, selectedTab === tab && [styles.activeTab, activeTabStyle]]}>
                    <Text style={[styles.tabText, tabTextStyle, selectedTab === tab && [styles.activeTabText, activeTabTextStyle]]}>{tab}</Text>
                </TouchableOpacity>
            )}
            keyExtractor={tab => tab}
            contentContainerStyle={styles.tabsContainer}
            showsHorizontalScrollIndicator={false}
        />
    );
};

export default TabsComponent;
