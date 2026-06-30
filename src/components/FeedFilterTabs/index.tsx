import React from 'react';
import {Text, View} from 'react-native';
import {
  ScrollView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {useTranslation} from 'react-i18next';
import {FEED_FILTER_TABS, FeedFilterTab} from '../../utils/feedFilters';
import styles from './styles';

type FeedFilterTabsProps = {
  activeFilter: FeedFilterTab;
  onFilterChange: (filter: FeedFilterTab) => void;
};

const FeedFilterTabs: React.FC<FeedFilterTabsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        directionalLockEnabled
        contentContainerStyle={styles.scrollContent}>
        {FEED_FILTER_TABS.map(filter => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              testID={`feed-filter-${filter}`}
              accessibilityRole="button"
              accessibilityState={{selected: isActive}}
              activeOpacity={0.7}
              onPress={() => onFilterChange(filter)}
              style={[styles.tab, isActive && styles.tabActive]}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {t(`feed.filters.${filter}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FeedFilterTabs;
